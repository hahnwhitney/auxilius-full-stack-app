import { useState, type FormEvent } from 'react'
import Button from "../Button";
import { TaskStatus } from '../../types'
import styles from "./index.module.css";

interface TaskFormProps {
  onAdd: (title: string, description: string, status: TaskStatus) => void
}

const STATUS_OPTIONS = [
  { value: TaskStatus.TODO, label: 'To Do' },
  { value: TaskStatus.IN_PROGRESS, label: 'In Progress' },
  { value: TaskStatus.DONE, label: 'Done' },
]

function TaskForm({ onAdd }: TaskFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = title.trim()
    if (trimmed.length === 0) return
    onAdd(trimmed, description, status)
    setTitle('')
    setDescription('')
    setStatus(TaskStatus.TODO)
  }

  return (
    <form onSubmit={handleSubmit} className={styles.taskForm}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title..."
        className={styles.taskInput}
      />
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        className={styles.taskInput}
      />
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as TaskStatus)}
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <Button type="submit" text="Add" />
    </form>
  )
}

export default TaskForm
