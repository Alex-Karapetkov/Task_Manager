// import Image from "next/image";
"use client"  // Next.js directive to mark component as client side component
import styles from "./page.module.css";
import React, { useEffect, useState } from "react"; // React hooks for managing side effects and component state
import TaskModal from "./components/TaskModal"

// Defines shape of Task object
type Task = {
  id: number;
  title: string;
  description?: string;
  due_date?: string;
  completed: boolean;
};


// State Management
export default function Home() {
  // tasks holds list of tasks fetched from the backend
  const [tasks, setTasks] = useState<Task[]>([]);

  // loading tracks whether data is still being fetched
  const [loading, setLoading] = useState(true);

  // error stores any error messages from the fetch
  const [error, setError] = useState<string | null>(null);

  // State to hold the currently selected task for editing
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // State to hold form data when editing a task
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    completed: false,
  });



  // Fetch tasks from backend; runs once on mount ([] dependency array)
  // updates tasks, loading, and error accordingly
  useEffect(() => {
    async function fetchTasks() {
      try {
        const response = await fetch("http://localhost:8000/tasks/"); // Change later
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data: Task[] = await response.json();
        setTasks(data);

      } catch (err) {
        setError("Failed to fetch tasks.");
        console.error(err);

      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, []);



  // When a task is selected, populate the form with its data
  useEffect(() => {
    if (selectedTask) {
      setFormData({
        title: selectedTask.title,
        description: selectedTask.description || "",
        due_date: selectedTask.due_date || "",
        completed: selectedTask.completed,
      });
    }
  }, [selectedTask]);


  // Handle form input changes
  // updates formdata state whenever a user interacts with a form input, whether its a text field, textarea, or checkbox
  // can handle multiple input types dynamically using the name attribute
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = e.target;   // destructures the event target

    if (type === "checkbox") {
      // typescript knows e.target is HTMLInputElement here, so checked exists
      // cast e.target as HTMLInputElement so can access .checked
      const target = e.target as HTMLInputElement;

      // setFormData updates the state by copying previous state and replacing field with new boolean value
      setFormData((prev) => ({
        ...prev,
        [name]: target.checked,
      }));

    } else {
      // for regular inputs and textareas, value contains user's input
      // updates relevant field using name as the key
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }

  // Submit updated task data to backend; triggered when user submits the edit form
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();   // stops browser from reloading page when form is submitted
    if (!selectedTask) return;  // exit function if no task selected

    try {
      // sends PUT request to backend API to update the task with the given id
      const response = await fetch(`http://localhost:8000/tasks/${selectedTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update task");

      // update local state; parses updated task from the response
      const updatedTask = await response.json();

      // Update tasks list locally
      // updates the tasks array by replacing the old version of the task with new one
      // uses .map() to create new array with updated task in the correct spot
      setTasks((prev) =>
        prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      );

      setSelectedTask(null);  // Close the edit form

    } catch (error) {
      alert("Error updating task");
      console.error(error);
    }
  }



  // JSX Block (syntax extension to javascript that lets you write HTML like markup inside js file)
  // Rendering logic for React component
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Your Tasks</h1>

        {/* if loading is true, shows message while tasks are being fetched */}
        {loading && <p>Loading tasks...</p>}

        {/* Shows error message in red if there is an error */}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {/* Shows message if no tasks are available/found */}
        {!loading && !error && tasks.length == 0 && <p>No tasks found.</p>}



        {/* Ordered list for tasks that exist */}
        {!loading && !error && tasks.length > 0 && (
          <ol>
            {tasks.map((task) => (
              <li
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className={`cursor-pointer p-2 rounded-md ${selectedTask?.id === task.id ? "font-bold" : "font-normal"
                  } ${task.completed ? "line-through text-gray-400" : "text-black"} mb-2}`}>

                <div className="mb-1">
                  <strong>{task.title}</strong>
                </div>

                {task.description && (
                  <div className="mb-1 text-gray-700">{task.description}</div>
                )}


                {task.due_date && (
                  <div className="mb-1 text-sm text-gray-500">
                    Due: {new Date(task.due_date).toLocaleDateString()}
                  </div>
                )}


                <div className="text-sm">{task.completed ? "Completed" : "Incomplete"}</div>
              </li>
            ))}
          </ol>
        )}

        {/* Modal for editing task */}
        <TaskModal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
        />

      </main>
    </div>
  );
}
