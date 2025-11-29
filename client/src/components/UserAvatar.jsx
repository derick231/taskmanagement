import React from "react";

export default function UserAvatar({ user, size = "md", showTooltip = true }) {
    const sizeClasses = {
        sm: "h-6 w-6 text-xs",
        md: "h-8 w-8 text-sm",
        lg: "h-10 w-10 text-base",
        xl: "h-12 w-12 text-lg",
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name
            .split(" ")
            .slice(0, 2)
            .map((n) => n[0]?.toUpperCase())
            .join("");
    };

    const getColorFromName = (name) => {
        if (!name) return "bg-gray-400";
        const colors = [
            "bg-violet-500",
            "bg-blue-500",
            "bg-green-500",
            "bg-yellow-500",
            "bg-red-500",
            "bg-pink-500",
            "bg-indigo-500",
            "bg-purple-500",
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    return (
        <div className="relative group">
            <div
                className={`${sizeClasses[size]} ${getColorFromName(user?.name)} rounded-full flex items-center justify-center text-white font-semibold shadow-sm`}
            >
                {getInitials(user?.name)}
            </div>
            {showTooltip && user?.name && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    {user.name}
                    {user.role && <span className="text-gray-300 ml-1">({user.role})</span>}
                </div>
            )}
        </div>
    );
}

export function AvatarGroup({ users, max = 3, size = "md" }) {
    const displayUsers = users.slice(0, max);
    const remaining = users.length - max;

    return (
        <div className="flex -space-x-2">
            {displayUsers.map((user, index) => (
                <div key={user.id || index} className="relative">
                    <UserAvatar user={user} size={size} showTooltip={true} />
                </div>
            ))}
            {remaining > 0 && (
                <div
                    className={`${size === "sm" ? "h-6 w-6 text-xs" : size === "md" ? "h-8 w-8 text-sm" : "h-10 w-10 text-base"} rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold shadow-sm`}
                >
                    +{remaining}
                </div>
            )}
        </div>
    );
}
