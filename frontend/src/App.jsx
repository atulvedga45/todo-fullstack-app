import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API = "http://127.0.0.1:8000/todos";

function App() {
  const [todos, setTodos] = useState([]);
  const [trash, setTrash] = useState([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("Medium");

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const [showTrash, setShowTrash] = useState(false);

  useEffect(() => {
    loadTodos();
    loadTrash();
  }, []);

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


      await Promise.all([
        loadTodos(),
        loadTrash(),
      ]);
    } catch (err) {
      console.error(err);
    }


  };

  const restoreTodo = async (id) => {
    try {
      await axios.patch(
        `${API}/restore/${id}`
      );


      await Promise.all([
        loadTodos(),
        loadTrash(),
      ]);
    } catch (err) {
      console.error(err);
    }


  };

  const deleteForever = async (id) => {
    if (!window.confirm("Delete permanently?"))
      return;


    try {
      await axios.delete(
        `${API}/permanent/${id}`
      );

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
      await axios.put(
  `${API}/${todo.id}`,
  {
    title: editTitle,
    completed: todo.completed,
    priority: todo.priority
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
    try {
      await axios.put(
        `${API}/${todo.id}`,
        {
          title: todo.title,
          completed: !todo.completed,
          priority: todo.priority,
        }
      );

      loadTodos();
    } catch (err) {
      console.error(err);
    }
  };



  return (<div className="container"> <h1>📋 Todo List</h1>


    <div className="add-box">
      <input
        type="text"
        placeholder="Enter Todo..."
        value={title}
        onChange={(e) =>
          setTitle(e.target.value)
        }
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            addTodo();
          }
        }}
      />

      <select
        value={priority}
        onChange={(e) =>
          setPriority(e.target.value)
        }
      >
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>

      <button onClick={addTodo}>
        Add
      </button>
    </div>

    <h2>
      Active Todos ({todos.length})
    </h2>

    {todos.length === 0 ? (
      <p>No Todos Found</p>
    ) : (
      todos.map((todo) => (
        <div
          className="todo-card"
          key={todo.id}
        >
          {editingId === todo.id ? (
            <>
              <input
                value={editTitle}
                onChange={(e) =>
                  setEditTitle(
                    e.target.value
                  )
                }
              />

              <div className="actions">
                <button
                  className="btn-save"
                  onClick={() =>
                    saveEdit(todo)
                  }
                >
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


                <h3
                  className={
                    todo.completed
                      ? "completed"
                      : ""
                  }
                >
                  {todo.title}
                </h3>

                <p
                  className={`status ${todo.completed
                      ? "completed"
                      : "pending"
                    }`}
                >
                  {todo.completed
                    ? "✅ Completed"
                    : "⏳ Pending"}
                </p>

                <p
                  className={`priority ${todo.priority.toLowerCase()}`}
                >
                  {todo.priority}
                </p>

                <p className="todo-date">
                  📅{" "}
                  {new Date(
                    todo.created_at
                  ).toLocaleDateString()}
                  {" • "}
                  🕒{" "}
                  {new Date(
                    todo.created_at
                  ).toLocaleTimeString()}
                </p>
              </div>

              <div className="actions">
                <button
                  className="btn-edit"
                  onClick={() =>
                    startEdit(todo)
                  }
                >
                  ✏️ Edit
                </button>

                <button
                  className="btn-trash"
                  onClick={() =>
                    moveToTrash(todo.id)
                  }
                >
                  🗑️ Trash
                </button>
              </div>
            </>
          )}
        </div>
      ))
    )}

    <div className="trash-toggle">
      <button
        className="btn-trash-view"
        onClick={() =>
          setShowTrash(!showTrash)
        }
      >
        {showTrash
          ? "🙈 Hide Trash"
          : `🗑️ Trash Data (${trash.length})`}
      </button>
    </div>

    {showTrash && (
      <>
        <hr />

        <h2>
          Trash ({trash.length})
        </h2>

        {trash.length === 0 ? (
          <p>Trash Empty</p>
        ) : (
          trash.map((todo) => (
            <div
              className="todo-card"
              key={todo.id}
            >
              <div>
                <h3>{todo.title}</h3>
              </div>

              <div className="actions">
                <button
                  className="btn-restore"
                  onClick={() =>
                    restoreTodo(todo.id)
                  }
                >
                  ↩️ Restore
                </button>

                <button
                  className="btn-delete"
                  onClick={() =>
                    deleteForever(todo.id)
                  }
                >
                  ❌ Delete Forever
                </button>
              </div>
            </div>
          ))
        )}
      </>
    )}

    <h3 className="footer">
      Total Items:{" "}
      {todos.length + trash.length}
    </h3>
  </div>


  );
}

export default App;
