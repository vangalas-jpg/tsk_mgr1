import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 via-blue-200 to-cyan-200 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold text-sky-600 mb-8 text-center">
            Login
          </h1>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-gray-700 font-semibold mb-2 text-lg"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-sky-200 rounded-lg focus:outline-none focus:border-sky-500 transition-colors text-gray-700"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-gray-700 font-semibold mb-2 text-lg"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-sky-200 rounded-lg focus:outline-none focus:border-sky-500 transition-colors text-gray-700"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              className="w-full px-8 py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 hover:from-sky-600 hover:to-blue-700 mt-8"
            >
              Login
            </button>
          </form>

          <button
            onClick={() => navigate('/')}
            className="w-full mt-6 px-8 py-4 bg-white border-2 border-sky-500 text-sky-600 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 hover:bg-sky-50"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
