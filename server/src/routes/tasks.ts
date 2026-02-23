import { Router } from "express";
import type { Server } from "socket.io";
import { getAllTasks, insertTask, updateTask, deleteTask } from "../db.js";
import {
  createTaskSchema,
  getTasksQuerySchema,
  updateTaskSchema,
} from "../schemas.js";
import { TaskStatus } from "../types.js";
import { requireAuth } from "../middleware/requireAuth.js";

export function createTaskRouter(io: Server) {
  const router = Router();

  router.use(requireAuth);

  router.get("/", async (req, res) => {
    try {
      const result = getTasksQuerySchema.safeParse(req.query);
      if (!result.success) {
        res.status(400).json({ error: result.error.issues[0].message });
        return;
      }
      const { status, page, limit } = result.data;
      const userId = req.session.userId;
      const { data, total } = await getAllTasks(status, page, limit, userId);
      res.json({ data, total, page, limit });
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  router.post("/", async (req, res) => {
    try {
      const result = createTaskSchema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({ error: result.error.issues[0].message });
        return;
      }
      const { title, description, status } = result.data;
      const task = await insertTask(
        title,
        description ?? "",
        status ?? TaskStatus.TODO,
        req.session.userId,
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
      const result = updateTaskSchema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({ error: result.error.issues[0].message });
        return;
      }
      const task = await updateTask(req.params.id, result.data);
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
