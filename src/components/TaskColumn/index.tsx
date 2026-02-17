import { TaskStatus, type Task } from "../../types";
import TaskItem from "../TaskItem";
import styles from "./index.module.css";

interface TaskColumnProps {
  tasks: Task[];
  status: TaskStatus;
  statusName: string;
}

const TaskColumn = ({ tasks, status, statusName }: TaskColumnProps) => (
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
      tasks.map((task) => <TaskItem key={task.id} task={task} />)
    )}
  </div>
);

export default TaskColumn;
