// contains different types used throughout project

export type Task = {
    id: number;
    title: string;
    description?: string;
    due_date?: string;
    completed: boolean;
};