import React, { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus, MoreHorizontal } from "lucide-react";
import TaskCard from "./TaskCard";

export default function BoardColumn({ board, tasks, onTaskClick, onAddTask }) {
    const { setNodeRef, isOver } = useDroppable({
        id: board.id,
    });

    const [showAddTask, setShowAddTask] = useState(false);
    const [newTaskName, setNewTaskName] = useState("");

    const handleAddTask = (e) => {
        e.preventDefault();
        if (newTaskName.trim()) {
            onAddTask(board.id, newTaskName.trim());
            setNewTaskName("");
            setShowAddTask(false);
        }
    };

    return (
        <div className="bg-gray-50 rounded-xl p-4 flex flex-col h-full min-w-0">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{board.name}</h3>
                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                        {tasks.length}
                    </span>
                </div>
                <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                    <MoreHorizontal className="h-4 w-4 text-gray-500" />
                </button>
            </div>

            {/* Add Task - Moved to Top */}
            <div className="mb-3">
                {showAddTask ? (
                    <form onSubmit={handleAddTask} className="space-y-2">
                        <input
                            type="text"
                            value={newTaskName}
                            onChange={(e) => setNewTaskName(e.target.value)}
                            placeholder="Enter task name..."
                            autoFocus
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                        />
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="flex-1 px-3 py-1.5 bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-700 transition-colors"
                            >
                                Add Task
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddTask(false);
                                    setNewTaskName("");
                                }}
                                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <button
                        onClick={() => setShowAddTask(true)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-white hover:shadow-sm rounded-lg transition-all border-2 border-dashed border-gray-300 hover:border-violet-400"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add task</span>
                    </button>
                )}
            </div>

            {/* Tasks List */}
            <div
                ref={setNodeRef}
                className={`flex-1 overflow-y-auto space-y-2 min-h-[100px] p-2 rounded-lg transition-all duration-200 ${isOver
                    ? "bg-violet-100 ring-2 ring-violet-400 ring-inset"
                    : "bg-transparent"
                    }`}
            >
                <SortableContext
                    items={tasks.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {tasks.map((task) => (
                        <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
                    ))}
                </SortableContext>

                {/* Empty State */}
                {tasks.length === 0 && !showAddTask && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                        No tasks yet
                    </div>
                )}
            </div>
        </div>
    );
}
