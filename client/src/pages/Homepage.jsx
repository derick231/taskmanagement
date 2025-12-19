import React, { useState, useEffect } from "react";
import {
  Plus,
  TrendingUp,
  Clock,
  CheckCircle2,
  Users,
  BarChart3,
  ArrowRight,
  FolderOpen,
} from "lucide-react";
import Sidebar from "../components/Sidebar";

const MainContent = () => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    teamMembers: 0,
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch("http://localhost:3000/dashboard/stats", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.data) {
          setStats(data.data.stats);
          setRecentTasks(data.data.recentTasks);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Good morning</h1>
            <p className="text-gray-600">Let's make today productive</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* New Task button removed */}
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="p-6">
        {/* Stats Cards */}
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalTasks}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              {/* Trend data is hardcoded as we don't have historical data yet */}
              <span className="text-green-500 font-medium">12%</span>
              <span className="text-gray-600 ml-1">from last week</span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-gray-900">{stats.completedTasks}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">8%</span>
              <span className="text-gray-600 ml-1">from last week</span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-3xl font-bold text-gray-900">{stats.inProgressTasks}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500 font-medium">No change</span>
              <span className="text-gray-600 ml-1">from last week</span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Team Members
                </p>
                <p className="text-3xl font-bold text-gray-900">{stats.teamMembers}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">2 new</span>
              <span className="text-gray-600 ml-1">this month</span>
            </div>
          </div>
        </div>

        {/* Recent Tasks and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Tasks */}
          <div className="lg:col-span-3 bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Tasks
                </h2>
                <button className="text-violet-600 hover:text-violet-700 font-medium text-sm flex items-center">
                  View all
                  <ArrowRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {recentTasks.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recent tasks</p>
              ) : (
                recentTasks.map((task, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{task.title}</h3>
                      <div className="flex items-center space-x-3 mt-1">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${task.status === "IN_PROGRESS"
                            ? "bg-yellow-100 text-yellow-800"
                            : task.status === "COMPLETED"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                            }`}
                        >
                          {task.status}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${task.priority === "HIGH" || task.priority === "URGENT"
                            ? "bg-red-100 text-red-800"
                            : task.priority === "NORMAL"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-green-100 text-green-800"
                            }`}
                        >
                          {task.priority || "NORMAL"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
                        </span>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )))}
            </div>
          </div>

          {/* Quick Actions removed as per request */}
        </div>
      </main>
    </div>
  );
};

// Main App Component
const TaskManagementHomepage = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <MainContent />
    </div>
  );
};

export default TaskManagementHomepage;
