import { useEffect, useState } from "react";
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

const LIMIT = 20;

function TaskBoardView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [connected, setConnected] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const newSocket = io();

    newSocket.on("connect", () => setConnected(true));
    newSocket.on("disconnect", () => setConnected(false));

    newSocket.on("tasks:initial", (initialTasks: Task[]) => {
      setTasks(Array.isArray(initialTasks) ? initialTasks : []);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    getTasks(selectedStatus ?? undefined, page, LIMIT)
      .then(({ data, total }) => {
        setTasks(data ?? []);
        setTotal(total ?? 0);
      })
      .catch(console.error);
  }, [selectedStatus, page]);

  const handleAdd = (
    title: string,
    description: string,
    status: TaskStatus,
  ) => {
    addTask(title, description, status);
  };

  const handleStatusChange = (newStatus: TaskStatus | null) => {
    setSelectedStatus(newStatus);
    setPage(1);
  };

  const visibleColumns = selectedStatus
    ? COLUMNS.filter((c) => c.status === selectedStatus)
    : COLUMNS;

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div>
      <div className={styles.headerWrapper}>
        <h1>All Tasks</h1>
        <select
          value={selectedStatus ?? ""}
          onChange={(e) =>
            handleStatusChange((e.target.value as TaskStatus) || null)
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

      {total > 0 && (
        <div className={styles.pagination}>
          <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default TaskBoardView;
