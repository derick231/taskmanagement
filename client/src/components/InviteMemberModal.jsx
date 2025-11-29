import React, { useState } from "react";
import { X, Search, UserPlus, Loader2, Mail, Trash2, Shield, Eye, User } from "lucide-react";
import UserAvatar from "./UserAvatar";

export default function InviteMemberModal({ workspaceId, onClose, onMemberAdded, isManager, currentMembers = [] }) {
    const [activeTab, setActiveTab] = useState("invite"); // "invite" or "manage"
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("MEMBER");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [inviting, setInviting] = useState(false);
    const [removing, setRemoving] = useState(null);
    const [error, setError] = useState("");

    const authToken = localStorage.getItem("authToken");
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

    const searchUsers = async () => {
        if (!searchQuery.trim()) return;

        setSearching(true);
        setError("");
        try {
            const res = await fetch("http://localhost:3000/users", {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            const data = await res.json();
            const users = data.users || data || [];

            // Filter out users already in workspace
            const memberIds = currentMembers.map(m => m.user?.id || m.userId);
            const filtered = users.filter(
                (u) =>
                    !memberIds.includes(u.id) &&
                    (u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        u.name?.toLowerCase().includes(searchQuery.toLowerCase()))
            );
            setSearchResults(filtered);
        } catch (err) {
            setError("Failed to search users");
        } finally {
            setSearching(false);
        }
    };

    const inviteUser = async (userId) => {
        setInviting(true);
        setError("");
        try {
            const res = await fetch(`http://localhost:3000/workspaces/${workspaceId}/members`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({ userId, role }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to add member");
            }

            const data = await res.json();
            onMemberAdded?.(data.data);
            setSearchQuery("");
            setSearchResults([]);
            setActiveTab("manage");
        } catch (err) {
            setError(err.message);
        } finally {
            setInviting(false);
        }
    };

    const removeMember = async (memberId) => {
        if (!confirm("Are you sure you want to remove this member?")) return;

        setRemoving(memberId);
        setError("");
        try {
            const res = await fetch(`http://localhost:3000/workspaces/${workspaceId}/members/${memberId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to remove member");
            }

            onMemberAdded?.(); // Refresh data
        } catch (err) {
            setError(err.message);
        } finally {
            setRemoving(null);
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case "MANAGER": return <Shield className="h-4 w-4 text-violet-600" />;
            case "VIEWER": return <Eye className="h-4 w-4 text-gray-600" />;
            default: return <User className="h-4 w-4 text-blue-600" />;
        }
    };

    const getRoleBadge = (role) => {
        const colors = {
            MANAGER: "bg-violet-100 text-violet-700 border-violet-300",
            MEMBER: "bg-blue-100 text-blue-700 border-blue-300",
            VIEWER: "bg-gray-100 text-gray-700 border-gray-300",
        };
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-medium ${colors[role] || colors.MEMBER}`}>
                {getRoleIcon(role)}
                {role}
            </span>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-violet-50 to-purple-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-violet-600 rounded-lg flex items-center justify-center shadow-md">
                                <UserPlus className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Team Management</h2>
                                <p className="text-sm text-gray-500">Invite and manage workspace members</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                        >
                            <X className="h-5 w-5 text-gray-600" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={() => setActiveTab("invite")}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === "invite"
                                    ? "bg-white text-violet-700 shadow-sm"
                                    : "text-gray-600 hover:bg-white/50"
                                }`}
                        >
                            Invite Members
                        </button>
                        <button
                            onClick={() => setActiveTab("manage")}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === "manage"
                                    ? "bg-white text-violet-700 shadow-sm"
                                    : "text-gray-600 hover:bg-white/50"
                                }`}
                        >
                            Manage Members ({currentMembers.length})
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === "invite" ? (
                        <>
                            {/* Role Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Role
                                </label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                >
                                    <option value="MEMBER">👤 Member</option>
                                    <option value="MANAGER">🛡️ Manager</option>
                                    <option value="VIEWER">👁️ Viewer</option>
                                </select>
                                <p className="mt-2 text-xs text-gray-500">
                                    {role === "MANAGER" && "Can manage workspace, assign tasks, and add/remove members"}
                                    {role === "MEMBER" && "Can view and edit tasks, participate in discussions"}
                                    {role === "VIEWER" && "Can only view tasks and workspace content"}
                                </p>
                            </div>

                            {/* Search */}
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Search Users
                                </label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search by name or email..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && searchUsers()}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                        />
                                    </div>
                                    <button
                                        onClick={searchUsers}
                                        disabled={!searchQuery.trim() || searching}
                                        className="px-5 py-2.5 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                    >
                                        {searching ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            "Search"
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}

                            {/* Search Results */}
                            <div className="space-y-2">
                                {searchResults.length === 0 && searchQuery && !searching ? (
                                    <div className="text-center py-12">
                                        <Mail className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-sm font-medium text-gray-900">No users found</p>
                                        <p className="text-xs text-gray-500 mt-1">Try searching with a different name or email</p>
                                    </div>
                                ) : (
                                    searchResults.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-sm">
                                                    {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">{user.name || "Unnamed User"}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => inviteUser(user.id)}
                                                disabled={inviting}
                                                className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                            >
                                                {inviting ? "Adding..." : "Add"}
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Current Members List */}
                            <div className="space-y-2">
                                {currentMembers.length === 0 ? (
                                    <div className="text-center py-12">
                                        <UserPlus className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-sm font-medium text-gray-900">No members yet</p>
                                        <p className="text-xs text-gray-500 mt-1">Invite people to start collaborating</p>
                                    </div>
                                ) : (
                                    currentMembers.map((member) => {
                                        const user = member.user || member;
                                        const canRemove = isManager && user.id !== currentUser.id;

                                        return (
                                            <div
                                                key={member.id}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                                            >
                                                <div className="flex items-center gap-3 flex-1">
                                                    <UserAvatar user={user} size="md" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                                            {user.name || user.email}
                                                            {user.id === currentUser.id && (
                                                                <span className="ml-2 text-xs text-gray-500">(You)</span>
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                                    </div>
                                                    {getRoleBadge(member.role)}
                                                </div>
                                                {canRemove && (
                                                    <button
                                                        onClick={() => removeMember(member.id)}
                                                        disabled={removing === member.id}
                                                        className="ml-3 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                        title="Remove member"
                                                    >
                                                        {removing === member.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
