import type { Server } from "socket.io";
import { TaskStatus } from "../types.js";
import { getAllTasks, insertTask, updateTask, deleteTask } from "../db.js";

const socketToTask = new Map<string, string>(); // socketId → taskId
const taskEditors = new Map<string, Map<string, string>>(); // taskId → Map<socketId, username>

function broadcastEditors(io: Server, taskId: string) {
  const editors = Array.from(taskEditors.get(taskId)?.values() ?? []);
  io.emit("task:editingBy", { taskId, editors });
}

function clearSocketFromTask(io: Server, socketId: string) {
  const taskId = socketToTask.get(socketId);
  if (!taskId) return;
  const editors = taskEditors.get(taskId);
  if (editors) {
    editors.delete(socketId);
    if (editors.size === 0) {
      taskEditors.delete(taskId);
    }
  }
  socketToTask.delete(socketId);
  broadcastEditors(io, taskId);
}

export function registerTaskSocketHandlers(io: Server) {
  io.on("connection", (socket) => {
    const session = socket.request.session;
    const userId = session?.userId as string | undefined;
    const username = session?.username as string | undefined;
    if (!userId) {
      socket.disconnect();
      return;
    }

    console.log(`Client connected: ${socket.id}`);

    getAllTasks(undefined, 1, 20)
      .then(({ data, total }) => socket.emit("tasks:initial", { data, total }))
      .catch((err) => console.error("Failed to fetch tasks:", err));

    socket.on(
      "task:add",
      async (data: {
        title: string;
        description: string;
        status: string;
      }) => {
        try {
          const title = data.title.trim();
          if (title.length === 0) return;
          const status = Object.values(TaskStatus).includes(
            data.status as TaskStatus,
          )
            ? (data.status as TaskStatus)
            : TaskStatus.TODO;
          const task = await insertTask(
            title,
            data.description ?? "",
            status,
            userId,
          );
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

    socket.on("task:editStart", ({ taskId }: { taskId: string }) => {
      if (socketToTask.get(socket.id) === taskId) return;
      clearSocketFromTask(io, socket.id);
      if (!taskEditors.has(taskId)) {
        taskEditors.set(taskId, new Map());
      }
      taskEditors.get(taskId)!.set(socket.id, username ?? "Unknown");
      socketToTask.set(socket.id, taskId);
      broadcastEditors(io, taskId);
    });

    socket.on("task:editStop", ({ taskId }: { taskId: string }) => {
      if (socketToTask.get(socket.id) !== taskId) return;
      clearSocketFromTask(io, socket.id);
    });

    socket.on("disconnect", () => {
      clearSocketFromTask(io, socket.id);
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}
