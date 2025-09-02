// TaskCard component encapsulates each task in its own card UI

"use client"
import React from "react";
import { Task } from "../types"

type TaskCardProps = {
    task: Task;
    selected: boolean;
    onSelect: (task: Task) => void;
    onToggleCompleted: (id: number, value: boolean) => void;
}

export default function TaskCard({ task, selected, onSelect, onToggleCompleted }: TaskCardProps) {

    // function to calculate due date status badge
    const getDueStatus = (dateString: string) => {
        if (!dateString) return null;

        const due = new Date(dateString);
        const now = new Date();
        const diffMins = due.getTime() - now.getTime();   // how many milliseconds until or past the due date
        const diffHours = diffMins / (1000 * 60 * 60);   // convert milliseconds to hours

        if (diffHours < 0) return { label: "Overdue", color: "bg-red-500", text: "text-white" };
        if (diffHours <= 24) return { label: "Due Soon", color: "bg-yellow-500", text: "text-black"};
        return { label: null, color: "" }
    };

    const taskStatus = task.due_date ? getDueStatus(task.due_date) : null;

    return (

        <div
            onClick={() => onSelect(task)}
            className={`cursor-pointer p-4 rounded-xl shadow-md mb-4 transition hover:shadow-lg
            border-2 border-transparent hover:border-blue-600 font-serif
            bg-gray-200 ${selected ? "border-2 border-blue-500" : ""}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={(e) => onToggleCompleted(task.id, e.target.checked)}  // immediately updates backend
                        onClick={(e) => e.stopPropagation()}  // stop modal from opening
                        className="w-5 h-5 border-2 border-black rounded appearance-none 
                            bg-white checked:bg-green-500 relative
                            before:content-['✔'] before:text-white before:absolute
                            before:inset-0 before:flex before:items-center before:justify-center
                            before:text-transparent checked:before:text-black"
                    />
                    <div>
                        <strong className="text-xl">{task.title}</strong>
                        {task.description && <p className="text-black text-lg">{task.description}</p>}
                        {task.due_date && (
                            <div className="text-lg text-black mt-1">
                                Due: {new Date(task.due_date).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                                {taskStatus?.label && (
                                    <span className={`ml-2 px-2 py-0.5 rounded-full text-s font-medium ${taskStatus.color}
                                    ${taskStatus.text}`}>
                                        {taskStatus.label}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}