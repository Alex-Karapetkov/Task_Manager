// Top level imports and setup

// Next.js directive to mark component as client side component; important for using hooks like useState and useEffect
"use client"
import styles from "./page.module.css";
import React, { useEffect, useState } from "react"; // React hooks for managing side effects and component state
import TaskModal from "./components/TaskModal"  // child component used for editing tasks
import { Task } from "./types";   // import Task object (type def)
import TaskCard from "./components/TaskCard";


// Main component: Home; everything inside is part of component's logic and rendering
export default function Home() {
  // State Initialization and Management using useState hooks

  // tasks holds list of tasks fetched from the backend
  const [tasks, setTasks] = useState<Task[]>([]);

  // loading tracks whether data is still being fetched
  const [loading, setLoading] = useState(true);

  // error stores any error messages from the fetch
  const [error, setError] = useState<string | null>(null);

  // State to hold the currently selected task for editing
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // State to hold form data when editing a task
  const [formData, setFormData] = useState<{
    // specifies shape of state object using typescript type annotation
    title: string;
    description: string;
    due_date: string | null;
    completed: boolean;
  }>({
    // initializes state with default values
    title: "",
    description: "",
    due_date: null,
    completed: false,
  });

  // state to track whether new task is being created
  const [newTask, setNewTask] = useState(false);

  // state for current tab (either active or archived tasks)
  const [currentTab, setCurrentTab] = useState<"active" | "completed">("active");



  // Fetch tasks from backend; runs once when the component is created and inserted into DOM (mounts);
  // dependency array ([]) tells it to only run once after component mounts unless something in array changes
  // example of react side effect
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
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
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
        [name]:
          name === "due_date" && value === "" // normalize empty string
            ? null
            : value,
      }));
    }
  }

  // Submit updated task data to backend; triggered when user submits the edit form
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();   // stops browser from reloading page when form is submitted

    // normalize due_date
    const payload = {
      ...formData,
      due_date: formData.due_date === "" ? null : formData.due_date,
    };

    try {
      let response;
      if (selectedTask) {

        // editing existing task
        // sends PUT request to backend API to update the task with the given id
        response = await fetch(`http://localhost:8000/tasks/${selectedTask.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

      } else {
        // creating new task
        response = await fetch("http://localhost:8000/tasks/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) throw new Error("Failed to save task");

      // update local state; parses updated task from the response
      const savedTask = await response.json();

      // Update tasks list locally
      // updates the tasks array by replacing the old version of the task with new one
      // uses .map() to create new array with updated task in the correct spot
      setTasks((prev) => {
        if (selectedTask) {
          // replace updated task
          return prev.map((task) => (task.id === savedTask.id ? savedTask : task));
        } else {
          // add new task at the top
          return [savedTask, ...prev]
        }
      });

      setSelectedTask(null);  // Close modal if editing
      setNewTask(false);   // close modal if creating new task
      setFormData({ title: "", description: "", due_date: null, completed: false });  // reset form

    } catch (error) {
      alert("Error saving task");
      console.error(error);
    }
  }


  // delete a task
  async function handleDelete() {
    if (!selectedTask) return;

    try {
      const response = await fetch(`http://localhost:8000/tasks/${selectedTask.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete task");

      // remove task locally by updating tasklist
      // takes prev state and creates new array using filter where tasks are added if not equal to selected task (task to be deleted)
      setTasks((prev) => prev.filter((task) => task.id !== selectedTask.id));
      setSelectedTask(null);  // close modal
    } catch (error) {
      alert("Error deleting task");
      console.error(error);
    }

  }

  // function to handle checkbox update logic; instantly updates backend when checked/unchecked
  const handleToggleCompleted = async (taskId: number, newValue: boolean) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const response = await fetch(`http://localhost:8000/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...task, completed: newValue }),
      });

      if (!response.ok) throw new Error("Failed to update task");

      const updatedTask = await response.json();

      // update state
      setTasks((prev) =>
        prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    } catch (err) {
      console.error(err);
    }
  };


  // JSX Block (syntax extension to javascript that lets you write HTML like markup inside javascript)
  // Rendering logic for React component
  return (
    <div className={styles.page}>
      <main className={styles.main}>

        {/* if loading is true, shows message while tasks are being fetched */}
        {loading && <p>Loading tasks...</p>}

        {/* Shows error message in red if there is an error */}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {/* Shows message if no tasks are available/found */}
        {/* Example of conditional rendering */}
        {!loading && !error && tasks.length == 0 && <p>No tasks found.</p>}


        {/* Ordered list for tasks that exist */}
        {!loading && !error && tasks.length > 0 && (

          <> {/* fragment wrapper; groups add task button and list of tasks without adding visible wrapper element like div */}

            {/* tab bar */}
            <div className="absolute top-4 left-4">
              <div className="flex justify-center mb-4 space-x-4">
                <button
                  onClick={() => setCurrentTab("active")}
                  className={`px-4 py-2 rounded-md font-semibold transition
                ${currentTab === "active" ? "bg-blue-600 text-white" : "bg-gray-200 text-black hover:bg-gray-300"}`}>
                  Active Tasks
                </button>

                <button
                  onClick={() => setCurrentTab("completed")}
                  className={`px-4 py-2 rounded-md font-semibold transition
                  ${currentTab === "completed" ? "bg-blue-600 text-white" : "bg-gray-200 text-black hover:bg-gray-300"}`}>
                  Archived Tasks
                </button>
              </div>
            </div>



            {/* header row */}
            <div className="flex items-center justify-between w-full">
              <h1 className="flex-1 text-5xl font-bold text-center font-serif">Today's Tasks</h1>

              {/* button to add new task */}
              <button
                onClick={() => {
                  setNewTask(true);
                  setFormData({ title: "", description: "", due_date: null, completed: false });
                  setSelectedTask(null);  // no selected task yet
                }}
                className="m-4 p-2 bg-gray-200 text-black rounded-md font-serif font-bold
              transition hover:shadow-lg border-2 border-transparent hover:border-blue-600">
                + New Task
              </button>
            </div>



            {/* logic for tab bar; filter tasks based on tab (whether they are active or completed) */}

            {currentTab === "active" && tasks.filter(t => !t.completed).length === 0 && (
              <p>No active tasks.</p>
            )}

            {currentTab === "completed" && tasks.filter(t => t.completed).length === 0 && (
              <p>No completed tasks.</p>
            )}

            {currentTab === "active" && tasks.filter(t => !t.completed).map(task => (
              <TaskCard
                key={task.id}
                task={task}
                selected={selectedTask?.id === task.id}
                onSelect={setSelectedTask}
                onToggleCompleted={handleToggleCompleted}
              />
            ))}


            {currentTab === "completed" && tasks.filter(t => t.completed).map(task => (
              <TaskCard
                key={task.id}
                task={task}
                selected={selectedTask?.id === task.id}
                onSelect={setSelectedTask}
                onToggleCompleted={handleToggleCompleted}
              />
            ))}
          </>
        )}

        {/* Modal for editing task */}
        {/* Child component; pass it props like isOpen, onClose, etc => component composition */}
        <TaskModal
          isOpen={!!selectedTask || newTask}
          onClose={() => {
            setSelectedTask(null);
            setNewTask(false);
          }}
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          handleDelete={handleDelete}
        />

      </main>
    </div >
  );
}
