"use client"
import React, { useEffect } from "react";


type TaskModalProps = {
    isOpen: boolean;
    onClose: () => void;
    formData: {
        title: string;
        description: string;
        due_date: string | null;
        completed: boolean;
    };
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleSubmit: (e: React.FormEvent) => void;
    handleDelete: () => void;
};

export default function TaskModal({
    isOpen,
    onClose,
    formData,
    handleChange,
    handleSubmit,
    handleDelete
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
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="completed"
                            checked={formData.completed}
                            onChange={handleChange}
                            className="w-5 h-5 border rounded appearance-none 
                            bg-white checked:bg-green-500 relative
                            before:content-['✔'] before:text-white before:absolute
                            before:inset-0 before:flex before:items-center before:justify-center"
                        />

                        <input
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full border p-2 rounded-md bg-white text-lg font-bold"
                            placeholder="Task Name"
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
                            type="datetime-local"
                            name="due_date"
                            value={formData.due_date || ""}
                            onChange={handleChange}
                            className="w-full border p-2 rounded-md bg-white"
                        />
                    </label>

                    {formData.due_date && (
                        <button
                            type="button"
                            onClick={() =>
                                handleChange({
                                    target: { name: "due_date", value: null },
                                } as unknown as React.ChangeEvent<HTMLInputElement>)
                            }
                            className="text-sm text-red-500 mt-1">
                            Clear Due Date
                        </button>
                    )}


                    <div className="flex justify-between pt-4">
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="px-4 py-2 rounded-md bg-red-600 text-white">
                            Delete
                        </button>


                        <div className="flex gap-2">
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
                    </div>

                </form>
            </div>
        </div>
    );
}