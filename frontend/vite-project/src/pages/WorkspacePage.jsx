import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  MoreHorizontal, 
  Calendar, 
  User, 
  Flag, 
  Search,
  Filter,
  Settings,
  Users,
  ChevronDown,
  Edit3,
  Trash2,
  Clock,
  CheckCircle2
} from 'lucide-react';

const WorkspaceBoard = () => {
  const [workspace, setWorkspace] = useState({
    id: 1,
    name: "Product Development",
    description: "Main workspace for product development tasks"
  });

  const [groups, setGroups] = useState([
    {
      id: 1,
      name: "To Do",
      isPermanent: true,
      taskCount: 0,
      color: "#6B7280"
    },
    {
      id: 2,
      name: "In Progress", 
      isPermanent: false,
      taskCount: 0,
      color: "#3B82F6"
    },
    {
      id: 3,
      name: "Complete",
      isPermanent: true,
      taskCount: 0,
      color: "#10B981"
    }
  ]);

  const [tasks, setTasks] = useState([
    {
      id: 1,
      name: "Design homepage mockup",
      description: "Create wireframes and high-fidelity mockups for the new homepage",
      priority: "HIGH",
      dueDate: "2025-08-15",
      groupId: 1,
      assignments: [
        { id: 1, user: { name: "John Doe", email: "john@example.com" }, role: "ASSIGNEE" }
      ],
      createdAt: "2025-08-10"
    },
    {
      id: 2,
      name: "Implement authentication",
      description: "Set up user login and registration system",
      priority: "HIGH",
      dueDate: "2025-08-20",
      groupId: 2,
      assignments: [
        { id: 2, user: { name: "Jane Smith", email: "jane@example.com" }, role: "ASSIGNEE" }
      ],
      createdAt: "2025-08-09"
    },
    {
      id: 3,
      name: "Write unit tests",
      description: "Create comprehensive unit tests for core functionality",
      priority: "NORMAL",
      dueDate: "2025-08-25",
      groupId: 3,
      assignments: [
        { id: 3, user: { name: "Mike Johnson", email: "mike@example.com" }, role: "ASSIGNEE" }
      ],
      createdAt: "2025-08-08"
    }
  ]);

  const [newTaskGroup, setNewTaskGroup] = useState(null);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({
    name: '',
    description: '',
    priority: 'NORMAL',
    dueDate: '',
    assigneeEmail: ''
  });

  const [draggedTask, setDraggedTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('ALL');

  // Update task counts
  useEffect(() => {
    const updatedGroups = groups.map(group => ({
      ...group,
      taskCount: tasks.filter(task => task.groupId === group.id).length
    }));
    setGroups(updatedGroups);
  }, [tasks]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600 bg-red-50 border-red-200';
      case 'NORMAL': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'LOW': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority) => {
    return <Flag className={`w-3 h-3 ${priority === 'HIGH' ? 'text-red-500' : priority === 'NORMAL' ? 'text-blue-500' : 'text-gray-500'}`} />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const handleCreateTask = (groupId) => {
    setNewTaskGroup(groupId);
    setShowNewTaskForm(true);
    setNewTask({
      name: '',
      description: '',
      priority: 'NORMAL',
      dueDate: '',
      assigneeEmail: ''
    });
  };

  const handleSubmitTask = () => {
    if (!newTask.name.trim()) return;

    const task = {
      id: Date.now(),
      name: newTask.name,
      description: newTask.description,
      priority: newTask.priority,
      dueDate: newTask.dueDate,
      groupId: newTaskGroup,
      assignments: newTask.assigneeEmail ? [{
        id: Date.now(),
        user: { name: newTask.assigneeEmail.split('@')[0], email: newTask.assigneeEmail },
        role: 'ASSIGNEE'
      }] : [],
      createdAt: new Date().toISOString()
    };

    setTasks([...tasks, task]);
    setShowNewTaskForm(false);
    setNewTaskGroup(null);
  };

  const handleDragStart = (task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, groupId) => {
    e.preventDefault();
    if (draggedTask && draggedTask.groupId !== groupId) {
      const updatedTasks = tasks.map(task =>
        task.id === draggedTask.id ? { ...task, groupId } : task
      );
      setTasks(updatedTasks);
    }
    setDraggedTask(null);
  };

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterPriority === 'ALL' || task.priority === filterPriority;
    return matchesSearch && matchesFilter;
  });

  const addNewGroup = () => {
    const groupName = prompt('Enter group name:');
    if (groupName) {
      const newGroup = {
        id: Date.now(),
        name: groupName,
        isPermanent: false,
        taskCount: 0,
        color: "#8B5CF6"
      };
      setGroups([...groups, newGroup]);
    }
  };

  const deleteGroup = (groupId) => {
    const group = groups.find(g => g.id === groupId);
    if (group?.isPermanent) {
      alert('Cannot delete permanent groups');
      return;
    }
    
    if (confirm('Delete this group? All tasks will be moved to "To Do"')) {
      // Move tasks to "To Do" group
      const todoGroup = groups.find(g => g.name === "To Do");
      const updatedTasks = tasks.map(task =>
        task.groupId === groupId ? { ...task, groupId: todoGroup.id } : task
      );
      setTasks(updatedTasks);
      setGroups(groups.filter(g => g.id !== groupId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{workspace.name}</h1>
              <p className="text-sm text-gray-600">{workspace.description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High</option>
              <option value="NORMAL">Normal</option>
              <option value="LOW">Low</option>
            </select>

            <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Users className="w-4 h-4" />
              <span>Members</span>
            </button>
            
            <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="p-6">
        <div className="flex space-x-6 overflow-x-auto pb-4">
          {groups.map((group) => (
            <div
              key={group.id}
              className="flex-shrink-0 w-80 bg-gray-100 rounded-lg p-4"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, group.id)}
            >
              {/* Group Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: group.color }}
                  ></div>
                  <h3 className="font-semibold text-gray-900">{group.name}</h3>
                  <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
                    {group.taskCount}
                  </span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleCreateTask(group.id)}
                    className="p-1 text-gray-500 hover:text-gray-700 hover:bg-white rounded"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  {!group.isPermanent && (
                    <button
                      onClick={() => deleteGroup(group.id)}
                      className="p-1 text-gray-500 hover:text-red-600 hover:bg-white rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button className="p-1 text-gray-500 hover:text-gray-700 hover:bg-white rounded">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tasks */}
              <div className="space-y-3 min-h-[200px]">
                {filteredTasks
                  .filter(task => task.groupId === group.id)
                  .map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task)}
                      className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-move"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 flex-1">{task.name}</h4>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {/* Priority */}
                          <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                            {getPriorityIcon(task.priority)}
                            <span>{task.priority}</span>
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          {/* Due Date */}
                          {task.dueDate && (
                            <span className={`inline-flex items-center space-x-1 text-xs ${isOverdue(task.dueDate) ? 'text-red-600' : 'text-gray-500'}`}>
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(task.dueDate)}</span>
                            </span>
                          )}
                          
                          {/* Assignee */}
                          {task.assignments.length > 0 && (
                            <div className="flex -space-x-1">
                              {task.assignments.slice(0, 2).map((assignment, index) => (
                                <div
                                  key={assignment.id}
                                  className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                                  title={assignment.user.name}
                                >
                                  {assignment.user.name.charAt(0).toUpperCase()}
                                </div>
                              ))}
                              {task.assignments.length > 2 && (
                                <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white">
                                  +{task.assignments.length - 2}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Add Task Button */}
              <button
                onClick={() => handleCreateTask(group.id)}
                className="w-full mt-3 p-3 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
              >
                <Plus className="w-4 h-4 mx-auto" />
              </button>
            </div>
          ))}

          {/* Add New Group */}
          <div className="flex-shrink-0 w-80">
            <button
              onClick={addNewGroup}
              className="w-full h-32 bg-gray-100 hover:bg-gray-200 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
            >
              <div className="text-center">
                <Plus className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Add Group</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* New Task Modal */}
      {showNewTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Create New Task</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Name *
                </label>
                <input
                  type="text"
                  value={newTask.name}
                  onChange={(e) => setNewTask({...newTask, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter task name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Enter task description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="HIGH">High</option>
                    <option value="NORMAL">Normal</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assignee Email
                </label>
                <input
                  type="email"
                  value={newTask.assigneeEmail}
                  onChange={(e) => setNewTask({...newTask, assigneeEmail: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter assignee email"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleSubmitTask}
                disabled={!newTask.name.trim()}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Create Task
              </button>
              <button
                onClick={() => setShowNewTaskForm(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceBoard;