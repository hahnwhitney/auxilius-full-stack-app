import { toast } from "react-toastify";
import { TaskStatus } from "../types";

export const addTask = async (
  title: string,
  description: string,
  status: TaskStatus,
): Promise<void> => {
  try {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, status }),
    });
    if (!res.ok) {
      console.error("Failed to add task:", res.statusText);
      toast.error("Failed to add task.");
    }
  } catch (err) {
    console.error("Failed to add task:", err);
    toast.error("Failed to add task.");
  }
};

export const patchTask = async (
  id: string,
  fields: Record<string, string>,
): Promise<void> => {
  try {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    if (!res.ok) {
      console.error("Failed to update task:", res.statusText);
      toast.error("Failed to update task.");
    }
  } catch (err) {
    console.error("Failed to update task:", err);
    toast.error("Failed to update task.");
  }
};

export const deleteTask = async (id: string): Promise<void> => {
  try {
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (!res.ok) {
      console.error("Failed to delete task:", res.statusText);
      toast.error("Failed to delete task.");
    }
  } catch (err) {
    console.error("Failed to delete task:", err);
    toast.error("Failed to delete task.");
  }
};
