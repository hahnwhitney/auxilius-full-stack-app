import { Router } from "express";
import type { Server } from "socket.io";
import { TaskStatus } from "../types.js";
import { getAllTasks, insertTask, updateTask, deleteTask } from "../db.js";

export function createTaskRouter(io: Server) {
  const router = Router();

  router.get("/", async (_req, res) => {
    try {
      const tasks = await getAllTasks();
      res.json(tasks);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  router.post("/", async (req, res) => {
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

  router.patch("/:id", async (req, res) => {
    try {
      const { title, description, status } = req.body;
      if (
        status !== undefined &&
        !Object.values(TaskStatus).includes(status as TaskStatus)
      ) {
        res.status(400).json({ error: "Invalid status" });
        return;
      }
      const task = await updateTask(req.params.id, { title, description, status });
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

  router.delete("/:id", async (req, res) => {
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

  return router;
}
