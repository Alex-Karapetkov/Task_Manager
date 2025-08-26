"use client"
import React, { useEffect } from "react";
import styles from "../app/page.module.css";

type Task = {
    id: number;
    title: string;
    description?: string;
    due_date?: string;
    completed: boolean;
};

type TaskModalProps = {
    isOpen: boolean;
    onClose: () => void;
    formData: {
        title: string;
        description: string;
        due_date: string;
        completed: boolean;
    };
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleSubmit: (e: React.FormEvent) => void;
};

export default function TaskModal({
    isOpen,
    onClose,
    formData,
    handleChange,
    handleSubmit,
}: TaskModalProps) {
    if (!isOpen) return null;


    // allow user to close with ESC key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">Edit Task</h2>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <label className="block">
                        <input
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full border p-2 rounded-md bg-white text-lg font-bold"
                            required
                        />
                    </label>

                    <label className="block">
                        Description:
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full border p-2 rounded-md bg-white"
                        />
                    </label>

                    <label className="block">
                        Due Date:
                        <input
                            type="date"
                            name="due_date"
                            value={formData.due_date}
                            onChange={handleChange}
                            className="w-full border p-2 rounded-md bg-white"
                        />
                    </label>

                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="completed"
                            checked={formData.completed}
                            onChange={handleChange}
                        />
                        Completed
                    </label>

                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-md border">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-md bg-blue-600 text-white">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}