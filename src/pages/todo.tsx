import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
  userName: string;
  userId: number;
  onLogout: () => void;
};

const EmptyState = () => (
  <div className="col-span-full flex flex-col items-center justify-center px-6 py-20 text-center">
    <div className="mx-auto max-w-md">
      <div className="relative mx-auto mb-8 h-24 w-24">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-200 shadow-inner"></div>
        <div className="absolute inset-3 rounded-xl bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center">
          <svg
            className="h-8 w-8 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h3.75M9 15h3.75M9 18h3.75m3-6V7a2 2 0 00-2-2h-3V3a2 2 0 00-2-2h-3a2 2 0 00-2 2v2H5a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2h-3V3a2 2 0 00-2-2z"
            />
          </svg>
        </div>
      </div>
      <h3 className="text-xl font-semibold text-blue-900 mb-3">No tasks yet</h3>
      <p className="text-blue-700 mb-8 leading-relaxed">
        Get started by creating your first task to organize your workflow and
        boost productivity.
      </p>
    </div>
  </div>
);

const Todo = ({ userName, userId, onLogout }: TodoProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    completed: false,
    priority: "low" as "low" | "medium" | "high",
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true); // <-- added loading state

  const navigate = useNavigate();

  // Safe logout handler
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    onLogout();
    navigate("/signin");
  };

  // Spinner component
  const Spinner = () => (
    <div className="col-span-full flex justify-center items-center py-20">
      <div className="w-12 h-12 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  );

  // Fetch tasks once on mount
  useEffect(() => {
    const fetchTasks = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        handleLogout();
        return;
      }

      setLoading(true); // start loading
      try {
        const res = await fetch("http://localhost:3000/tasks", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          handleLogout();
          return;
        }

        if (res.ok) {
          const data: Task[] = await res.json();
          setTasks((prev) =>
            JSON.stringify(prev) !== JSON.stringify(data) ? data : prev
          );
        }
      } catch (err) {
        console.error("Error fetching tasks:", err);
      } finally {
        setLoading(false); // stop loading
      }
    };

    fetchTasks();
  }, []); // only on mount

  // Save task (create or update)
  const saveTask = async () => {
    if (!form.title.trim() && !form.description.trim()) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      handleLogout();
      return;
    }

    try {
      let res;
      if (editingTask) {
        res = await fetch(`http://localhost:3000/tasks/${editingTask.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        });
      } else {
        res = await fetch("http://localhost:3000/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        });
      }

      if (res.status === 401) {
        handleLogout();
        return;
      }

      if (res.ok) {
        const updatedTask: Task = await res.json();
        setTasks((prev) =>
          editingTask
            ? prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
            : [...prev, updatedTask]
        );
      }

      setForm({
        title: "",
        description: "",
        completed: false,
        priority: "low",
      });
      setEditingTask(null);
      setIsSidebarOpen(false);
    } catch (err) {
      console.error("Error saving task:", err);
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
    const token = localStorage.getItem("access_token");
    if (!token) {
      handleLogout();
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/tasks/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        handleLogout();
        return;
      }

      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const target = e.target;
    let value: string | boolean = target.value;
    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      value = target.checked;
    }
    setForm((prev) => ({ ...prev, [target.name]: value }));
  };

  const completedTasks = tasks.filter((t) => t.completed).length;
  const progressPercentage =
    tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  const getPriorityColor = (priority: string, isCompleted: boolean) => {
    if (isCompleted)
      return "border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-teal-50";
    switch (priority) {
      case "high":
        return "border-rose-200/60 bg-gradient-to-br from-rose-50 to-pink-50";
      case "medium":
        return "border-amber-200/60 bg-gradient-to-br from-amber-50 to-orange-50";
      default:
        return "border-sky-200/60 bg-gradient-to-br from-sky-50 to-blue-50";
    }
  };

  const getPriorityDot = (priority: string, isCompleted: boolean) => {
    if (isCompleted) return "bg-gradient-to-r from-emerald-500 to-teal-500";
    switch (priority) {
      case "high":
        return "bg-gradient-to-r from-rose-500 to-pink-500";
      case "medium":
        return "bg-gradient-to-r from-amber-500 to-orange-500";
      default:
        return "bg-gradient-to-r from-sky-500 to-blue-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white/90 backdrop-blur-sm border border-blue-200/50 rounded-xl shadow-lg shadow-blue-100/50 mb-8">
          <div className="px-6 py-6 border-b border-blue-200/30">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex-1">
                <h1 className="text-2xl font-semibold text-blue-900 mb-1">
                  Task Management
                </h1>
                <p className="text-blue-700">
                  Welcome back,{" "}
                  <span className="font-medium text-blue-900">{userName}</span>
                </p>
              </div>

              {/* Task Stats */}
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-900">
                    {tasks.length}
                  </div>
                  <div className="text-sm text-blue-600">Total Tasks</div>
                </div>
                <div className="w-px h-12 bg-blue-200"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">
                    {completedTasks}
                  </div>
                  <div className="text-sm text-blue-600">Completed</div>
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-colors duration-200 font-medium text-sm"
                >
                  Sign Out
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
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium text-sm inline-flex items-center gap-2 shadow-md shadow-blue-200"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  New Task
                </button>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          {tasks.length > 0 && (
            <div className="px-6 py-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-medium text-blue-900">
                    Progress
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {completedTasks} of {tasks.length} completed
                  </span>
                </div>
                <span className="text-sm font-semibold text-blue-900">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <Spinner />
          ) : tasks.length === 0 ? (
            <EmptyState />
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className={`relative bg-white/80 backdrop-blur-sm border rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden hover:scale-[1.02] ${getPriorityColor(
                  task.priority,
                  task.completed
                )}`}
              >
                <div
                  className={`absolute top-0 left-0 w-1 h-full ${getPriorityDot(
                    task.priority,
                    task.completed
                  )}`}
                />

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${getPriorityDot(
                          task.priority,
                          task.completed
                        )}`}
                      />
                      <span className="text-xs font-medium text-slate-700 uppercase tracking-wide">
                        {task.priority}
                      </span>
                    </div>
                    {task.completed && (
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 text-xs font-medium rounded-full border border-emerald-200">
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Completed
                      </div>
                    )}
                  </div>

                  <h3
                    className={`text-lg font-semibold mb-2 leading-tight ${
                      task.completed
                        ? "text-slate-500 line-through"
                        : "text-slate-800"
                    }`}
                  >
                    {task.title}
                  </h3>

                  <p
                    className={`text-sm mb-6 leading-relaxed ${
                      task.completed ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    {task.description || "No description provided"}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(task)}
                      className="flex-1 px-3 py-2 text-blue-700 bg-white/80 border border-blue-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-all duration-200 font-medium text-sm inline-flex items-center justify-center gap-2 backdrop-blur-sm"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="px-3 py-2 text-rose-700 bg-white/80 border border-rose-200 rounded-lg hover:bg-rose-50 hover:border-rose-300 transition-all duration-200 font-medium text-sm inline-flex items-center justify-center backdrop-blur-sm"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
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
