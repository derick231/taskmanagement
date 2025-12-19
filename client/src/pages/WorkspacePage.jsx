import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  Users,
  Plus,
  Settings,
  Loader2,
  UserPlus,
  Filter,
  X,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import BoardColumn from "../components/BoardColumn";
import TaskCard from "../components/TaskCard";
import TaskDetailModal from "../components/TaskDetailModal";
import CreateBoardModal from "../components/CreateBoardModal";
import InviteMemberModal from "../components/InviteMemberModal";
import { useSocket } from "../context/SocketProvider";

// Status-based columns configuration
const STATUS_COLUMNS = [
  { id: "TODO", name: "To Do", status: "TODO", color: "bg-slate-50" },
  { id: "IN_PROGRESS", name: "In Progress", status: "IN_PROGRESS", color: "bg-blue-50" },
  { id: "REVIEW", name: "In Review", status: "REVIEW", color: "bg-purple-50" },
  { id: "COMPLETED", name: "Completed", status: "COMPLETED", color: "bg-emerald-50" },
];

export default function WorkspacePage() {
  const { id: workspaceId } = useParams();
  const { socket, joinRoom, leaveRoom } = useSocket();
  const authToken = localStorage.getItem("authToken");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [workspace, setWorkspace] = useState(null);
  const [boards, setBoards] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [showInviteMember, setShowInviteMember] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    priority: "ALL",
    assignee: "ALL",
    search: "",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Fetch workspace data
  useEffect(() => {
    if (workspaceId) {
      fetchWorkspaceData();
      joinRoom?.(`workspace_${workspaceId}`);
    }

    return () => {
      if (workspaceId) {
        leaveRoom?.(`workspace_${workspaceId}`);
      }
    };
  }, [workspaceId]);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    socket.on("task_created", handleTaskUpdate);
    socket.on("task_updated", handleTaskUpdate);
    socket.on("task_deleted", handleTaskDeleted);
    socket.on("task_moved", handleTaskUpdate);

    return () => {
      socket.off("task_created", handleTaskUpdate);
      socket.off("task_updated", handleTaskUpdate);
      socket.off("task_deleted", handleTaskDeleted);
      socket.off("task_moved", handleTaskUpdate);
    };
  }, [socket]);

  const fetchWorkspaceData = async () => {
    setLoading(true);
    try {
      // Fetch workspace details
      const wsRes = await fetch(`http://localhost:3000/workspaces/${workspaceId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!wsRes.ok) {
        throw new Error("Failed to fetch workspace");
      }

      const wsData = await wsRes.json();
      const workspaceInfo = wsData.data || wsData;
      setWorkspace(workspaceInfo);

      // Fetch boards for this workspace (needed for creating new tasks)
      const boardsRes = await fetch(
        `http://localhost:3000/boards/workspace/${workspaceId}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (boardsRes.ok) {
        const boardsData = await boardsRes.json();
        setBoards(boardsData.data || boardsData || []);
      }

      // Fetch tasks directly to get them sorted by priority score
      const tasksRes = await fetch(
        `http://localhost:3000/tasks/workspace/${workspaceId}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData.data || []);
      }
    } catch (error) {
      console.error("Error fetching workspace data:", error);
      setWorkspace(null);
      setBoards([]);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdate = () => {
    fetchWorkspaceData();
  };

  const handleTaskDeleted = () => {
    fetchWorkspaceData();
    setSelectedTask(null);
  };

  const handleDragStart = (event) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id;
    const newStatus = over.id; // This is now the status (TODO, IN_PROGRESS, etc.)

    // Find the task
    const task = tasks.find((t) => t.id === taskId);

    if (!task || task.status === newStatus) return;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: newStatus }
          : t
      )
    );

    // API call to update status
    try {
      const res = await fetch(`http://localhost:3000/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update task status');
    } catch (error) {
      console.error("Error updating task status:", error);
      // Revert on error
      fetchWorkspaceData();
    }
  };

  const handleAddTask = async (status, taskName) => {
    try {
      // Use the first board or create a default one
      let boardId = boards[0]?.id;

      if (!boardId) {
        // Create a default board if none exists
        const boardRes = await fetch("http://localhost:3000/boards", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            name: "General",
            workspaceId: parseInt(workspaceId),
          }),
        });

        if (boardRes.ok) {
          const boardData = await boardRes.json();
          boardId = boardData.data?.id || boardData.id;
        }
      }

      const res = await fetch("http://localhost:3000/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: taskName,
          workspaceId: parseInt(workspaceId),
          boardId: boardId,
          priority: "NORMAL",
          status: status,
        }),
      });

      if (res.ok) {
        fetchWorkspaceData();
      }
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const getTasksForStatus = (status) => {
    let filteredTasks = tasks.filter((t) => t.status === status);

    // Apply filters
    if (filters.priority !== "ALL") {
      filteredTasks = filteredTasks.filter(t => t.priority === filters.priority);
    }

    if (filters.assignee !== "ALL") {
      filteredTasks = filteredTasks.filter(t =>
        t.assignments?.some(a => a.userId === parseInt(filters.assignee))
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredTasks = filteredTasks.filter(t =>
        t.name.toLowerCase().includes(searchLower) ||
        t.description?.toLowerCase().includes(searchLower)
      );
    }

    return filteredTasks;
  };

  const isManager = workspace?.managerId === currentUser.id ||
    workspace?.members?.some(m => m.userId === currentUser.id && m.role === "MANAGER");

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">Workspace not found</p>
        </div>
      </div>
    );
  }

  const allMembers = workspace.members?.map(m => m.user) || [];

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                {workspace.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {workspace.name}
                </h1>
                <p className="text-sm text-gray-500">{workspace.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${showFilters ? "bg-violet-100 text-violet-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </button>
              <button
                onClick={() => setShowInviteMember(true)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                <span>Invite</span>
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    placeholder="Search tasks..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="ALL">All Priorities</option>
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Assignee</label>
                  <select
                    value={filters.assignee}
                    onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="ALL">All Members</option>
                    {allMembers.map(member => (
                      <option key={member.id} value={member.id}>{member.name || member.email}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => setFilters({ priority: "ALL", assignee: "ALL", search: "" })}
                  className="mt-5 px-3 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Kanban Board - Status Based */}
        <div className="flex-1 overflow-hidden p-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-4 gap-4 h-full">
              {STATUS_COLUMNS.map((column) => (
                <BoardColumn
                  key={column.id}
                  board={column}
                  tasks={getTasksForStatus(column.status)}
                  onTaskClick={setSelectedTask}
                  onAddTask={(_, taskName) => handleAddTask(column.status, taskName)}
                />
              ))}
            </div>

            <DragOverlay>
              {activeTask ? <TaskCard task={activeTask} /> : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {/* Modals */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          workspace={workspace}
          onClose={() => setSelectedTask(null)}
          onUpdate={fetchWorkspaceData}
          onDelete={handleTaskDeleted}
        />
      )}

      {showInviteMember && (
        <InviteMemberModal
          workspaceId={workspaceId}
          onClose={() => setShowInviteMember(false)}
          onMemberAdded={fetchWorkspaceData}
          isManager={isManager}
          currentMembers={workspace.members || []}
        />
      )}
    </div>
  );
}
