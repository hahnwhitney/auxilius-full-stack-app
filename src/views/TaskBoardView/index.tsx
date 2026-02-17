import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { TaskStatus, type Task } from "../../types";
import TaskForm from "../../components/TaskForm";
import TaskColumn from "../../components/TaskColumn";
import styles from "./index.module.css";

function TaskBoardView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const newSocket = io();

    newSocket.on("connect", () => setConnected(true));
    newSocket.on("disconnect", () => setConnected(false));

    newSocket.on("tasks:initial", (initialTasks: Task[]) => {
      setTasks(initialTasks);
    });

    newSocket.on("task:added", (task: Task) => {
      setTasks((prev) => [...prev, task]);
    });

    newSocket.on("task:updated", (task: Task) => {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
    });

    newSocket.on("task:deleted", (id: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    });

    // Defer setSocket to avoid cascading renders
    Promise.resolve().then(() => setSocket(newSocket));

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleAdd = (
    title: string,
    description: string,
    status: TaskStatus,
  ) => {
    socket?.emit("task:add", { title, description, status });
  };

  const toBeDoneTasks = tasks.filter((task) => task.status === TaskStatus.TODO);
  const inProgressTasks = tasks.filter(
    (task) => task.status === TaskStatus.IN_PROGRESS,
  );
  const completedTasks = tasks.filter(
    (task) => task.status === TaskStatus.DONE,
  );

  return (
    <div>
      <div className={styles.headerWrapper}>
        <h1>All Tasks</h1>
        <div
          className={`${styles.connectionStatus} ${connected ? styles.connected : styles.disconnected}`}
        >
          {connected ? "Connected" : "Disconnected"}
        </div>
      </div>
      <TaskForm onAdd={handleAdd} />

      <div className={styles.taskGrid}>
        <TaskColumn
          tasks={toBeDoneTasks}
          status={TaskStatus.TODO}
          statusName="To Do"
        />

        <TaskColumn
          tasks={inProgressTasks}
          status={TaskStatus.IN_PROGRESS}
          statusName="In Progress"
        />

        <TaskColumn
          tasks={completedTasks}
          status={TaskStatus.DONE}
          statusName="Done"
        />
      </div>
    </div>
  );
}

export default TaskBoardView;
