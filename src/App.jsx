import { useEffect, useState } from "react";
import "./App.css";

const API =
  "https://taskmanagementapp-60087170674.development.catalystserverless.in/server/taskmanagerfunction";

const USER_ID = "user001";

const emptyForm = {
  taskName: "",
  dueDate: "",
  priority: "Medium",
  status: "Pending",
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadTasks = async () => {
    try {
      const response = await fetch(`${API}/tasks?userID=${USER_ID}`);
      const data = await response.json();

      if (data.status === "success") {
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.error(error);
      setMessage("Unable to load tasks");
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.taskName.trim()) {
      setMessage("Please enter a task name");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const url = editingTask
        ? `${API}/updatetask`
        : `${API}/addtask`;

      const method = editingTask ? "PUT" : "POST";

      const body = editingTask
        ? {
          UserID: USER_ID,
          TaskName: editingTask.TaskName,
          DueDate: form.dueDate,
          Priority: form.priority,
          Status: form.status,
        }
        : {
          userID: USER_ID,
          taskName: form.taskName,
          dueDate: form.dueDate,
          priority: form.priority,
          status: form.status,
        };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || "Request failed");
      }

      setMessage(
        editingTask
          ? "Task updated successfully"
          : "Task added successfully"
      );

      setForm(emptyForm);
      setEditingTask(null);

      await loadTasks();

      setTimeout(() => setMessage(""), 2500);
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Unable to save task");
    }

    setLoading(false);
  };

  const editTask = (task) => {
    setEditingTask(task);

    setForm({
      taskName: task.TaskName,
      dueDate: task.DueDate || "",
      priority: task.Priority || "Medium",
      status: task.Status || "Pending",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteTask = async (taskName) => {
    if (!window.confirm(`Delete "${taskName}"?`)) {
      return;
    }

    try {
      const response = await fetch(
        `${API}/deletetask?userID=${USER_ID}&taskName=${encodeURIComponent(
          taskName
        )}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || "Delete failed");
      }

      setMessage("Task deleted successfully");

      await loadTasks();

      setTimeout(() => setMessage(""), 2500);
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Unable to delete task");
    }
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setForm(emptyForm);
    setMessage("");
  };

  const completed = tasks.filter(
    (task) => task.Status === "Completed"
  ).length;

  const pending = tasks.filter(
    (task) => task.Status === "Pending"
  ).length;

  return (
    <div className="app">

      {/* NAVBAR */}
      <nav className="navbar">

        <div className="nav-brand">
          <div className="logo">✓</div>

          <div>
            <div className="brand-name">TaskFlow</div>
            <div className="brand-subtitle">Task Management</div>
          </div>
        </div>

        <div className="nav-right">

          <div className="nav-status">
            <span className="online-dot"></span>
            Connected
          </div>

          <div className="profile">
            <div className="avatar">U</div>

            <div className="profile-info">
              <strong>User</strong>
              <span>{USER_ID}</span>
            </div>
          </div>

        </div>
      </nav>


      {/* MAIN */}
      <main className="container">

        {/* PAGE HEADER */}
        <section className="page-header">

          <div>
            <p className="eyebrow">WORKSPACE</p>
            <h1>My Tasks</h1>
            <p className="page-description">
              Create, organize and track your tasks in one place.
            </p>
          </div>

          <button
            className="refresh-button"
            onClick={loadTasks}
          >
            ↻ Refresh
          </button>

        </section>


        {/* STAT CARDS */}
        <section className="stats">

          <div className="stat-card">
            <div className="stat-icon blue">✓</div>

            <div>
              <span>Total Tasks</span>
              <strong>{tasks.length}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">◷</div>

            <div>
              <span>Pending</span>
              <strong>{pending}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">✓</div>

            <div>
              <span>Completed</span>
              <strong>{completed}</strong>
            </div>
          </div>

        </section>


        {/* FORM */}
        <section className="form-card">

          <div className="card-heading">

            <div>
              <h2>
                {editingTask ? "Edit Task" : "Create New Task"}
              </h2>

              <p>
                {editingTask
                  ? "Update the task details below."
                  : "Add a new task to your workspace."}
              </p>
            </div>

            {editingTask && (
              <button
                className="cancel-top"
                onClick={cancelEdit}
              >
                Cancel
              </button>
            )}

          </div>


          <form onSubmit={handleSubmit}>

            <div className="task-name-field">

              <label>Task name</label>

              <input
                type="text"
                name="taskName"
                value={form.taskName}
                onChange={handleChange}
                placeholder="e.g. Prepare Catalyst interview"
                disabled={!!editingTask}
              />

            </div>


            <div className="form-grid">

              <div className="field">

                <label>Due date</label>

                <input
                  type="date"
                  name="dueDate"
                  value={form.dueDate}
                  onChange={handleChange}
                />

              </div>


              <div className="field">

                <label>Priority</label>

                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>

              </div>


              <div className="field">

                <label>Status</label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>

              </div>

            </div>


            <div className="form-footer">

              <button
                className="add-button"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : editingTask
                    ? "Save Changes"
                    : "+ Add Task"}
              </button>

              {message && (
                <span className="message">
                  {message}
                </span>
              )}

            </div>

          </form>

        </section>


        {/* TASK LIST */}
        <section className="tasks-section">

          <div className="tasks-heading">

            <div>
              <h2>Task List</h2>
              <p>
                {tasks.length === 0
                  ? "No tasks created yet"
                  : `${tasks.length} task${tasks.length !== 1 ? "s" : ""
                  } in your workspace`}
              </p>
            </div>

          </div>


          {tasks.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">✓</div>

              <h3>Your task list is empty</h3>

              <p>
                Create your first task using the form above.
              </p>

            </div>

          ) : (

            <div className="task-list">

              {tasks.map((task) => (

                <article
                  className="task-item"
                  key={`${task.UserID}-${task.TaskName}`}
                >

                  <div className="task-check">
                    {task.Status === "Completed" ? "✓" : ""}
                  </div>


                  <div className="task-content">

                    <h3>{task.TaskName}</h3>

                    <div className="task-meta">

                      <span>
                        📅 {task.DueDate || "No due date"}
                      </span>

                      <span
                        className={`badge priority-${task.Priority?.toLowerCase()}`}
                      >
                        {task.Priority}
                      </span>

                      <span
                        className={`badge status-${task.Status
                          ?.toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        {task.Status}
                      </span>

                    </div>

                  </div>


                  <div className="task-actions">

                    <button
                      className="edit-btn"
                      onClick={() => editTask(task)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() =>
                        deleteTask(task.TaskName)
                      }
                    >
                      Delete
                    </button>

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>

      </main>


      <footer>
        TaskFlow · Powered by React & Zoho Catalyst
      </footer>

    </div>
  );
}

export default App;