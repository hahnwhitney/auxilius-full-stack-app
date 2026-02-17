import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { TaskStatus } from "./types.js";
import {
  connectDb,
  getAllTasks,
  insertTask,
  updateTask,
  deleteTask,
  getUserByUsername,
  insertUser,
} from "./db.js";

const app = express();
app.use(express.json());
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/users/:username", async (req, res) => {
  try {
    const user = await getUserByUsername(req.params.username);
    if (user) {
      res.json({ exists: true });
    } else {
      res.status(404).json({ exists: false });
    }
  } catch (err) {
    console.error("Failed to look up user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const { username } = req.body;
    if (
      !username ||
      typeof username !== "string" ||
      username.trim().length === 0
    ) {
      res.status(400).json({ error: "Username is required" });
      return;
    }
    const existing = await getUserByUsername(username.trim());
    if (existing) {
      res.status(409).json({ error: "Username already taken" });
      return;
    }
    const user = await insertUser(username.trim());
    res.status(201).json(user);
  } catch (err) {
    console.error("Failed to create user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/tasks", async (_req, res) => {
  try {
    const tasks = await getAllTasks();
    res.json(tasks);
  } catch (err) {
    console.error("Failed to fetch tasks:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/tasks", async (req, res) => {
  try {
    const { title, description, status } = req.body;
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      res.status(400).json({ error: "Title is required" });
      return;
    }
    if (
      status !== undefined &&
      !Object.values(TaskStatus).includes(status as TaskStatus)
    ) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }
    const task = await insertTask(
      title.trim(),
      description ?? "",
      (status as TaskStatus) ?? TaskStatus.TODO,
    );
    io.emit("task:added", task);
    res.status(201).json(task);
  } catch (err) {
    console.error("Failed to create task:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.patch("/api/tasks/:id", async (req, res) => {
  try {
    const { title, description, status } = req.body;
    if (
      status !== undefined &&
      !Object.values(TaskStatus).includes(status as TaskStatus)
    ) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }
    const task = await updateTask(req.params.id, {
      title,
      description,
      status,
    });
    if (task) {
      io.emit("task:updated", task);
      res.json(task);
    } else {
      res.status(404).json({ error: "Task not found" });
    }
  } catch (err) {
    console.error("Failed to update task:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const deleted = await deleteTask(req.params.id);
    if (deleted) {
      io.emit("task:deleted", req.params.id);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Task not found" });
    }
  } catch (err) {
    console.error("Failed to delete task:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  getAllTasks()
    .then((tasks) => socket.emit("tasks:initial", tasks))
    .catch((err) => console.error("Failed to fetch tasks:", err));

  socket.on(
    "task:add",
    async (data: { title: string; description: string; status: string }) => {
      try {
        const title = data.title.trim();
        if (title.length === 0) return;
        const status = Object.values(TaskStatus).includes(
          data.status as TaskStatus,
        )
          ? (data.status as TaskStatus)
          : TaskStatus.TODO;
        const task = await insertTask(title, data.description ?? "", status);
        io.emit("task:added", task);
      } catch (err) {
        console.error("Failed to add task:", err);
      }
    },
  );

  socket.on(
    "task:update",
    async ({
      id,
      fields,
    }: {
      id: string;
      fields: { title?: string; description?: string; status?: string };
    }) => {
      try {
        if (
          fields.status !== undefined &&
          !Object.values(TaskStatus).includes(fields.status as TaskStatus)
        )
          return;
        const task = await updateTask(id, {
          title: fields.title?.trim(),
          description: fields.description,
          status: fields.status as TaskStatus | undefined,
        });
        if (task) {
          io.emit("task:updated", task);
        }
      } catch (err) {
        console.error("Failed to update task:", err);
      }
    },
  );

  socket.on("task:delete", async (id: string) => {
    try {
      const deleted = await deleteTask(id);
      if (deleted) {
        io.emit("task:deleted", id);
      }
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = Number(process.env.PORT) || 3001;

async function start() {
  await connectDb();
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
