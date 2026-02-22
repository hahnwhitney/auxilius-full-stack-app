export const TaskStatus = {
  TODO: "to_do",
  IN_PROGRESS: "in_progress",
  DONE: "done",
} as const;

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  userId: string | null;
}
