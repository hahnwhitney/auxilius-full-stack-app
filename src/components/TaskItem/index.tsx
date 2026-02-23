import { useEffect, useState } from "react";
import { TaskStatus, type Task } from "../../types";
import { patchTask, deleteTask } from "../../api/tasks";
import styles from "./index.module.css";

const STATUS_OPTIONS = [
  { value: TaskStatus.TODO, label: "To Do" },
  { value: TaskStatus.IN_PROGRESS, label: "In Progress" },
  { value: TaskStatus.DONE, label: "Done" },
];

interface TaskItemProps {
  task: Task;
  onEditStart: (taskId: string) => void;
  onEditStop: (taskId: string) => void;
  otherEditors: string[];
}

function buildEditorWarning(editors: string[]): string {
  if (editors.length === 1) return `${editors[0]} is editing this task`;
  const allButLast = editors.slice(0, -1).join(", ");
  return `${allButLast} and ${editors[editors.length - 1]} are editing this task`;
}

function TaskItem({ task, onEditStart, onEditStop, otherEditors }: TaskItemProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState(task.status);

  useEffect(() => {
    if (title !== task.title) {
      setTitle(task.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.title]);

  useEffect(() => {
    if (description !== task.description) {
      setDescription(task.description);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.description]);

  useEffect(() => {
    if (status !== task.status) {
      setStatus(task.status);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.status]);

  const handleTitleChange = (id: string, title: string) => {
    patchTask(id, { title });
  };

  const handleDescriptionChange = (id: string, description: string) => {
    patchTask(id, { description });
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    setStatus(newStatus as TaskStatus);
    patchTask(id, { status: newStatus });
  };

  const handleTitleBlur = () => {
    const trimmed = title.trim();
    if (trimmed.length > 0 && trimmed !== task.title) {
      handleTitleChange(task.id, trimmed);
    } else {
      setTitle(task.title);
    }
    onEditStop(task.id);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleDescriptionBlur = () => {
    if (description !== task.description) {
      handleDescriptionChange(task.id, description);
    }
    onEditStop(task.id);
  };

  const handleDescriptionKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className={`${styles.taskItem} ${styles[status]}`}>
      {otherEditors.length > 0 && (
        <div className={styles.editingWarning} role="alert">
          <span>⚠ {buildEditorWarning(otherEditors)}</span>
        </div>
      )}

      <label className={styles.taskLabel}>
        <span>Title</span>
        <input
          type="text"
          className={styles.taskInput}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => onEditStart(task.id)}
          onBlur={handleTitleBlur}
          onKeyDown={handleTitleKeyDown}
        />
      </label>

      <label className={styles.taskLabel}>
        <span>Description</span>
        <input
          type="text"
          className={styles.taskInput}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onFocus={() => onEditStart(task.id)}
          onBlur={handleDescriptionBlur}
          onKeyDown={handleDescriptionKeyDown}
          placeholder="Add a description..."
        />
      </label>

      <label className={styles.taskLabel}>
        <span>Status</span>
        <select
          value={status}
          onChange={(e) => handleStatusChange(task.id, e.target.value)}
          aria-label="Status"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <div className={styles.deleteBtnWrapper}>
        <button
          onClick={() => deleteTask(task.id)}
          className={styles.taskDeleteBtn}
          aria-label={`Delete ${task.title}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
            <path d="M232.7 69.9L224 96L128 96C110.3 96 96 110.3 96 128C96 145.7 110.3 160 128 160L512 160C529.7 160 544 145.7 544 128C544 110.3 529.7 96 512 96L416 96L407.3 69.9C402.9 56.8 390.7 48 376.9 48L263.1 48C249.3 48 237.1 56.8 232.7 69.9zM512 208L128 208L149.1 531.1C150.7 556.4 171.7 576 197 576L443 576C468.3 576 489.3 556.4 490.9 531.1L512 208z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default TaskItem;
