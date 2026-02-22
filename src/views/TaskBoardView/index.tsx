import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { TaskStatus, type Task } from "../../types";
import { addTask, getTasks } from "../../api/tasks";
import TaskForm from "../../components/TaskForm";
import TaskColumn from "../../components/TaskColumn";
import styles from "./index.module.css";

const COLUMNS = [
  { status: TaskStatus.TODO, statusName: "To Do" },
  { status: TaskStatus.IN_PROGRESS, statusName: "In Progress" },
  { status: TaskStatus.DONE, statusName: "Done" },
];

function TaskBoardView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [connected, setConnected] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const newSocket = io();

    newSocket.on("connect", () => setConnected(true));
    newSocket.on("disconnect", () => setConnected(false));

    newSocket.on("tasks:initial", (initialTasks: Task[]) => {
      setTasks(initialTasks);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    getTasks(selectedStatus ?? undefined).then(setTasks).catch(console.error);
  }, [selectedStatus]);

  const handleAdd = (
    title: string,
    description: string,
    status: TaskStatus,
  ) => {
    addTask(title, description, status);
  };

  const visibleColumns = selectedStatus
    ? COLUMNS.filter((c) => c.status === selectedStatus)
    : COLUMNS;

  return (
    <div>
      <div className={styles.headerWrapper}>
        <h1>All Tasks</h1>
        <select
          value={selectedStatus ?? ""}
          onChange={(e) =>
            setSelectedStatus((e.target.value as TaskStatus) || null)
          }
        >
          <option value="">All</option>
          <option value={TaskStatus.TODO}>To Do</option>
          <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
          <option value={TaskStatus.DONE}>Done</option>
        </select>
        <div
          className={`${styles.connectionStatus} ${connected ? styles.connected : styles.disconnected}`}
        >
          {connected ? "Connected" : "Disconnected"}
        </div>
      </div>
      <TaskForm onAdd={handleAdd} />

      <div className={styles.taskGrid}>
        {visibleColumns.map((col) => (
          <TaskColumn
            key={col.status}
            tasks={tasks.filter((t) => t.status === col.status)}
            status={col.status}
            statusName={col.statusName}
          />
        ))}
      </div>
    </div>
  );
}

export default TaskBoardView;
