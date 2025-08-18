type TaskFormProps = {
  form: {
    title: string;
    description: string;
    completed: boolean;
    priority: "low" | "medium" | "high";
  };
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  saveTask: () => void;
  editingTask: boolean;
};

const TaskForm = ({
  form,
  handleChange,
  saveTask,
  editingTask,
}: TaskFormProps) => (
  <div className="space-y-4 sm:space-y-6">
    <div>
      <label className="block text-sm font-semibold text-slate-800 mb-2">
        Title
      </label>
      <input
        name="title"
        value={form.title}
        onChange={handleChange}
        className="w-full px-4 py-3 border rounded-2xl text-slate-900 focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div>
      <label className="block text-sm font-semibold text-slate-800 mb-2">
        Description
      </label>
      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        rows={4}
        className="w-full px-4 py-3 border rounded-2xl text-slate-900 focus:ring-2 focus:ring-blue-500 resize-none"
      />
    </div>

    <div className="flex flex-col sm:flex-row gap-4">
      <label className="flex items-center gap-2 bg-white/60 border border-slate-200 rounded-2xl px-4 py-3">
        <input
          type="checkbox"
          name="completed"
          checked={form.completed}
          onChange={handleChange}
          className="h-5 w-5 text-blue-600"
        />
        Mark as Completed
      </label>
      <select
        name="priority"
        value={form.priority}
        onChange={handleChange}
        className="flex-1 px-4 py-3 border rounded-2xl text-slate-900"
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
    </div>

    <button
      onClick={saveTask}
      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
    >
      {editingTask ? "Save Changes" : "Add Task"}
    </button>
  </div>
);

export default TaskForm;
