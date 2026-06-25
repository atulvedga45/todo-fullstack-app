import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API = "https://todo-fullstack-app-1-nqk4.onrender.com/todos";

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

  const loadTodos = async () => {
    try {
      const res = await axios.get(`${API}/`);
      setTodos(res.data);
    } catch (err) {
      console.error("Error loading todos:", err);
    }
  };

  const loadTrash = async () => {
    try {
      const res = await axios.get(`${API}/trash`);
      setTrash(res.data);
    } catch (err) {
      console.error("Error loading trash:", err);
    }
  };

  useEffect(() => {
    loadTodos();
    loadTrash();
  }, []);

  const addTodo = async () => {
    if (!title.trim()) return;

    try {
      await axios.post(`${API}/`, {
        title: title.trim(),
        priority: priority,
      });

      setTitle("");
      setPriority("Medium");
      loadTodos();
    } catch (err) {
      console.error("Error adding todo:", err);
    }
  };

  const moveToTrash = async (id) => {
    try {
      await axios.delete(`${API}/${id}`);
      await Promise.all([loadTodos(), loadTrash()]);
    } catch (err) {
      console.error(err);
    }
  };

  const restoreTodo = async (id) => {
    try {
      await axios.patch(`${API}/restore/${id}`);
      await Promise.all([loadTodos(), loadTrash()]);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteForever = async (id) => {
    if (!window.confirm("Delete permanently?")) return;
    try {
      await axios.delete(`${API}/permanent/${id}`);
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
    try {
      await axios.put(`${API}/${todo.id}`, {
        title: editTitle,
        completed: todo.completed,
        priority: todo.priority,
      });
      setEditingId(null);
      setEditTitle("");
      loadTodos();
    } catch (err) {
      console.error("Edit Error:", err);
    }
  };

  const toggleComplete = async (todo) => {
    try {
      await axios.put(`${API}/${todo.id}`, {
        title: todo.title,
        completed: !todo.completed,
        priority: todo.priority,
      });
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

  return (
    <div className="container relative-container">
      <h1>📋 Todo List</h1>

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
    </div>
  );
}

export default App;
