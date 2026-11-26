
import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  CheckCircle2,
  Clock3,
  ListTodo,
  Plus,
  Search,
  Bell,
  CalendarDays,
  MoreHorizontal,
  Pencil,
  Trash2,
  X,
  Menu,
  Target,
  TrendingUp,
  CircleCheck,
  AlertCircle,
  ClipboardList,
  ChevronDown,
} from "lucide-react";
import "./style.css";

const API_URL = "/api/tasks";
const emptyForm = {
  title: "",
  description: "",
  priority: "Medium",
  status: "Pending",
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  async function loadTasks() {
    try {
      setError("");
      const response = await fetch(API_URL);
      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Unable to load tasks");
      }

      setTasks(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      setError(err.message || "Backend connection failed.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  const stats = useMemo(() => {
    const completed = tasks.filter(
      (task) => task.status === "Completed"
    ).length;

    const pending = tasks.filter(
      (task) => task.status === "Pending"
    ).length;

    const progress = tasks.filter(
      (task) => task.status === "In Progress"
    ).length;

    return {
      total: tasks.length,
      completed,
      pending,
      progress,
      rate: tasks.length
        ? Math.round((completed / tasks.length) * 100)
        : 0,
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title?.toLowerCase().includes(search.toLowerCase()) ||
        task.description?.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "All" || task.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [tasks, search, filter]);

  function openAddModal() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  function openEditModal(task) {
    setEditingId(task.id);
    setForm({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "Medium",
      status: task.status || "Pending",
    });
    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.title.trim()) {
      setError("Please enter a task title.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        editingId ? `${API_URL}/${editingId}` : API_URL,
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            title: form.title.trim(),
            description: form.description.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Unable to save task.");
      }

      await loadTasks();
      closeModal();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteTask(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Unable to delete task.");
      }

      await loadTasks();
    } catch (err) {
      setError(err.message || "Delete failed.");
    }
  }

  async function updateStatus(task, status) {
    try {
      const response = await fetch(`${API_URL}/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: task.title,
          description: task.description || "",
          priority: task.priority || "Medium",
          status,
        }),
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Unable to update status.");
      }

      await loadTasks();
    } catch (err) {
      setError(err.message || "Status update failed.");
    }
  }

  const today = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon">
            <CheckCircle2 size={25} />
          </div>
          <span>
            TaskFlow<span className="brand-dot">.</span>
          </span>
        </div>

        <div className="sidebar-label">WORKSPACE</div>

        <nav className="sidebar-nav">
          <button
            className="nav-item active"
            onClick={() => {
              setFilter("All");
              setMenuOpen(false);
            }}
          >
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </button>

          <button
            className="nav-item"
            onClick={() => {
              setFilter("All");
              setMenuOpen(false);
            }}
          >
            <ListTodo size={19} />
            <span>All Tasks</span>
            <span className="nav-count">{tasks.length}</span>
          </button>

          <button
            className={`nav-item ${
              filter === "In Progress" ? "active" : ""
            }`}
            onClick={() => {
              setFilter("In Progress");
              setMenuOpen(false);
            }}
          >
            <Clock3 size={19} />
            <span>In Progress</span>
            <span className="nav-count">{stats.progress}</span>
          </button>

          <button
            className={`nav-item ${
              filter === "Completed" ? "active" : ""
            }`}
            onClick={() => {
              setFilter("Completed");
              setMenuOpen(false);
            }}
          >
            <CircleCheck size={19} />
            <span>Completed</span>
            <span className="nav-count">{stats.completed}</span>
          </button>

          {/* NEW: PENDING SIDEBAR OPTION */}
          <button
            className={`nav-item ${
              filter === "Pending" ? "active" : ""
            }`}
            onClick={() => {
              setFilter("Pending");
              setMenuOpen(false);
            }}
          >
            <AlertCircle size={19} />
            <span>Pending</span>
            <span className="nav-count">{stats.pending}</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-progress">
            <div className="progress-top">
              <Target size={18} />
              <span>Productivity</span>
            </div>

            <div className="progress-number">{stats.rate}%</div>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${stats.rate}%` }}
              />
            </div>

            <p>Tasks completed</p>
          </div>

          <div className="profile">
            <div className="avatar">N</div>
            <div className="profile-info">
              <strong>Nensi</strong>
              <span>Workspace Member</span>
            </div>
            <MoreHorizontal size={20} />
          </div>
        </div>
      </aside>

      {menuOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Menu size={21} />
            </button>

            <div>
              <span className="breadcrumb">Workspace /</span>
              <span className="breadcrumb-current"> Dashboard</span>
            </div>
          </div>

          <div className="topbar-right">
            <div className="date-display">
              <CalendarDays size={17} />
              <span>{today}</span>
            </div>

            <button className="icon-button notification">
              <Bell size={19} />
              <span />
            </button>

            <div className="top-avatar">N</div>
          </div>
        </header>

        <section className="dashboard-content">
          <div className="welcome-section">
            <div>
              <div className="welcome-label">OVERVIEW</div>
              <h1>
                Good day, Nensi <span>✦</span>
              </h1>
              <p>Here's what's happening with your tasks today.</p>
            </div>

            <button className="primary-button" onClick={openAddModal}>
              <Plus size={19} />
              Add New Task
            </button>
          </div>

          {error && (
            <div className="error-banner">
              <AlertCircle size={18} />
              {error}
              <button onClick={() => setError("")}>
                <X size={17} />
              </button>
            </div>
          )}

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-top">
                <div className="stat-icon navy">
                  <ClipboardList size={21} />
                </div>
                <span className="stat-caption">All tasks</span>
              </div>
              <div className="stat-value">{stats.total}</div>
              <div className="stat-bottom">
                <span>Total tasks in workspace</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <div className="stat-icon orange">
                  <Clock3 size={21} />
                </div>
                <span className="stat-caption">Pending</span>
              </div>
              <div className="stat-value">{stats.pending}</div>
              <div className="stat-bottom">
                <span>Waiting to get started</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <div className="stat-icon blue">
                  <TrendingUp size={21} />
                </div>
                <span className="stat-caption">In progress</span>
              </div>
              <div className="stat-value">{stats.progress}</div>
              <div className="stat-bottom">
                <span>Currently being worked on</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <div className="stat-icon green">
                  <CheckCircle2 size={21} />
                </div>
                <span className="stat-caption">Completed</span>
              </div>
              <div className="stat-value">{stats.completed}</div>
              <div className="stat-bottom">
                <span>{stats.rate}% completion rate</span>
              </div>
            </div>
          </div>

          <section className="tasks-panel">
            <div className="panel-heading">
              <div>
                <h2>My Tasks</h2>
                <p>Manage and track your daily work</p>
              </div>

              <button className="secondary-button" onClick={openAddModal}>
                <Plus size={17} />
                New Task
              </button>
            </div>

            <div className="task-toolbar">
              <div className="search-box">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                {search && (
                  <button onClick={() => setSearch("")}>
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="filter-box">
                <span>Status:</span>
                <div className="select-wrap">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="All">All Tasks</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                  <ChevronDown size={15} />
                </div>
              </div>
            </div>

            <div className="task-table-wrap">
              <table className="task-table">
                <thead>
                  <tr>
                    <th>TASK NAME</th>
                    <th>PRIORITY</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="empty-state">
                        Loading your tasks...
                      </td>
                    </tr>
                  ) : filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="empty-state">
                        <div className="empty-icon">
                          <ClipboardList size={27} />
                        </div>
                        <strong>No tasks found</strong>
                        <p>Try another search or add a new task.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map((task) => (
                      <tr key={task.id}>
                        <td>
                          <div className="task-name-cell">
                            <div
                              className={`task-check ${
                                task.status === "Completed" ? "checked" : ""
                              }`}
                            >
                              {task.status === "Completed" && (
                                <CheckCircle2 size={17} />
                              )}
                            </div>

                            <div className="task-details">
                              <strong
                                className={
                                  task.status === "Completed"
                                    ? "task-done"
                                    : ""
                                }
                              >
                                {task.title}
                              </strong>
                              <span>
                                {task.description || "No description"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`priority-badge ${
                              (task.priority || "Medium").toLowerCase()
                            }`}
                          >
                            <span className="priority-dot" />
                            {task.priority || "Medium"}
                          </span>
                        </td>

                        <td>
                          <select
                            className={`status-select ${
                              task.status === "Completed"
                                ? "status-completed"
                                : task.status === "In Progress"
                                ? "status-progress"
                                : "status-pending"
                            }`}
                            value={task.status}
                            onChange={(e) =>
                              updateStatus(task, e.target.value)
                            }
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>

                        <td>
                          <div className="action-buttons">
                            <button
                              className="action-button edit-action"
                              title="Edit task"
                              onClick={() => openEditModal(task)}
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              className="action-button delete-action"
                              title="Delete task"
                              onClick={() => deleteTask(task.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="table-footer">
              <span>
                Showing <strong>{filteredTasks.length}</strong> of{" "}
                <strong>{tasks.length}</strong> tasks
              </span>

              <span className="footer-note">
                <span className="online-dot" />
                All changes saved
              </span>
            </div>
          </section>

          <footer className="dashboard-footer">
            <span>© 2026 TaskFlow. Built for better productivity.</span>
            <span>Stay focused. Get things done.</span>
          </footer>
        </section>
      </main>

      {modalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div
            className="task-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="modal-eyebrow">
                  {editingId ? "UPDATE TASK" : "NEW TASK"}
                </span>
                <h2>{editingId ? "Edit Task" : "Create a Task"}</h2>
                <p>Fill in the details to organize your work.</p>
              </div>

              <button className="modal-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label>
                Task Title <span>*</span>
              </label>

              <input
                className="form-input"
                type="text"
                placeholder="e.g. Complete project design"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
                autoFocus
                required
              />

              <label>Description</label>

              <textarea
                className="form-input form-textarea"
                placeholder="Add more details about this task..."
                rows="4"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />

              <div className="form-row">
                <div>
                  <label>Priority</label>
                  <select
                    className="form-input"
                    value={form.priority}
                    onChange={(e) =>
                      setForm({ ...form, priority: e.target.value })
                    }
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>

                <div>
                  <label>Status</label>
                  <select
                    className="form-input"
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                  >
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="modal-error">{error}</div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Save Changes"
                    : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
