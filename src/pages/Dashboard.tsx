import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([
    'Finish homework',
    'Call John',
    'Buy groceries'
  ]);
  const [newTask, setNewTask] = useState('');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      setTasks([...tasks, newTask.trim()]);
      setNewTask('');
    }
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 via-blue-200 to-cyan-200 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold text-sky-600 mb-10 text-center">
            Your Tasks
          </h1>

          <ul className="space-y-4 mb-10">
            {tasks.map((task, index) => (
              <li
                key={index}
                className="flex items-center text-gray-700 text-lg"
              >
                <span className="w-2 h-2 bg-sky-500 rounded-full mr-4"></span>
                {task}
              </li>
            ))}
          </ul>

          <form onSubmit={handleAddTask} className="mb-8">
            <label
              htmlFor="newTask"
              className="block text-gray-700 font-semibold mb-3 text-lg"
            >
              New Task
            </label>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                id="newTask"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className="flex-1 px-4 py-3 border-2 border-sky-200 rounded-lg focus:outline-none focus:border-sky-500 transition-colors text-gray-700"
                placeholder="Enter a new task"
              />
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 hover:from-sky-600 hover:to-blue-700 whitespace-nowrap"
              >
                Add Task
              </button>
            </div>
          </form>

          <button
            onClick={handleLogout}
            className="w-full px-8 py-4 bg-white border-2 border-sky-500 text-sky-600 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 hover:bg-sky-50"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
