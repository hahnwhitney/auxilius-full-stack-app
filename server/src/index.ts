import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { type Task, TaskStatus } from './types.js'

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const tasks: Task[] = [];

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.emit("tasks:initial", tasks);

  socket.on("task:add", (data: { title: string; description: string; status: string }) => {
    const task: Task = {
      id: generateId(),
      title: data.title.trim(),
      description: data.description ?? "",
      status: (Object.values(TaskStatus).includes(data.status as TaskStatus)
        ? data.status
        : TaskStatus.TODO) as TaskStatus,
    };
    if (task.title.length === 0) return;
    tasks.push(task);
    io.emit("task:added", task);
  });

  socket.on("task:statusChange", ({ id, status }: { id: string; status: string }) => {
    const task = tasks.find((t) => t.id === id);
    if (task && Object.values(TaskStatus).includes(status as TaskStatus)) {
      task.status = status as TaskStatus;
      io.emit("task:statusChanged", { id, status: task.status });
    }
  });

  socket.on("task:titleChange", ({ id, title }: { id: string; title: string }) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      task.title = title.trim();
      io.emit("task:titleChanged", { id, title: task.title });
    }
  });

  socket.on("task:descriptionChange", ({ id, description }: { id: string; description: string }) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      task.description = description;
      io.emit("task:descriptionChanged", { id, description: task.description });
    }
  });

  socket.on("task:delete", (id: string) => {
    const index = tasks.findIndex((t) => t.id === id);
    if (index !== -1) {
      tasks.splice(index, 1);
      io.emit("task:deleted", id);
    }
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = Number(process.env.PORT) || 3001;

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
