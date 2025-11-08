import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles } from 'lucide-react';
import ProfileCard from '../components/ProfileCard';

interface Task {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'done';
  user_id: string;
  created_at: string;
}

interface Subtask {
  id: string;
  title: string;
  task_id: string;
  user_id: string;
  is_saved: boolean;
  created_at: string;
}

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subtasks, setSubtasks] = useState<Record<string, Subtask[]>>({});
  const [generatedSubtasks, setGeneratedSubtasks] = useState<Record<string, string[]>>({});
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [loading, setLoading] = useState(true);
  const [generatingSubtasks, setGeneratingSubtasks] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);

      if (data && data.length > 0) {
        const taskIds = data.map(t => t.id);
        const { data: subtasksData, error: subtasksError } = await supabase
          .from('subtasks')
          .select('*')
          .in('task_id', taskIds);

        if (subtasksError) throw subtasksError;

        const subtasksByTask: Record<string, Subtask[]> = {};
        subtasksData?.forEach(subtask => {
          if (!subtasksByTask[subtask.task_id]) {
            subtasksByTask[subtask.task_id] = [];
          }
          subtasksByTask[subtask.task_id].push(subtask);
        });
        setSubtasks(subtasksByTask);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || !user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            title: newTask.trim(),
            priority,
            status: 'pending',
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setTasks([data, ...tasks]);
      setNewTask('');
      setPriority('medium');
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleGenerateSubtasks = async (taskId: string, taskTitle: string) => {
    if (!user) return;

    setGeneratingSubtasks({ ...generatingSubtasks, [taskId]: true });
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No active session');
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-subtasks`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskTitle }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate subtasks');
      }

      const data = await response.json();
      setGeneratedSubtasks({ ...generatedSubtasks, [taskId]: data.subtasks || [] });
    } catch (error: any) {
      setError(error.message || 'Failed to generate subtasks');
    } finally {
      setGeneratingSubtasks({ ...generatingSubtasks, [taskId]: false });
    }
  };

  const handleSaveSubtask = async (taskId: string, subtaskTitle: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('subtasks')
        .insert([
          {
            title: subtaskTitle,
            task_id: taskId,
            user_id: user.id,
            is_saved: true,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setSubtasks({
        ...subtasks,
        [taskId]: [...(subtasks[taskId] || []), data],
      });

      setGeneratedSubtasks({
        ...generatedSubtasks,
        [taskId]: generatedSubtasks[taskId]?.filter(st => st !== subtaskTitle) || [],
      });
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleDeleteSubtask = async (taskId: string, subtaskId: string) => {
    try {
      const { error } = await supabase
        .from('subtasks')
        .delete()
        .eq('id', subtaskId);

      if (error) throw error;

      setSubtasks({
        ...subtasks,
        [taskId]: subtasks[taskId]?.filter(st => st.id !== subtaskId) || [],
      });
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: 'pending' | 'in-progress' | 'done') => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.filter(task => task.id !== taskId));
      const newSubtasks = { ...subtasks };
      delete newSubtasks[taskId];
      setSubtasks(newSubtasks);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'pending': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-300 via-blue-200 to-cyan-200 flex items-center justify-center">
        <div className="text-white text-2xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 via-blue-200 to-cyan-200 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold text-sky-600 mb-10 text-center">
            Your Tasks
          </h1>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleAddTask} className="mb-10">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="newTask"
                  className="block text-gray-700 font-semibold mb-2 text-lg"
                >
                  New Task
                </label>
                <input
                  type="text"
                  id="newTask"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-sky-200 rounded-lg focus:outline-none focus:border-sky-500 transition-colors text-gray-700"
                  placeholder="Enter a new task"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="priority"
                  className="block text-gray-700 font-semibold mb-2 text-lg"
                >
                  Priority
                </label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                  className="w-full px-4 py-3 border-2 border-sky-200 rounded-lg focus:outline-none focus:border-sky-500 transition-colors text-gray-700"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full px-8 py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 hover:from-sky-600 hover:to-blue-700"
              >
                Add Task
              </button>
            </div>
          </form>

          <div className="space-y-6 mb-8">
            {tasks.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No tasks yet. Create your first task above!
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200 hover:border-sky-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`w-3 h-3 rounded-full ${getStatusColor(task.status)}`}></span>
                        <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
                      </div>
                      <div className="flex gap-2 ml-6">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(task.priority)}`}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value as 'pending' | 'in-progress' | 'done')}
                        className="px-3 py-2 border-2 border-sky-200 rounded-lg focus:outline-none focus:border-sky-500 text-sm font-medium text-gray-700"
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>

                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold text-sm hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => handleGenerateSubtasks(task.id, task.title)}
                    disabled={generatingSubtasks[task.id]}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold text-sm hover:from-purple-600 hover:to-pink-600 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <Sparkles size={16} />
                    {generatingSubtasks[task.id] ? 'Generating...' : 'Generate Subtasks with AI'}
                  </button>

                  {generatedSubtasks[task.id] && generatedSubtasks[task.id].length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Suggested Subtasks:</p>
                      {generatedSubtasks[task.id].map((subtask, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                          <span className="text-sm text-gray-700">{subtask}</span>
                          <button
                            onClick={() => handleSaveSubtask(task.id, subtask)}
                            className="px-3 py-1 bg-sky-500 text-white rounded font-semibold text-xs hover:bg-sky-600 transition-colors"
                          >
                            Save
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {subtasks[task.id] && subtasks[task.id].length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Saved Subtasks:</p>
                      {subtasks[task.id].map((subtask) => (
                        <div key={subtask.id} className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200">
                          <span className="text-sm text-gray-700">{subtask.title}</span>
                          <button
                            onClick={() => handleDeleteSubtask(task.id, subtask.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded font-semibold text-xs hover:bg-red-600 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <button
            onClick={handleLogout}
            className="w-full px-8 py-4 bg-white border-2 border-sky-500 text-sky-600 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 hover:bg-sky-50"
          >
            Logout
          </button>
          </div>

          <div className="lg:col-span-1">
            <ProfileCard />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
