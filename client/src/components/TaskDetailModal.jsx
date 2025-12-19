import React, { useState } from "react";
import { X, Trash2, Loader2 } from "lucide-react";
import UserAvatar from "./UserAvatar";

export default function TaskDetailModal({ task, workspace, onClose, onUpdate, onDelete }) {
    const [formData, setFormData] = useState({
        name: task?.name || "",
        description: task?.description || "",
        priority: task?.priority || "NORMAL",
        status: task?.status || "TODO",
        dueDate: task?.dueDate ? task.dueDate.split("T")[0] : "",
    });
    const [selectedAssignees, setSelectedAssignees] = useState(
        task?.assignments?.map((a) => a.userId) || []
    );
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const authToken = localStorage.getItem("authToken");
    const members = workspace?.members || [];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch(`http://localhost:3000/tasks/${task.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    ...formData,
                    dueDate: formData.dueDate || null,
                }),
            });

            if (!res.ok) throw new Error("Failed to update task");

            // Update assignees if changed
            const currentAssigneeIds = task.assignments?.map((a) => a.userId) || [];
            const toAdd = selectedAssignees.filter((id) => !currentAssigneeIds.includes(id));
            const toRemove = currentAssigneeIds.filter((id) => !selectedAssignees.includes(id));

            for (const userId of toAdd) {
                await fetch(`http://localhost:3000/tasks/${task.id}/assign`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${authToken}`,
                    },
                    body: JSON.stringify({ userIds: [userId] }),
                });
            }

            for (const userId of toRemove) {
                await fetch(`http://localhost:3000/tasks/${task.id}/unassign`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${authToken}`,
                    },
                    body: JSON.stringify({ taskId: task.id, userId }),
                });
            }

            onUpdate?.();
            onClose();
        } catch (error) {
            console.error("Error updating task:", error);
            alert("Failed to update task");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this task?")) return;

        setDeleting(true);
        try {
            const res = await fetch(`http://localhost:3000/tasks/${task.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (!res.ok) throw new Error("Failed to delete task");

            onDelete?.();
            onClose();
        } catch (error) {
            console.error("Error deleting task:", error);
            alert("Failed to delete task");
        } finally {
            setDeleting(false);
        }
    };

    const toggleAssignee = (userId) => {
        setSelectedAssignees((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-violet-50 to-purple-50">
                    <h2 className="text-xl font-bold text-gray-900">Edit Task</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                    {/* Task Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Task Name *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                            placeholder="Enter task name..."
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                            placeholder="Add a description..."
                        />
                    </div>

                    {/* Priority & Status */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Priority
                            </label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                            >
                                <option value="LOW">🟢 Low</option>
                                <option value="NORMAL">🔵 Normal</option>
                                <option value="HIGH">🟠 High</option>
                                <option value="URGENT">🔴 Urgent</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                            >
                                <option value="TODO">📋 To Do</option>
                                <option value="IN_PROGRESS">⚡ In Progress</option>
                                <option value="REVIEW">👀 Review</option>
                                <option value="BLOCKED">🚫 Blocked</option>
                                <option value="COMPLETED">✅ Completed</option>
                            </select>
                        </div>
                    </div>

                    {/* Due Date */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Due Date
                        </label>
                        <input
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            min={new Date().toISOString().split("T")[0]}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        />
                    </div>

                    {/* Assignees */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Assign To
                        </label>
                        <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                            {members.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">No members available</p>
                            ) : (
                                members.map((member) => {
                                    const user = member.user || member;
                                    const userId = user.id;
                                    return (
                                        <label
                                            key={userId}
                                            className="flex items-center gap-3 p-2.5 hover:bg-white rounded-lg cursor-pointer transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedAssignees.includes(userId)}
                                                onChange={() => toggleAssignee(userId)}
                                                className="w-4 h-4 text-violet-600 rounded focus:ring-2 focus:ring-violet-500"
                                            />
                                            <UserAvatar user={user} size="sm" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{user.name || user.email}</p>
                                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                            </div>
                                        </label>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {deleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}
                        <span className="font-medium">Delete</span>
                    </button>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="px-5 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 flex items-center gap-2 font-medium shadow-sm"
                        >
                            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                            <span>Save Changes</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
