import React, { useState } from 'react';
import { 
  Plus, 
  Bell,
  Home,
  MessageSquare,
  Calendar,
  LogOut,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Loader2,
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle2,
  Users,
  BarChart3,
  ArrowRight
} from 'lucide-react';

// Sidebar Component
import Sidebar from '../components/Sidebar'

// Main Content Component
const MainContent = () => {
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
            <button className="bg-violet-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-violet-700 transition-colors flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>New Task</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-900">25</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">12%</span>
              <span className="text-gray-600 ml-1">from last week</span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-gray-900">18</p>
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
                <p className="text-3xl font-bold text-gray-900">7</p>
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
                <p className="text-sm font-medium text-gray-600">Team Members</p>
                <p className="text-3xl font-bold text-gray-900">12</p>
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
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Tasks</h2>
                <button className="text-violet-600 hover:text-violet-700 font-medium text-sm flex items-center">
                  View all
                  <ArrowRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {[
                { title: 'Update project documentation', status: 'In Progress', priority: 'High', dueDate: 'Today' },
                { title: 'Review team performance', status: 'Todo', priority: 'Medium', dueDate: 'Tomorrow' },
                { title: 'Prepare quarterly report', status: 'In Progress', priority: 'High', dueDate: 'This week' },
                { title: 'Client meeting preparation', status: 'Todo', priority: 'Low', dueDate: 'Next week' }
              ].map((task, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{task.title}</h3>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        task.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        task.priority === 'High' ? 'bg-red-100 text-red-800' : 
                        task.priority === 'Medium' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </span>
                      <span className="text-xs text-gray-500">{task.dueDate}</span>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6 space-y-3">
              <button className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center mr-3">
                  <Plus className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Create Task</p>
                  <p className="text-sm text-gray-500">Add a new task to your workspace</p>
                </div>
              </button>
              
              <button className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <FolderOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">New Workspace</p>
                  <p className="text-sm text-gray-500">Create a new project workspace</p>
                </div>
              </button>
              
              <button className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Invite Team</p>
                  <p className="text-sm text-gray-500">Add members to your workspace</p>
                </div>
              </button>
              
              <button className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">View Reports</p>
                  <p className="text-sm text-gray-500">Check your productivity stats</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Main App Component
const TaskFlowHomepage = () => {
  const handleWorkspaceClick = (workspaceId, workspaceName) => {
    console.log(`Clicked workspace: ${workspaceName} (ID: ${workspaceId})`);
  };

  const handleGroupClick = (workspaceId, groupId, groupName) => {
    console.log(`Clicked group: ${groupName} in workspace ${workspaceId}`);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        onWorkspaceClick={handleWorkspaceClick}
        onGroupClick={handleGroupClick}
      />
      <MainContent />
    </div>
  );
};

export default TaskFlowHomepage;