


import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import Auth from "./Auth";

const API = "https://todo-fullstack-application-e5xk.onrender.com/todos";

function App() {
  const [todos, setTodos] = useState([]);
  const [trash, setTrash] = useState([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const [showTrash, setShowTrash] = useState(false);

  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authView, setAuthView] = useState("login");

  // Settings & Theme State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [profilePicInput, setProfilePicInput] = useState("");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  // Apply Light/Dark mode
  useEffect(() => {
    if (theme === "light") {
      document.body.classList.add("light-mode");
    } else {
      document.body.classList.remove("light-mode");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setUsernameInput("");
    setProfilePicInput("");
    setTodos([]);
    setTrash([]);
  };

  const loadProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.get("https://todo-fullstack-application-e5xk.onrender.com/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(res.data);
      setUsernameInput(res.data.username || "");
      setProfilePicInput(res.data.profile_picture || "");
    } catch (err) {
      console.error("Error loading profile:", err);
      if (err.response && err.response.status === 401) {
        handleLogout();
      }
    }
  };

  const loadTodos = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get(`${API}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTodos(res.data);
    } catch (err) {
      console.error("Error loading todos:", err);
      if (err.response && err.response.status === 401) {
        handleLogout();
      }
    }
  };

  const loadTrash = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get(`${API}/trash`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTrash(res.data);
    } catch (err) {
      console.error("Error loading trash:", err);
      if (err.response && err.response.status === 401) {
        handleLogout();
      }
    }
  };

  useEffect(() => {
    if (token) {
      loadProfile();
      loadTodos();
      loadTrash();
    }
  }, [token]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size should be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicInput(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async (e) => {
    if (e) e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.put("https://todo-fullstack-application-e5xk.onrender.com/auth/profile", {
        username: usernameInput,
        profile_picture: profilePicInput
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUser(res.data);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      if (err.response && err.response.status === 401) {
        handleLogout();
      } else {
        alert("Failed to update profile");
      }
    }
  };

 const addTodo = async () => {
  if (!title.trim()) return;

  const token = localStorage.getItem("token");

  try {
    await axios.post(
      `${API}/`,
      {
        title: title.trim(),
        priority: priority,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setTitle("");
    setPriority("Medium");
    loadTodos();
  } catch (err) {
    console.error("Error adding todo:", err);
  }
};
 const moveToTrash = async (id) => {
  const token = localStorage.getItem("token");

  try {
    await axios.delete(`${API}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    await Promise.all([loadTodos(), loadTrash()]);
  } catch (err) {
    console.error(err);
  }
};

  const restoreTodo = async (id) => {
  const token = localStorage.getItem("token");

  try {
    await axios.patch(
      `${API}/restore/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    await Promise.all([loadTodos(), loadTrash()]);
  } catch (err) {
    console.error(err);
  }
};

  const deleteForever = async (id) => {
  if (!window.confirm("Delete permanently?")) return;

  const token = localStorage.getItem("token");

  try {
    await axios.delete(`${API}/permanent/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    loadTrash();
  } catch (err) {
    console.error(err);
  }
};

  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
  };

 const saveEdit = async (todo) => {
  const token = localStorage.getItem("token");

  try {
    await axios.put(
      `${API}/${todo.id}`,
      {
        title: editTitle,
        completed: todo.completed,
        priority: todo.priority,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setEditingId(null);
    setEditTitle("");
    loadTodos();
  } catch (err) {
    console.error("Edit Error:", err);
  }
};

 const toggleComplete = async (todo) => {
  const token = localStorage.getItem("token");

  try {
    await axios.put(
      `${API}/${todo.id}`,
      {
        title: todo.title,
        completed: !todo.completed,
        priority: todo.priority,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    loadTodos();
  } catch (err) {
    console.error(err);
  }
};

  const filteredTodos = todos.filter((todo) => {
    const matchesSearch = todo.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === "All" || todo.priority === filterPriority;
    
    let matchesStatus = true;
    if (filterStatus === "Completed") matchesStatus = todo.completed;
    if (filterStatus === "Pending") matchesStatus = !todo.completed;

    return matchesSearch && matchesPriority && matchesStatus;
  });
  
  const filteredTrash = trash.filter((todo) => {
    const matchesSearch = todo.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === "All" || todo.priority === filterPriority;

    let matchesStatus = true;
    if (filterStatus === "Completed") matchesStatus = todo.completed;
    if (filterStatus === "Pending") matchesStatus = !todo.completed;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  const totalPending = todos.filter(t => !t.completed).length;
  const totalCompleted = todos.filter(t => t.completed).length;

  if (!token) {
    return (
      <div className="auth-wrapper">
        <div className="auth-container">
          <h1 className="auth-welcome-title">Welcome to Todo App</h1>
          <Auth onLoginSuccess={(newToken) => setToken(newToken)} />
        </div>
      </div>
    );
  }

  const getInitials = (email, username) => {
    if (username && username.trim()) {
      return username.trim().substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
     <>
    <div className="container relative-container">
      <div className="header-container">
        <h1>📋 Todo List</h1>
        <div className="header-right">
          <button className="btn-settings-trigger" onClick={() => setIsSettingsOpen(true)}>
            {user && user.profile_picture ? (
              <img src={user.profile_picture} alt="Avatar" className="user-badge-avatar" />
            ) : (
              <div className="user-badge-avatar">
                {user ? getInitials(user.email, user.username) : "U"}
              </div>
            )}
            <span className="user-badge-name">
              {user && user.username ? user.username : (user ? user.email.split("@")[0] : "Settings")}
            </span>
            ⚙️
          </button>
        </div>
      </div>

      <div className="stats-container">
        <div className="stat-box pending-box">
          <h4>Pending</h4>
          <p>{totalPending}</p>
        </div>
        <div className="stat-box completed-box">
          <h4>Completed</h4>
          <p>{totalCompleted}</p>
        </div>
      </div>

      <div className="control-panel">
        <input
          type="text"
          placeholder=" Search todos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="cp-search"
        />

        {!showTrash && (
          <input
            type="text"
            placeholder="Enter Todo..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addTodo();
              }
            }}
            className="cp-add-input"
          />
        )}

        {!showTrash && (
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="select-add cp-add-select"
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        )}

        {!showTrash && (
          <button className="btn-add cp-btn-add" onClick={addTodo}>Add</button>
        )}

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="select-status cp-filter-status"
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="select-filter cp-filter-select"
        >
          <option value="All">All Priorities</option>
          <option value="High">High Filter</option>
          <option value="Medium">Medium Filter</option>
          <option value="Low">Low Filter</option>
        </select>

        <button 
          className={`btn-trash-main cp-btn-trash ${showTrash ? "btn-go-back" : ""}`}
          onClick={() => {
            setShowTrash(!showTrash);
            setSearchQuery("");
          }}
        >
          {showTrash ? "🔙 Go Back" : `🗑️ Trash (${trash.length})`}
        </button>
      </div>

      {!showTrash ? (
        <>
          <h2>Active Todos ({filteredTodos.length})</h2>

          {filteredTodos.length === 0 ? (
            <p>No Todos Found</p>
          ) : (
            filteredTodos.map((todo, index) => (
              <div className={`todo-card border-${todo.priority.toLowerCase()}`} key={todo.id}>
                {editingId === todo.id ? (
                  <>
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                    <div className="actions">
                      <button className="btn-save" onClick={() => saveEdit(todo)}>
                        💾 Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditTitle("");
                        }}
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="todo-content">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleComplete(todo)}
                      />
                      <h3 className={todo.completed ? "completed" : ""}>
                        {index + 1}. {todo.title}
                      </h3>
                      <p className={`status ${todo.completed ? "completed" : "pending"}`}>
                        {todo.completed ? "✅ Completed" : "⏳ Pending"}
                      </p>
                      <p className={`priority ${todo.priority.toLowerCase()}`}>
                        {todo.priority}
                      </p>
                      <p className="todo-date">
                        📅 {new Date(todo.created_at).toLocaleDateString()} • 🕒 {new Date(todo.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="actions">
                      <button className="btn-edit" onClick={() => startEdit(todo)}>
                        ✏️ Edit
                      </button>
                      <button className="btn-trash" onClick={() => moveToTrash(todo.id)}>
                        🗑️ Trash
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </>
      ) : (
        <>
          <h2>🗑️ Trash ({filteredTrash.length})</h2>
          {filteredTrash.length === 0 ? (
            <p>Trash Empty</p>
          ) : (
            filteredTrash.map((todo, index) => (
              <div className={`todo-card border-${todo.priority.toLowerCase()}`} key={todo.id}>
                <div>
                  <h3>{index + 1}. {todo.title}</h3>
                </div>
                <div className="actions">
                  <button className="btn-restore" onClick={() => restoreTodo(todo.id)}>
                    ↩️ Restore
                  </button>
                  <button className="btn-delete" onClick={() => deleteForever(todo.id)}>
                    ❌ Delete Forever
                  </button>
                </div>
              </div>
            ))
          )}
        </>
      )}
      
      <h3 className="footer">
        Total Items: {todos.length + trash.length}
      </h3>

      {isSettingsOpen && (
        <div className="modal-overlay" onClick={() => setIsSettingsOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⚙️ App Settings</h2>
              <button className="btn-close-modal" onClick={() => setIsSettingsOpen(false)}>×</button>
            </div>

            <div className="settings-section">
              <h3>Profile Settings</h3>
              <form onSubmit={saveProfile} className="profile-form">
                <label htmlFor="avatar-file-input" className="profile-avatar-upload">
                  {profilePicInput ? (
                    <img src={profilePicInput} alt="Profile Preview" />
                  ) : (
                    <div className="avatar-placeholder">
                      {user ? getInitials(user.email, usernameInput) : "U"}
                    </div>
                  )}
                  <div className="avatar-upload-overlay">Upload</div>
                </label>
                <input
                  id="avatar-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />

                <div className="profile-input-group">
                  <label htmlFor="profile-username">Username</label>
                  <input
                    id="profile-username"
                    type="text"
                    placeholder="Enter your name"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="profile-input"
                  />
                </div>

                <button type="submit" className="btn-save-profile">
                  Save Profile
                </button>
              </form>
            </div>

            <div className="settings-section">
              <h3>Theme Settings</h3>
              <div className="theme-option">
                <span className="theme-label">Theme Mode</span>
                <div className="theme-toggle-buttons">
                  <button
                    className={`theme-btn ${theme === "light" ? "active" : ""}`}
                    onClick={() => setTheme("light")}
                  >
                    ☀️ Light
                  </button>
                  <button
                    className={`theme-btn ${theme === "dark" ? "active" : ""}`}
                    onClick={() => setTheme("dark")}
                  >
                    🌙 Dark
                  </button>
                </div>
              </div>
            </div>

            <div className="settings-logout-container">
              <button className="btn-settings-logout" onClick={() => {
                setIsSettingsOpen(false);
                handleLogout();
              }}>
                🚪 Logout from Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
  
}

export default App;
