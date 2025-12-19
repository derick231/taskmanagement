import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Home,
    MessageSquare,
    FolderOpen,
    Building2,
    LogOut,
    Plus,
    ChevronDown,
    ChevronRight,
    Users,
    Settings,
    Search
} from "lucide-react";

export default function DashboardLayout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [organizations, setOrganizations] = useState([]);
    const [workspaces, setWorkspaces] = useState([]);
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [expandedOrg, setExpandedOrg] = useState(null);
    const [loading, setLoading] = useState(true);

    const authToken = localStorage.getItem("authToken");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    useEffect(() => {
        fetchOrganizations();
    }, []);

    useEffect(() => {
        if (selectedOrg) {
            fetchWorkspaces(selectedOrg.id);
        }
    }, [selectedOrg]);

    const fetchOrganizations = async () => {
        try {
            const res = await fetch("http://localhost:3000/organizations", {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            const data = await res.json();
            const orgs = data.organizations || data.data || [];
            setOrganizations(orgs);
            if (orgs.length > 0 && !selectedOrg) {
                setSelectedOrg(orgs[0]);
                setExpandedOrg(orgs[0].id);
            }
        } catch (error) {
            console.error("Error fetching organizations:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchWorkspaces = async (orgId) => {
        try {
            const res = await fetch(`http://localhost:3000/workspaces`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            const data = await res.json();
            const allWorkspaces = data.workspaces || data.data || [];
            const orgWorkspaces = allWorkspaces.filter(w => w.organizationId === orgId);
            setWorkspaces(orgWorkspaces);
        } catch (error) {
            console.error("Error fetching workspaces:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        navigate("/auth");
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Advanced Sidebar */}
            <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
                {/* Logo & User */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                            TaskManagement
                        </h1>
                        <button
                            onClick={() => navigate("/create-organization")}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="New Organization"
                        >
                            <Plus className="h-4 w-4 text-gray-600" />
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                            {user.name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{user.name || "User"}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                    </div>
                </div>

                {/* Quick Navigation */}
                <div className="p-4 border-b border-gray-200">
                    <div className="space-y-1">
                        <button
                            onClick={() => navigate("/dashboard")}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive("/dashboard")
                                ? "bg-violet-50 text-violet-600"
                                : "text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            <Home className="h-4 w-4" />
                            <span className="text-sm font-medium">Dashboard</span>
                        </button>
                        <button
                            onClick={() => navigate("/messages")}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive("/messages")
                                ? "bg-violet-50 text-violet-600"
                                : "text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            <MessageSquare className="h-4 w-4" />
                            <span className="text-sm font-medium">Messages</span>
                        </button>
                    </div>
                </div>

                {/* Organizations & Workspaces */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Workspaces
                        </h3>
                        <button
                            onClick={() => navigate("/workspace/create")}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title="New Workspace"
                        >
                            <Plus className="h-3 w-3 text-gray-500" />
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        </div>
                    ) : organizations.length === 0 ? (
                        <div className="text-center py-8">
                            <Building2 className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-xs text-gray-500 mb-3">No organizations yet</p>
                            <button
                                onClick={() => navigate("/create-organization")}
                                className="text-xs text-violet-600 hover:text-violet-700 font-medium"
                            >
                                Create your first organization
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {organizations.map((org) => (
                                <div key={org.id}>
                                    {/* Organization Header */}
                                    <button
                                        onClick={() => {
                                            setSelectedOrg(org);
                                            setExpandedOrg(expandedOrg === org.id ? null : org.id);
                                        }}
                                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${selectedOrg?.id === org.id
                                            ? "bg-violet-50 text-violet-600"
                                            : "text-gray-700 hover:bg-gray-50"
                                            }`}
                                    >
                                        {expandedOrg === org.id ? (
                                            <ChevronDown className="h-4 w-4 flex-shrink-0" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4 flex-shrink-0" />
                                        )}
                                        <Building2 className="h-4 w-4 flex-shrink-0" />
                                        <span className="text-sm font-medium truncate flex-1 text-left">
                                            {org.name}
                                        </span>
                                    </button>

                                    {/* Workspaces List */}
                                    {expandedOrg === org.id && (
                                        <div className="ml-6 mt-1 space-y-1">
                                            {workspaces.length === 0 ? (
                                                <p className="text-xs text-gray-400 px-3 py-2">No workspaces</p>
                                            ) : (
                                                workspaces.map((workspace) => (
                                                    <button
                                                        key={workspace.id}
                                                        onClick={() => navigate(`/workspace/${workspace.id}`)}
                                                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left ${location.pathname === `/workspace/${workspace.id}`
                                                            ? "bg-violet-100 text-violet-700"
                                                            : "text-gray-600 hover:bg-gray-50"
                                                            }`}
                                                    >
                                                        <FolderOpen className="h-3.5 w-3.5 flex-shrink-0" />
                                                        <span className="text-sm truncate">{workspace.name}</span>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-gray-200 space-y-2">
                    <button
                        onClick={() => navigate("/workspace/create")}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span className="text-sm font-medium">New Workspace</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="text-sm font-medium">Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                {children}
            </div>
        </div >
    );
}
