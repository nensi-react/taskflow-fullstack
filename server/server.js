const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const initSqlJs = require("sql.js");

const app = express();
const PORT = 5000;
const DB_DIR = process.env.VERCEL
  ? path.join("/tmp", "taskflow-data")
  : path.join(__dirname, "data");
  const DB_PATH = path.join(DB_DIR, "taskflow.sqlite");

app.use(cors());
app.use(express.json());

let db;

function saveDatabase() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function rowsToObjects(result) {
  if (!result.length) return [];
  const columns = result[0].columns;
  return result[0].values.map(values =>
    Object.fromEntries(columns.map((column, index) => [column, values[index]]))
  );
}

function getTasks() {
  const result = db.exec(
    "SELECT * FROM tasks ORDER BY created_at DESC"
  );
  return rowsToObjects(result);
}

function seedDatabase() {
  const count = db.exec("SELECT COUNT(*) AS count FROM tasks");
  const total = count[0].values[0][0];
  if (total > 0) return;

  const samples = [
    ["Plan weekly study schedule", "Organize learning time for the week.", "High", "Pending"],
    ["Build portfolio homepage", "Finish the responsive hero section.", "Medium", "In Progress"],
    ["Practice REST API", "Test GET, POST, PUT and DELETE endpoints.", "High", "Completed"]
  ];

  const statement = db.prepare(
    "INSERT INTO tasks (title, description, priority, status, created_at) VALUES (?, ?, ?, ?, ?)"
  );
  for (const task of samples) {
    statement.run([...task, new Date().toISOString()]);
  }
  statement.free();
  saveDatabase();
}

app.get("/", (req, res) => {
  res.json({ success: true, message: "TaskFlow API is running." });
});

app.get("/api/tasks", (req, res) => {
  try {
    let tasks = getTasks();
    const search = String(req.query.search || "").toLowerCase();
    const status = String(req.query.status || "All");
    if (search) {
      tasks = tasks.filter(task =>
        task.title.toLowerCase().includes(search) ||
        task.description.toLowerCase().includes(search)
      );
    }
    if (status !== "All") tasks = tasks.filter(task => task.status === status);
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to load tasks." });
  }
});

app.post("/api/tasks", (req, res) => {
  const { title, description = "", priority = "Medium", status = "Pending" } = req.body;
  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ success: false, message: "Task title is required." });
  }
  if (!["Low", "Medium", "High"].includes(priority)) {
    return res.status(400).json({ success: false, message: "Invalid priority." });
  }
  if (!["Pending", "In Progress", "Completed"].includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status." });
  }

  const statement = db.prepare(
    "INSERT INTO tasks (title, description, priority, status, created_at) VALUES (?, ?, ?, ?, ?)"
  );
  statement.run([title.trim(), String(description).trim(), priority, status, new Date().toISOString()]);
  statement.free();
  saveDatabase();

  const idResult = db.exec("SELECT last_insert_rowid() AS id");
  const id = idResult[0].values[0][0];
  const task = rowsToObjects(db.exec("SELECT * FROM tasks WHERE id = " + Number(id)))[0];
  res.status(201).json({ success: true, message: "Task created.", data: task });
});

app.put("/api/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, message: "Invalid task ID." });
  }
  const existing = rowsToObjects(db.exec("SELECT * FROM tasks WHERE id = " + id))[0];
  if (!existing) return res.status(404).json({ success: false, message: "Task not found." });

  const title = req.body.title === undefined ? existing.title : req.body.title;
  const description = req.body.description === undefined ? existing.description : String(req.body.description);
  const priority = req.body.priority === undefined ? existing.priority : req.body.priority;
  const status = req.body.status === undefined ? existing.status : req.body.status;

  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ success: false, message: "Task title is required." });
  }
  if (!["Low", "Medium", "High"].includes(priority)) {
    return res.status(400).json({ success: false, message: "Invalid priority." });
  }
  if (!["Pending", "In Progress", "Completed"].includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status." });
  }

  const statement = db.prepare(
    "UPDATE tasks SET title = ?, description = ?, priority = ?, status = ? WHERE id = ?"
  );
  statement.run([title.trim(), description.trim(), priority, status, id]);
  statement.free();
  saveDatabase();

  const updated = rowsToObjects(db.exec("SELECT * FROM tasks WHERE id = " + id))[0];
  res.json({ success: true, message: "Task updated.", data: updated });
});

app.delete("/api/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, message: "Invalid task ID." });
  }
  const before = db.getRowsModified();
  db.run("DELETE FROM tasks WHERE id = ?", [id]);
  const deleted = db.getRowsModified();
  if (!deleted) return res.status(404).json({ success: false, message: "Task not found." });
  saveDatabase();
  res.json({ success: true, message: "Task deleted." });
});

app.use((req, res) => res.status(404).json({ success: false, message: "Route not found." }));

async function startServer() {
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
  const SQL = await initSqlJs({
    locateFile: file => path.join(__dirname, "node_modules", "sql.js", "dist", file)
  });

  if (fs.existsSync(DB_PATH)) {
    const bytes = fs.readFileSync(DB_PATH);
    db = new SQL.Database(bytes);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      priority TEXT NOT NULL DEFAULT 'Medium',
      status TEXT NOT NULL DEFAULT 'Pending',
      created_at TEXT NOT NULL
    )
  `);
  saveDatabase();
  seedDatabase();

  app.listen(PORT, () => {
    console.log(`TaskFlow backend running at http://localhost:${PORT}`);
    console.log(`SQLite database: ${DB_PATH}`);
  });
}

startServer().catch(error => {
  console.error("Could not start server:", error);
  process.exit(1);
});