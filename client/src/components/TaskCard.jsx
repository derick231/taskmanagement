import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Calendar, User, MoreVertical } from "lucide-react";
import PriorityBadge from "./PriorityBadge";
import StatusBadge from "./StatusBadge";
import { AvatarGroup } from "./UserAvatar";

export default function TaskCard({ task, onClick }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    // Format due date
    const formatDueDate = (date) => {
        if (!date) return null;
        const dueDate = new Date(date);
        const today = new Date();
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { text: "Overdue", color: "text-red-600" };
        if (diffDays === 0) return { text: "Today", color: "text-orange-600" };
        if (diffDays === 1) return { text: "Tomorrow", color: "text-yellow-600" };
        if (diffDays <= 7) return { text: `${diffDays}d`, color: "text-gray-600" };
        return { text: dueDate.toLocaleDateString(), color: "text-gray-500" };
    };

    const dueDate = formatDueDate(task.dueDate);
    const assignees = task.assignments?.map((a) => a.user) || [];

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group bg-white rounded-lg border border-gray-200 p-3 cursor-pointer hover:shadow-md transition-all ${isDragging ? "shadow-lg ring-2 ring-violet-500" : ""
                }`}
            onClick={onClick}
        >
            {/* Drag Handle & Title */}
            <div className="flex items-start gap-2">
                <button
                    {...attributes}
                    {...listeners}
                    className="mt-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <GripVertical className="h-4 w-4 text-gray-400" />
                </button>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {task.name}
                    </h4>
                    {task.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {task.description}
                        </p>
                    )}
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded">
                    <MoreVertical className="h-4 w-4 text-gray-400" />
                </button>
            </div>

            {/* Metadata */}
            <div className="mt-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Status Badge */}
                    <StatusBadge status={task.status} size="sm" />

                    {/* Priority Badge */}
                    <PriorityBadge priority={task.priority} size="sm" />

                    {/* Due Date */}
                    {dueDate && (
                        <div className={`flex items-center gap-1 text-xs ${dueDate.color}`}>
                            <Calendar className="h-3 w-3" />
                            <span>{dueDate.text}</span>
                        </div>
                    )}
                </div>

                {/* Assignees */}
                {assignees.length > 0 && (
                    <AvatarGroup users={assignees} size="sm" max={3} />
                )}
            </div>
        </div>
    );
}
