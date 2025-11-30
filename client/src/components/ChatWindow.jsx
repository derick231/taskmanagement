import React, { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Smile, MoreVertical, Users } from "lucide-react";
import MessageBubble from "./MessageBubble";
import { useSocket } from "../context/SocketProvider";

const ChatWindow = ({ room, user, onClose }) => {
    const { socket } = useSocket();
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const authToken = localStorage.getItem("authToken");
    const api = "http://localhost:3000";

    // Scroll to bottom when messages change
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load messages when room changes
    useEffect(() => {
        if (room?.id && socket) {
            loadMessages();
            // Join socket room for real-time updates
            socket.emit("join_chat_room", room.id);
            console.log("Joined chat room:", room.id);
        }

        return () => {
            if (room?.id && socket) {
                socket.emit("leave_chat_room", room.id);
                console.log("Left chat room:", room.id);
            }
        };
    }, [room?.id, socket]);

    // Listen for new messages via socket
    useEffect(() => {
        if (!socket || !room?.id) return;

        const handleNewMessage = (msg) => {
            console.log("Received new message:", msg);

            // Ignore messages from current user (already handled by optimistic update)
            if (msg.senderId === user.id) {
                console.log("Ignoring own message from socket");
                return;
            }

            // Only add message if it's for the current room
            if (msg.roomId === room.id) {
                setMessages((prev) => {
                    // Avoid duplicates
                    if (prev.some((m) => m.id === msg.id)) {
                        return prev;
                    }
                    return [...prev, msg];
                });
            }
        };

        socket.on("new_message", handleNewMessage);

        return () => {
            socket.off("new_message", handleNewMessage);
        };
    }, [socket, room?.id, user.id]);

    const loadMessages = async () => {
        if (!room?.id) return;
        setLoading(true);
        try {
            const res = await fetch(`${api}/messages/${room.id}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            const data = await res.json();
            setMessages(data);
        } catch (error) {
            console.error("Error loading messages:", error);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!text.trim() || !room?.id || sending) return;

        const tempMessage = {
            id: Date.now(),
            text: text.trim(),
            senderId: user.id,
            sender: user,
            roomId: room.id,
            createdAt: new Date().toISOString(),
        };

        // Optimistic update
        setMessages((prev) => [...prev, tempMessage]);
        const messageText = text.trim();
        setText("");

        setSending(true);
        try {
            const res = await fetch(`${api}/message`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    roomId: room.id,
                    senderId: user.id,
                    text: messageText,
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to send message");
            }

            const newMessage = await res.json();

            // Replace temp message with real one
            setMessages((prev) =>
                prev.map((m) => (m.id === tempMessage.id ? newMessage : m))
            );
        } catch (error) {
            console.error("Error sending message:", error);
            // Remove temp message on error
            setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
            setText(messageText); // Restore text
        } finally {
            setSending(false);
        }
    };

    const getRoomTitle = () => {
        if (!room) return "Select a chat";

        if (room.type === "PERSONAL") {
            // Find the other user
            const otherMember = room.members?.find((m) => m.userId !== user.id);
            return otherMember?.user?.name || "Personal Chat";
        } else if (room.type === "WORKSPACE") {
            return room.workspace?.name || "Workspace Chat";
        } else if (room.type === "BOARD") {
            return room.board?.name || "Board Chat";
        }
        return "Chat";
    };

    const getRoomSubtitle = () => {
        if (!room) return "";

        if (room.type === "PERSONAL") {
            const otherMember = room.members?.find((m) => m.userId !== user.id);
            return otherMember?.user?.email || "";
        } else if (room.type === "WORKSPACE" || room.type === "BOARD") {
            const memberCount = room.members?.length || 0;
            return `${memberCount} member${memberCount !== 1 ? "s" : ""}`;
        }
        return "";
    };

    if (!room) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="h-8 w-8 text-violet-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No chat selected
                    </h3>
                    <p className="text-sm text-gray-500">
                        Choose a conversation from the sidebar to start chatting
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-white">
            {/* Chat Header */}
            <div className="border-b border-gray-200 px-6 py-4 bg-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {getRoomTitle()[0]?.toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                {getRoomTitle()}
                            </h2>
                            {getRoomSubtitle() && (
                                <p className="text-xs text-gray-500">{getRoomSubtitle()}</p>
                            )}
                        </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="h-5 w-5 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-sm text-gray-500">Loading messages...</p>
                        </div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Send className="h-6 w-6 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-500">No messages yet</p>
                            <p className="text-xs text-gray-400 mt-1">
                                Start the conversation!
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {messages.map((msg) => (
                            <MessageBubble
                                key={msg.id}
                                message={msg}
                                isOwnMessage={msg.senderId === user.id}
                                user={user}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 px-6 py-4 bg-white">
                <form onSubmit={sendMessage} className="flex items-end gap-3">
                    <div className="flex-1 relative">
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage(e);
                                }
                            }}
                            placeholder="Type a message..."
                            rows={1}
                            className="w-full px-4 py-3 pr-24 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
                            style={{ minHeight: "48px", maxHeight: "120px" }}
                        />
                        <div className="absolute right-2 bottom-2 flex items-center gap-1">
                            <button
                                type="button"
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Add emoji"
                            >
                                <Smile className="h-4 w-4 text-gray-500" />
                            </button>
                            <button
                                type="button"
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Attach file"
                            >
                                <Paperclip className="h-4 w-4 text-gray-500" />
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={!text.trim() || sending}
                        className="px-5 py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Send className="h-4 w-4" />
                        <span className="hidden sm:inline">Send</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;
