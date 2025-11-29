import React, { useState, useEffect } from "react";
import {
  Plus,
  Home,
  MessageSquare,
  LogOut,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Loader2,
  AlertCircle,
  RefreshCw,
  Settings,
} from "lucide-react";
import OrganizationSelector from "./OrganizationSelector";

const API_BASE_URL = "http://localhost:3000";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("dashboard");
  const [workspaces, setWorkspaces] = useState([]);
  const [user, setUser] = useState(null);
  const [currentOrg, setCurrentOrg] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const getAuthToken = () => {
    return (
      localStorage.getItem("authToken") ||
      sessionStorage.getItem("authToken") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("token")
    );
  };

  // API client with axios-like interface using fetch
  const apiClient = {
    get: async (endpoint) => {
      const token = getAuthToken();
      console.log(`Making GET request to: ${API_BASE_URL}${endpoint}`);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || errorData.error || `HTTP ${response.status}`
        );
      }

      return { data: await response.json() };
    },

    post: async (endpoint, data = {}) => {
      const token = getAuthToken();
      console.log(`Making POST request to: ${API_BASE_URL}${endpoint}`);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/login";
        throw new Error("Session expired. Please login again.");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || errorData.error || `HTTP ${response.status}`
        );
      }

      return { data: await response.json() };
    },
  };

  // Fetch workspaces from backend
  const fetchWorkspaces = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Fetching workspaces from backend...");
      const response = await apiClient.get("/workspaces");

      // Handle different possible response structures
      let workspacesData = [];
      if (response.data.workspaces) {
        workspacesData = response.data.workspaces;
      } else if (response.data.data) {
        workspacesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        workspacesData = response.data;
      } else {
        workspacesData = [];
      }

      // Filter by current organization if selected
      if (currentOrg) {
        workspacesData = workspacesData.filter(
          (w) => w.organizationId === currentOrg.id
        );
      }

      // Transform workspace data to ensure consistency
      const transformedWorkspaces = workspacesData.map((workspace, index) => ({
        id: workspace.id || index,
        name:
          workspace.name ||
          workspace.workspace_name ||
          `Workspace ${index + 1}`,
        description: workspace.description || "",
        color: getWorkspaceColor(workspace.name || workspace.id || index),
        role: workspace.role || workspace.user_role || "member",
        taskCount:
          workspace.task_count ||
          workspace.taskCount ||
          workspace.tasks?.length ||
          0,
        memberCount: workspace.member_count || workspace.memberCount || 1,
        createdAt: workspace.created_at || workspace.createdAt,
        updatedAt: workspace.updated_at || workspace.updatedAt,
        tags: workspace.tags || [],
      }));

      setWorkspaces(transformedWorkspaces);
      console.log(
        `Successfully loaded ${transformedWorkspaces.length} workspaces`
      );
    } catch (err) {
      console.error("Error fetching workspaces:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user profile from API
  const fetchUserProfile = async () => {
    try {
      // Assuming user data is stored in localStorage from login
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData) {
        setUser(userData);
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  // Generate consistent colors for workspaces
  const getWorkspaceColor = (identifier) => {
    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-green-500",
      "bg-red-500",
      "bg-yellow-500",
      "bg-indigo-500",
      "bg-pink-500",
      "bg-teal-500",
      "bg-orange-500",
      "bg-cyan-500",
      "bg-emerald-500",
      "bg-violet-500",
    ];

    if (!identifier) return "bg-gray-500";

    let hash = 0;
    const str = identifier.toString();
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }

    return colors[Math.abs(hash) % colors.length];
  };

  // Navigation handlers
  const handleNavItemClick = (item) => {
    setActiveItem(item.id);
    console.log(`Navigating to: ${item.label} (${item.path})`);
    if (item.path) {
      window.location.href = item.path;
    }
  };

  const handleWorkspaceClick = (workspace) => {
    setActiveItem(workspace.id);
    console.log(
      `Navigating to workspace: ${workspace.name} (ID: ${workspace.id})`
    );
    window.location.href = `/workspace/${workspace.id}`;
  };

  const handleAddWorkspace = () => {
    window.location.href = "/workspace/create";
  };

  const handleSettings = () => {
    window.location.href = "/settings";
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/auth";
    }
  };

  const handleRefresh = () => {
    console.log("Refreshing workspace data...");
    fetchWorkspaces();
  };

  // Load data on component mount
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      fetchUserProfile();
      fetchWorkspaces();
    } else {
      setIsLoading(false);
      setError("Please login to access your workspaces");
      console.log("No authentication token found");
    }
  }, [currentOrg]); // Re-fetch when org changes

  return (
    <div
      className={`bg-white border-r border-gray-200 h-screen flex flex-col transition-all duration-300 ${isCollapsed ? "w-16" : "w-72"
        }`}
    >
      {/* Header */}
      <div className="border-b border-gray-100">
        {!isCollapsed && (
          <OrganizationSelector
            user={user}
            currentOrg={currentOrg}
            onOrgChange={setCurrentOrg}
          />
        )}
        <div className="p-4 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">TaskFlow</h1>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Navigation Section */}
        {!isCollapsed && (
          <div className="px-3 py-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Navigation
            </h3>
          </div>
        )}

        {/* Main Navigation Links */}
        <div className="px-3 mb-6">
          {[
            { id: "dashboard", label: "Dashboard", icon: Home, path: "/dashboard" },
            { id: "messages", label: "Messages", icon: MessageSquare, path: "/messages" }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavItemClick(item)}
              className={`w-full flex items-center px-3 py-2.5 mb-1 text-sm font-medium rounded-lg transition-all duration-200 group ${activeItem === item.id
                ? "bg-violet-50 text-violet-700 shadow-sm"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                } ${isCollapsed ? "justify-center" : ""}`}
              title={isCollapsed ? item.label : ""}
            >
              <item.icon
                className={`h-5 w-5 transition-colors ${activeItem === item.id
                  ? "text-violet-600"
                  : "text-gray-400 group-hover:text-gray-600"
                  } ${isCollapsed ? "" : "mr-3"}`}
              />
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </div>

        {/* Navigation Items */}
        <div className="mt-6 px-3">
          {!isCollapsed && (
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Workspaces {workspaces.length > 0 && `(${workspaces.length})`}
              </h3>
              <div className="flex items-center space-x-1">
                <button
                  onClick={handleRefresh}
                  className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-500"
                  title="Refresh workspaces"
                  disabled={isLoading}
                >
                  <RefreshCw
                    className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`}
                  />
                </button>
                <button
                  onClick={handleAddWorkspace}
                  className="p-1.5 rounded-md hover:bg-violet-100 transition-colors text-violet-600 hover:text-violet-700"
                  title="Create new workspace"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-violet-600" />
              {!isCollapsed && (
                <span className="ml-2 text-sm text-gray-500">
                  Loading workspaces...
                </span>
              )}
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                {!isCollapsed && (
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">
                      Failed to load
                    </p>
                    <p className="text-xs text-red-600 mt-1">{error}</p>
                    <button
                      onClick={handleRefresh}
                      className="text-xs text-red-700 hover:text-red-900 underline mt-2"
                    >
                      Try again
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Workspaces List */}
          {!isLoading && !error && (
            <div className="space-y-2">
              {workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  onClick={() => handleWorkspaceClick(workspace)}
                  className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all hover:bg-gray-50 ${activeItem === workspace.id
                    ? "bg-violet-50 text-violet-700 border border-violet-200"
                    : "text-gray-700"
                    } ${isCollapsed ? "justify-center" : ""}`}
                  title={
                    isCollapsed
                      ? workspace.name
                      : workspace.description || workspace.name
                  }
                >
                  <div
                    className={`w-3 h-3 rounded-sm ${workspace.color} flex-shrink-0`}
                  ></div>
                  {!isCollapsed && (
                    <>
                      <FolderOpen
                        className={`h-4 w-4 ml-3 mr-3 ${activeItem === workspace.id
                          ? "text-violet-600"
                          : "text-gray-400"
                          }`}
                      />
                      <div className="flex-1 text-left min-w-0">
                        <div className="truncate font-medium">
                          {workspace.name}
                        </div>
                        {workspace.description && (
                          <div className="text-xs text-gray-500 truncate">
                            {workspace.description}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${activeItem === workspace.id
                            ? "bg-violet-100 text-violet-700"
                            : "bg-gray-100 text-gray-600"
                            }`}
                        >
                          {workspace.taskCount}
                        </span>
                      </div>
                    </>
                  )}
                </button>
              ))}

              {/* Add Workspace Button */}
              {!isCollapsed && (
                <button
                  onClick={handleAddWorkspace}
                  className="w-full flex items-center px-3 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all border-2 border-dashed border-gray-200 hover:border-gray-300"
                >
                  <Plus className="h-4 w-4 mr-3" />
                  <span>Add Workspace</span>
                </button>
              )}

              {/* Empty State */}
              {workspaces.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FolderOpen className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 font-medium">
                    No workspaces yet
                  </p>
                  <p className="text-xs text-gray-400 mb-3">
                    {currentOrg ? "Create a workspace in this org" : "Select an organization first"}
                  </p>
                  <button
                    onClick={handleAddWorkspace}
                    disabled={!currentOrg}
                    className="px-3 py-2 bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50"
                  >
                    Create Workspace
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* User Profile & Bottom Actions */}
      <div className="border-t border-gray-100 p-3">
        {/* User Info */}
        {!isCollapsed && user && (
          <div className="mb-3 px-3 py-2 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.email || ""}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-1">
          <button
            onClick={handleSettings}
            className={`w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 transition-colors ${isCollapsed ? "justify-center" : ""
              }`}
            title={isCollapsed ? "Settings" : ""}
          >
            <Settings className={`h-4 w-4 ${isCollapsed ? "" : "mr-3"}`} />
            {!isCollapsed && <span>Settings</span>}
          </button>

          <button
            onClick={handleLogout}
            className={`w-full flex items-center px-3 py-2 text-sm font-medium text-red-500 rounded-lg hover:bg-red-50 transition-colors ${isCollapsed ? "justify-center" : ""
              }`}
            title={isCollapsed ? "Logout" : ""}
          >
            <LogOut className={`h-4 w-4 ${isCollapsed ? "" : "mr-3"}`} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
