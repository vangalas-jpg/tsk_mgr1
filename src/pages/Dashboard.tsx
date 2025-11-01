function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 via-blue-200 to-cyan-200 flex items-center justify-center px-4 py-8">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold text-sky-600 mb-8 text-center">
            Dashboard
          </h1>
          <p className="text-gray-600 text-center text-lg">
            Welcome to your task dashboard!
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
