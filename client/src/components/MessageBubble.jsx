import React from "react";
import { Check, CheckCheck } from "lucide-react";

const MessageBubble = ({ message, isOwnMessage, user }) => {
  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase())
      .join("");
  };

  return (
    <div
      className={`flex items-start gap-3 mb-4 ${
        isOwnMessage ? "flex-row-reverse" : ""
      }`}
    >
      {/* Avatar */}
      {!isOwnMessage && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
          {getInitials(message.sender?.name || user?.name)}
        </div>
      )}

      {/* Message Content */}
      <div
        className={`flex flex-col max-w-[70%] ${
          isOwnMessage ? "items-end" : "items-start"
        }`}
      >
        {/* Sender Name (only for other's messages) */}
        {!isOwnMessage && (
          <span className="text-xs text-gray-500 font-medium mb-1 px-1">
            {message.sender?.name || user?.name || "Unknown"}
          </span>
        )}

        {/* Message Bubble */}
        <div
          className={`px-4 py-2.5 rounded-2xl ${
            isOwnMessage
              ? "bg-violet-600 text-white rounded-tr-sm"
              : "bg-gray-100 text-gray-900 rounded-tl-sm"
          }`}
        >
          <p className="text-sm leading-relaxed break-words">{message.text}</p>

          {/* Attachment if exists */}
          {message.attachment && (
            <div className="mt-2 pt-2 border-t border-white/20">
              <a
                href={message.attachment}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-xs underline ${
                  isOwnMessage ? "text-white/90" : "text-violet-600"
                }`}
              >
                View Attachment
              </a>
            </div>
          )}
        </div>

        {/* Timestamp and Status */}
        <div
          className={`flex items-center gap-1 mt-1 px-1 ${
            isOwnMessage ? "flex-row-reverse" : ""
          }`}
        >
          <span className="text-xs text-gray-400">
            {formatTime(message.createdAt)}
          </span>
          {isOwnMessage && (
            <CheckCheck className="h-3 w-3 text-violet-500" />
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
