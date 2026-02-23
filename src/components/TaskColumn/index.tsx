import { TaskStatus, type Task } from "../../types";
import TaskItem from "../TaskItem";
import styles from "./index.module.css";

interface TaskColumnProps {
  tasks: Task[];
  status: TaskStatus;
  statusName: string;
  onEditStart: (taskId: string) => void;
  onEditStop: (taskId: string) => void;
  editingBy: Record<string, string[]>;
  currentUsername: string;
}

const TaskColumn = ({
  tasks,
  status,
  statusName,
  onEditStart,
  onEditStop,
  editingBy,
  currentUsername,
}: TaskColumnProps) => (
  <div className={`${styles.column} ${styles[status]}`}>
    <h2>{statusName}</h2>
    {tasks.length === 0 ? (
      <p
        style={{
          color: "var(--dark-blue-primary)",
          fontStyle: "italic",
          textAlign: "center",
          marginTop: "2rem",
        }}
      >
        No tasks yet
      </p>
    ) : (
      tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onEditStart={onEditStart}
          onEditStop={onEditStop}
          otherEditors={(editingBy[task.id] ?? []).filter(
            (u) => u !== currentUsername,
          )}
        />
      ))
    )}
  </div>
);

export default TaskColumn;
