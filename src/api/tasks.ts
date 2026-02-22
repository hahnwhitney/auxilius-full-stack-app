import { toast } from "react-toastify";
import { TaskStatus, type Task } from "../types";

export interface PaginatedTasks {
  data: Task[];
  total: number;
  page: number;
  limit: number;
}

export const getTasks = async (
  status?: TaskStatus,
  page = 1,
  limit = 20,
): Promise<PaginatedTasks> => {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  params.set("page", String(page));
  params.set("limit", String(limit));
  const res = await fetch(`/api/tasks?${params}`);
  if (!res.ok) throw new Error(`Failed to fetch tasks: ${res.statusText}`);
  return res.json();
};

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
