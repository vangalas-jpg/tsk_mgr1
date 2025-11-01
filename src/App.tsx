function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 via-blue-200 to-cyan-200 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-12 drop-shadow-lg">
          Welcome to My Task Manager
        </h1>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <button
            className="w-full sm:w-48 px-8 py-4 bg-white text-sky-600 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 hover:bg-sky-50"
            onClick={() => console.log('Login clicked')}
          >
            Login
          </button>

          <button
            className="w-full sm:w-48 px-8 py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 hover:from-sky-600 hover:to-blue-700"
            onClick={() => console.log('Signup clicked')}
          >
            Signup
          </button>

          <button
            className="w-full sm:w-48 px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 hover:bg-blue-50"
            onClick={() => console.log('Go to Dashboard clicked')}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
