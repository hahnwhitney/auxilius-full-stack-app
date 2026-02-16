export enum TaskStatus {
  TODO = "to_do",
  IN_PROGRESS = "in_progress",
  DONE = "done",
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
}

export interface User {
  id: string;
  username: string;
}
