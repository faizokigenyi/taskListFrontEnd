import { useEffect, useState } from "react";
import Sidebar from "./SideBarForm";
import TaskForm from "./TaskForm";

type Task = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
};

type TodoProps = {
  userId: number;
  userName: string;
  onLogout: () => void;
};

const Todo = ({ userId, userName, onLogout }: TodoProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    completed: false,
    priority: "low" as "low" | "medium" | "high",
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`http://localhost:3000/users/${userId}/tasks`);
      if (res.ok) {
        const data: Task[] = await res.json();
        setTasks(data);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const saveTask = async () => {
    if (!form.title.trim() && !form.description.trim()) return;

    try {
      if (editingTask) {
        // Update existing
        const res = await fetch(
          `http://localhost:3000/users/${userId}/tasks/${editingTask.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          }
        );
        if (res.ok) {
          const updatedTask: Task = await res.json();
          setTasks((prev) =>
            prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
          );
        }
      } else {
        // Add new
        const res = await fetch(`http://localhost:3000/users/${userId}/tasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });

        if (res.ok) {
          const newTask: Task = await res.json();
          setTasks((prev) => [...prev, newTask]);
        }
      }

      // Reset
      setForm({
        title: "",
        description: "",
        completed: false,
        priority: "low",
      });
      setEditingTask(null);
      setIsSidebarOpen(false);
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description,
      completed: task.completed,
      priority: task.priority,
    });
    setIsSidebarOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(
        `http://localhost:3000/users/${userId}/tasks/${id}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const target = e.target;
    let value: string | boolean = target.value;
    if (target instanceof HTMLInputElement && target.type === "checkbox")
      value = target.checked;
    setForm((prev) => ({ ...prev, [target.name]: value }));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const completedTasks = tasks.filter((t) => t.completed).length;
  const progressPercentage =
    tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  // Enhanced empty state component
  const EmptyState = () => (
    <div className="col-span-full flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mx-auto max-w-md">
        {/* Animated illustration */}
        <div className="relative mx-auto mb-8 h-24 w-24">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 animate-pulse"></div>
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
            <svg className="h-10 w-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
        </div>
        
        {/* Main heading */}
        <h3 className="text-xl font-semibold text-slate-900 mb-3">
          Ready to get organized?
        </h3>
        
        {/* Description */}
        <p className="text-slate-600 mb-8 leading-relaxed">
          Create your first task to start building productive habits and achieving your goals.
        </p>
        
        {/* Call to action button */}
        <button 
          onClick={() => {
            setEditingTask(null);
            setForm({
              title: "",
              description: "",
              completed: false,
              priority: "low",
            });
            setIsSidebarOpen(true);
          }}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Your First Task
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      {/* Enhanced background gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-[-10%] w-52 h-52 sm:w-72 sm:h-72 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-[-10%] w-72 h-72 sm:w-96 sm:h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-300/5 to-blue-300/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-8">
        {/* Enhanced Header with Progress Bar */}
        <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-3xl shadow-xl shadow-black/5 mb-8 px-6 py-6 sm:px-8 sm:py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                  Tasks Overview
                </h1>
                <p className="text-slate-600 mt-1 text-sm sm:text-base">
                  Welcome back,{" "}
                  <span className="font-semibold text-blue-600">
                    {userName}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mt-4 md:mt-0">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-slate-900">
                  {tasks.length}
                </div>
                <div className="text-xs sm:text-sm text-slate-600 uppercase tracking-wide">
                  Total Tasks
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-green-600">
                  {completedTasks}
                </div>
                <div className="text-xs sm:text-sm text-slate-600 uppercase tracking-wide">
                  Completed
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onLogout}
                  className="p-2 sm:p-3 text-slate-700 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl hover:bg-white hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 group"
                  title="Sign Out"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:text-red-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    setEditingTask(null);
                    setForm({
                      title: "",
                      description: "",
                      completed: false,
                      priority: "low",
                    });
                    setIsSidebarOpen(true);
                  }}
                  className="px-4 sm:px-6 py-2 sm:py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  + Add Task
                </button>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          {tasks.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-200/50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">Progress</span>
                <span className="text-sm font-bold text-slate-900">{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-slate-200/50 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Task List Grid with Enhanced Empty State */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.length === 0 ? (
            <EmptyState />
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className={`group relative backdrop-blur-sm border rounded-3xl p-4 sm:p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                  task.completed
                    ? "bg-gradient-to-br from-green-50/80 to-emerald-50/80 border-green-200/50"
                    : "bg-gradient-to-br from-white/80 to-slate-50/80 border-slate-200/50"
                }`}
              >
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                  <h3
                    className={`text-base sm:text-lg font-bold leading-tight ${
                      task.completed
                        ? "line-through text-green-700"
                        : "text-slate-900"
                    }`}
                  >
                    {task.title}
                  </h3>
                  <span
                    className={`inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wide ${
                      task.priority === "high"
                        ? "bg-gradient-to-r from-red-100 to-pink-100 text-red-700 shadow-red-100/50"
                        : task.priority === "medium"
                        ? "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 shadow-amber-100/50"
                        : "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 shadow-green-100/50"
                    } shadow-lg`}
                  >
                    {task.priority}
                  </span>
                </div>
                <p
                  className={`text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed ${
                    task.completed ? "text-green-600" : "text-slate-600"
                  }`}
                >
                  {task.description || "No description provided"}
                </p>
                <div className="flex justify-between items-center">
                  <span
                    className={`inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm font-semibold ${
                      task.completed
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-200"
                        : "bg-gradient-to-r from-orange-400 to-amber-400 text-white shadow-orange-200"
                    } shadow-lg`}
                  >
                    {task.completed ? <>✓ Completed</> : <>⏳ In Progress</>}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(task)}
                      className="px-3 py-1.5 text-xs font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sidebar Form */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        title={editingTask ? "Edit Task" : "Create New Task"}
      >
        <TaskForm
          form={form}
          handleChange={handleChange}
          saveTask={saveTask}
          editingTask={!!editingTask}
        />
      </Sidebar>
    </div>
  );
};

export default Todo;