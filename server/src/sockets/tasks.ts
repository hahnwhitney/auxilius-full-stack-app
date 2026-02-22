import type { Server } from "socket.io";
import { TaskStatus } from "../types.js";
import { getAllTasks, insertTask, updateTask, deleteTask } from "../db.js";

export function registerTaskSocketHandlers(io: Server) {
  io.on("connection", (socket) => {
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
        userId?: string;
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
            data.userId,
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

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}
