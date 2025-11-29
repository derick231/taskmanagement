import React from "react";
import { Circle, CheckCircle2, Clock, AlertCircle, Eye } from "lucide-react";

const statusConfig = {
    TODO: {
        label: "To Do",
        color: "bg-slate-100 text-slate-700 border-slate-300",
        icon: Circle,
        iconColor: "text-slate-500",
    },
    IN_PROGRESS: {
        label: "In Progress",
        color: "bg-blue-100 text-blue-700 border-blue-300",
        icon: Clock,
        iconColor: "text-blue-600",
    },
    BLOCKED: {
        label: "Blocked",
        color: "bg-red-100 text-red-700 border-red-300",
        icon: AlertCircle,
        iconColor: "text-red-600",
    },
    REVIEW: {
        label: "In Review",
        color: "bg-purple-100 text-purple-700 border-purple-300",
        icon: Eye,
        iconColor: "text-purple-600",
    },
    COMPLETED: {
        label: "Completed",
        color: "bg-emerald-100 text-emerald-700 border-emerald-300",
        icon: CheckCircle2,
        iconColor: "text-emerald-600",
    },
};

export default function StatusBadge({ status, size = "md", showIcon = true }) {
    const config = statusConfig[status] || statusConfig.TODO;
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
            className={`inline-flex items-center gap-1.5 rounded-md border font-medium shadow-sm ${config.color} ${sizeClasses[size]}`}
        >
            {showIcon && <Icon className={`${iconSizes[size]} ${config.iconColor}`} />}
            {config.label}
        </span>
    );
}
