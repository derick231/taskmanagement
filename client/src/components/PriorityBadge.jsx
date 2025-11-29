import React from "react";
import { AlertCircle, Flame, TrendingUp, Minus } from "lucide-react";

const priorityConfig = {
    URGENT: {
        label: "Urgent",
        color: "bg-red-100 text-red-700 border-red-200",
        icon: Flame,
    },
    HIGH: {
        label: "High",
        color: "bg-orange-100 text-orange-700 border-orange-200",
        icon: AlertCircle,
    },
    NORMAL: {
        label: "Normal",
        color: "bg-blue-100 text-blue-700 border-blue-200",
        icon: TrendingUp,
    },
    LOW: {
        label: "Low",
        color: "bg-gray-100 text-gray-600 border-gray-200",
        icon: Minus,
    },
};

export default function PriorityBadge({ priority, size = "md", showIcon = true }) {
    const config = priorityConfig[priority] || priorityConfig.NORMAL;
    const Icon = config.icon;

    const sizeClasses = {
        sm: "text-xs px-2 py-0.5",
        md: "text-xs px-2.5 py-1",
        lg: "text-sm px-3 py-1.5",
    };

    const iconSizes = {
        sm: "h-3 w-3",
        md: "h-3.5 w-3.5",
        lg: "h-4 w-4",
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${config.color} ${sizeClasses[size]}`}
        >
            {showIcon && <Icon className={iconSizes[size]} />}
            {config.label}
        </span>
    );
}
