import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Users,
    Settings,
    UserPlus,
    Trash2,
    Shield,
    Crown,
    ArrowLeft,
    Search,
    Loader2,
} from "lucide-react";

const OrganizationSettings = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [organization, setOrganization] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("members");
    const [showAddMember, setShowAddMember] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const authToken = localStorage.getItem("authToken");
    const api = "http://localhost:3000";

    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

    useEffect(() => {
        fetchOrganization();
    }, [id]);

    const fetchOrganization = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${api}/organizations/${id}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            if (res.ok) {
                const data = await res.json();
                setOrganization(data);
            } else {
                console.error("Failed to fetch organization");
            }
        } catch (error) {
            console.error("Error fetching organization:", error);
        } finally {
            setLoading(false);
        }
    };

    const removeMember = async (userId) => {
        if (!window.confirm("Are you sure you want to remove this member?")) {
            return;
        }

        try {
            const res = await fetch(`${api}/organizations/${id}/members/${userId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (res.ok) {
                fetchOrganization();
            } else {
                const error = await res.json();
                alert(error.error || "Failed to remove member");
            }
        } catch (error) {
            console.error("Error removing member:", error);
            alert("Failed to remove member");
        }
    };

    const isOwnerOrAdmin = () => {
        if (!organization) return false;
        if (organization.ownerId === currentUser.id) return true;
        const member = organization.members?.find((m) => m.userId === currentUser.id);
        return member?.role === "ADMIN";
    };

    const getRoleBadge = (role) => {
        const styles = {
            OWNER: "bg-purple-100 text-purple-700 border-purple-300",
            ADMIN: "bg-blue-100 text-blue-700 border-blue-300",
            MEMBER: "bg-gray-100 text-gray-700 border-gray-300",
        };

        const icons = {
            OWNER: <Crown className="h-3 w-3" />,
            ADMIN: <Shield className="h-3 w-3" />,
            MEMBER: <Users className="h-3 w-3" />,
        };

        return (
            <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[role]}`}
            >
                {icons[role]}
                {role}
            </span>
        );
    };

    const filteredMembers = organization?.members?.filter((member) => {
        const user = member.user;
        const query = searchQuery.toLowerCase();
        return (
            user.name?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query)
        );
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-violet-600 mx-auto mb-2" />
                    <p className="text-gray-600">Loading organization...</p>
                </div>
            </div>
        );
    }

    if (!organization) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-gray-600">Organization not found</p>
                    <button
                        onClick={() => navigate("/")}
                        className="mt-4 text-violet-600 hover:text-violet-700"
                    >
                        Go back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(`/organizations/${id}`)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {organization.name}
                                </h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    Organization Settings
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex gap-8">
                        <button
                            onClick={() => setActiveTab("members")}
                            className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${activeTab === "members"
                                    ? "border-violet-600 text-violet-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Members
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab("general")}
                            className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${activeTab === "general"
                                    ? "border-violet-600 text-violet-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Settings className="h-4 w-4" />
                                General
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === "members" && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        {/* Members Header */}
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Members
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Manage who has access to this organization
                                    </p>
                                </div>
                                {isOwnerOrAdmin() && (
                                    <button
                                        onClick={() => setShowAddMember(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                                    >
                                        <UserPlus className="h-4 w-4" />
                                        Add Member
                                    </button>
                                )}
                            </div>

                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search members..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Members List */}
                        <div className="divide-y divide-gray-200">
                            {filteredMembers?.map((member) => (
                                <div
                                    key={member.id}
                                    className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                            {member.user.name?.[0]?.toUpperCase() || "U"}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {member.user.name || "Unnamed User"}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {member.user.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {getRoleBadge(member.role)}
                                        {isOwnerOrAdmin() &&
                                            member.role !== "OWNER" &&
                                            member.userId !== currentUser.id && (
                                                <button
                                                    onClick={() => removeMember(member.userId)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Remove member"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredMembers?.length === 0 && (
                            <div className="p-12 text-center">
                                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No members found</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "general" && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            General Information
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Organization Name
                                </label>
                                <p className="text-gray-900">{organization.name}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <p className="text-gray-900">
                                    {organization.description || "No description"}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Slug
                                </label>
                                <p className="text-gray-900">{organization.slug}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Owner
                                </label>
                                <p className="text-gray-900">
                                    {organization.owner?.name || organization.owner?.email}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Member Modal */}
            {showAddMember && (
                <AddMemberModal
                    organizationId={id}
                    onClose={() => setShowAddMember(false)}
                    onSuccess={() => {
                        setShowAddMember(false);
                        fetchOrganization();
                    }}
                />
            )}
        </div>
    );
};

// Add Member Modal Component
const AddMemberModal = ({ organizationId, onClose, onSuccess }) => {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState("MEMBER");
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(false);
    const authToken = localStorage.getItem("authToken");
    const api = "http://localhost:3000";

    useEffect(() => {
        if (searchQuery.length >= 2) {
            searchUsers();
        } else {
            setUsers([]);
        }
    }, [searchQuery]);

    const searchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${api}/users?search=${searchQuery}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("Error searching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const addMember = async () => {
        if (!selectedUser) return;

        setAdding(true);
        try {
            const res = await fetch(`${api}/organizations/${organizationId}/members`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    userId: selectedUser.id,
                    role: selectedRole,
                }),
            });

            if (res.ok) {
                onSuccess();
            } else {
                const error = await res.json();
                alert(error.error || "Failed to add member");
            }
        } catch (error) {
            console.error("Error adding member:", error);
            alert("Failed to add member");
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Add Member</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Search for a user to add to this organization
                    </p>
                </div>

                <div className="p-6 space-y-4">
                    {/* Search Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search User
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* User Results */}
                    {loading && (
                        <div className="text-center py-4">
                            <Loader2 className="h-6 w-6 animate-spin text-violet-600 mx-auto" />
                        </div>
                    )}

                    {!loading && users.length > 0 && (
                        <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-48 overflow-y-auto">
                            {users.map((user) => (
                                <button
                                    key={user.id}
                                    onClick={() => setSelectedUser(user)}
                                    className={`w-full p-3 text-left hover:bg-gray-50 transition-colors ${selectedUser?.id === user.id ? "bg-violet-50" : ""
                                        }`}
                                >
                                    <p className="font-medium text-gray-900">
                                        {user.name || "Unnamed User"}
                                    </p>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Selected User */}
                    {selectedUser && (
                        <div className="bg-violet-50 border border-violet-200 rounded-lg p-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                                Selected User:
                            </p>
                            <p className="font-medium text-gray-900">
                                {selectedUser.name || "Unnamed User"}
                            </p>
                            <p className="text-sm text-gray-500">{selectedUser.email}</p>
                        </div>
                    )}

                    {/* Role Selection */}
                    {selectedUser && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Role
                            </label>
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                            >
                                <option value="MEMBER">Member</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        disabled={adding}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={addMember}
                        disabled={!selectedUser || adding}
                        className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {adding && <Loader2 className="h-4 w-4 animate-spin" />}
                        Add Member
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrganizationSettings;
