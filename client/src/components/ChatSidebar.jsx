import React, { useState } from "react";
import {
    Search,
    Plus,
    MessageSquare,
    Users,
    Hash,
    X,
    Loader2,
} from "lucide-react";

const ChatSidebar = ({ rooms, activeRoom, onRoomSelect, onNewChat, user }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState("all"); // all, personal, workspace, board

    const getFilteredRooms = () => {
        let filtered = rooms || [];

        // Filter by type
        if (filter !== "all") {
            filtered = filtered.filter((room) => {
                if (filter === "personal") return room.type === "PERSONAL";
                if (filter === "workspace") return room.type === "WORKSPACE";
                if (filter === "board") return room.type === "BOARD";
                return true;
            });
        }

        // Filter by search query
        if (searchQuery.trim()) {
            filtered = filtered.filter((room) => {
                const query = searchQuery.toLowerCase();
                const roomName = getRoomName(room).toLowerCase();
                return roomName.includes(query);
            });
        }

        return filtered;
    };

    const getRoomName = (room) => {
        if (!room) return "Unknown";

        if (room.type === "PERSONAL") {
            const otherMember = room.members?.find((m) => m.userId !== user?.id);
            return otherMember?.user?.name || "Personal Chat";
        } else if (room.type === "WORKSPACE") {
            return room.workspace?.name || "Workspace Chat";
        } else if (room.type === "BOARD") {
            return room.board?.name || "Board Chat";
        }
        return "Chat";
    };

    const getLastMessage = (room) => {
        if (!room.messages || room.messages.length === 0) {
            return "No messages yet";
        }
        const lastMsg = room.messages[0];
        return lastMsg.text || "Attachment";
    };

    const getLastMessageTime = (room) => {
        if (!room.messages || room.messages.length === 0) {
            return "";
        }
        const lastMsg = room.messages[0];
        const date = new Date(lastMsg.createdAt);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
            });
        } else if (diffInHours < 168) {
            // Less than a week
            return date.toLocaleDateString("en-US", { weekday: "short" });
        } else {
            return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            });
        }
    };

    const getRoomIcon = (room) => {
        if (room.type === "PERSONAL") {
            return (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                    {getRoomName(room)[0]?.toUpperCase()}
                </div>
            );
        } else if (room.type === "WORKSPACE") {
            return (
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                </div>
            );
        } else if (room.type === "BOARD") {
            return (
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Hash className="h-5 w-5 text-green-600" />
                </div>
            );
        }
    };

    const filteredRooms = getFilteredRooms();

    return (
        <div className="w-80 border-r border-gray-200 bg-white flex flex-col h-full">
            {/* Header */}
            <div className="px-4 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Messages</h2>
                    <button
                        onClick={onNewChat}
                        className="p-2 hover:bg-violet-100 rounded-lg transition-colors text-violet-600"
                        title="New chat"
                    >
                        <Plus className="h-5 w-5" />
                    </button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        </button>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mt-3">
                    {[
                        { id: "all", label: "All" },
                        { id: "personal", label: "Direct" },
                        { id: "workspace", label: "Workspace" },
                        { id: "board", label: "Boards" },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filter === tab.id
                                ? "bg-violet-100 text-violet-700"
                                : "text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
                {filteredRooms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full px-4 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <MessageSquare className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">
                            No conversations
                        </p>
                        <p className="text-xs text-gray-500 mb-4">
                            {searchQuery
                                ? "No results found"
                                : "Start a new chat to get started"}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={onNewChat}
                                className="px-4 py-2 bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-700 transition-colors"
                            >
                                New Chat
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredRooms.map((room) => (
                            <button
                                key={room.id}
                                onClick={() => onRoomSelect(room)}
                                className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors ${activeRoom?.id === room.id ? "bg-violet-50" : ""
                                    }`}
                            >
                                {/* Room Icon */}
                                {getRoomIcon(room)}

                                {/* Room Info */}
                                <div className="flex-1 min-w-0 text-left">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3
                                            className={`text-sm font-semibold truncate ${activeRoom?.id === room.id
                                                ? "text-violet-700"
                                                : "text-gray-900"
                                                }`}
                                        >
                                            {getRoomName(room)}
                                        </h3>
                                        <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                                            {getLastMessageTime(room)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 truncate">
                                        {getLastMessage(room)}
                                    </p>
                                </div>

                                {/* Unread indicator (placeholder for future) */}
                                {/* <div className="w-2 h-2 bg-violet-600 rounded-full flex-shrink-0 mt-2"></div> */}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatSidebar;
