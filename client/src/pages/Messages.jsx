import React, { useEffect, useState } from "react";
import { X, Users, Search, Loader2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";
import ChatSidebar from "../components/ChatSidebar";
import ChatWindow from "../components/ChatWindow";

export default function Messages() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const authToken = localStorage.getItem("authToken");

  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  const api = "http://localhost:3000";

  // Fetch user's chat rooms
  const fetchRooms = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`${api}/user/${user.id}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await res.json();
      setRooms(data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleRoomSelect = (room) => {
    setActiveRoom(room);
  };

  const handleNewChat = () => {
    setShowNewChatModal(true);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header with Back Button */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate("/dashboard")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Back to Dashboard"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Messages</h1>
      </div>

      {/* Chat Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Sidebar */}
        <ChatSidebar
          rooms={rooms}
          activeRoom={activeRoom}
          onRoomSelect={handleRoomSelect}
          onNewChat={handleNewChat}
          user={user}
        />

        {/* Chat Window */}
        <ChatWindow room={activeRoom} user={user} onRefreshRooms={fetchRooms} />
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <NewChatModal
          user={user}
          authToken={authToken}
          api={api}
          onClose={() => setShowNewChatModal(false)}
          onChatCreated={(room) => {
            setRooms((prev) => [room, ...prev]);
            setActiveRoom(room);
            setShowNewChatModal(false);
          }}
        />
      )}
    </div>
  );
}

// New Chat Modal Component
function NewChatModal({ user, authToken, api, onClose, onChatCreated }) {
  const [chatType, setChatType] = useState("personal");
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Fetch users for personal chat
  const fetchUsers = async (query) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/users", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await res.json();
      const filteredUsers = (data.users || data).filter(
        (u) =>
          u.id !== user.id &&
          (u.name?.toLowerCase().includes(query.toLowerCase()) ||
            u.email?.toLowerCase().includes(query.toLowerCase()))
      );
      setUsers(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch workspaces
  const fetchWorkspaces = async (query) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/workspaces", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await res.json();
      const filtered = (data.workspaces || data.data || data).filter((w) =>
        w.name?.toLowerCase().includes(query.toLowerCase())
      );
      setWorkspaces(filtered);
    } catch (error) {
      console.error("Error fetching workspaces:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch boards
  const fetchBoards = async (query) => {
    setLoading(true);
    try {
      // Note: We don't have a global search for boards yet, 
      // so this might need backend support or fetching from all workspaces
      setBoards([]);
    } catch (error) {
      console.error("Error fetching boards:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    setHasSearched(true);
    if (chatType === "personal") {
      fetchUsers(searchQuery);
    } else if (chatType === "workspace") {
      fetchWorkspaces(searchQuery);
    } else if (chatType === "board") {
      fetchBoards(searchQuery);
    }
  };

  // Reset when chat type changes
  const handleChatTypeChange = (type) => {
    setChatType(type);
    setSearchQuery("");
    setHasSearched(false);
    setUsers([]);
    setWorkspaces([]);
    setBoards([]);
  };

  const createPersonalChat = async (otherUserId) => {
    setCreating(true);
    try {
      const res = await fetch(`${api}/personal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          userA: user.id,
          userB: otherUserId,
        }),
      });
      const room = await res.json();
      onChatCreated(room);
    } catch (error) {
      console.error("Error creating personal chat:", error);
    } finally {
      setCreating(false);
    }
  };

  const createWorkspaceChat = async (workspaceId) => {
    setCreating(true);
    try {
      const res = await fetch(`${api}/workspace`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ workspaceId }),
      });
      const room = await res.json();
      onChatCreated(room);
    } catch (error) {
      console.error("Error creating workspace chat:", error);
    } finally {
      setCreating(false);
    }
  };

  const createBoardChat = async (boardId) => {
    setCreating(true);
    try {
      const res = await fetch(`${api}/board`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ boardId }),
      });
      const room = await res.json();
      onChatCreated(room);
    } catch (error) {
      console.error("Error creating board chat:", error);
    } finally {
      setCreating(false);
    }
  };

  const getFilteredItems = () => {
    if (chatType === "personal") return users;
    if (chatType === "workspace") return workspaces;
    if (chatType === "board") return boards;
    return [];
  };

  const filteredItems = getFilteredItems();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">New Chat</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Chat Type Tabs */}
          <div className="flex gap-2">
            {[
              { id: "personal", label: "Direct" },
              { id: "workspace", label: "Workspace" },
              { id: "board", label: "Board" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleChatTypeChange(tab.id)}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${chatType === tab.id
                  ? "bg-violet-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${chatType}s...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={!searchQuery.trim() || loading}
            className="w-full mt-3 px-4 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4">
          {!hasSearched ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mb-1">
                Search to find {chatType}s
              </p>
              <p className="text-xs text-gray-400">
                Enter a name or email and click Search
              </p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">No results found</p>
              <p className="text-xs text-gray-400 mt-1">
                Try a different search term
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {chatType === "personal" &&
                filteredItems.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => createPersonalChat(u.id)}
                    disabled={creating}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left disabled:opacity-50"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {u.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {u.name || "Unknown User"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{u.email}</p>
                    </div>
                  </button>
                ))}

              {chatType === "workspace" &&
                filteredItems.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => createWorkspaceChat(w.id)}
                    disabled={creating}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left disabled:opacity-50"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {w.name?.[0]?.toUpperCase() || "W"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {w.name}
                      </p>
                      {w.description && (
                        <p className="text-xs text-gray-500 truncate">
                          {w.description}
                        </p>
                      )}
                    </div>
                  </button>
                ))}

              {chatType === "board" &&
                filteredItems.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => createBoardChat(b.id)}
                    disabled={creating}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left disabled:opacity-50"
                  >
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {b.name}
                      </p>
                      {b.description && (
                        <p className="text-xs text-gray-500 truncate">
                          {b.description}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
