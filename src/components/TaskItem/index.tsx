import { useState } from 'react'
import { TaskStatus, type Task } from '../../types'

interface TaskItemProps {
  task: Task
  onTitleChange: (id: string, title: string) => void
  onDescriptionChange: (id: string, description: string) => void
  onStatusChange: (id: string, status: string) => void
  onDelete: (id: string) => void
}

const STATUS_OPTIONS = [
  { value: TaskStatus.TODO, label: 'To Do' },
  { value: TaskStatus.IN_PROGRESS, label: 'In Progress' },
  { value: TaskStatus.DONE, label: 'Done' },
]

function TaskItem({ task, onTitleChange, onDescriptionChange, onStatusChange, onDelete }: TaskItemProps) {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description)

  const handleTitleBlur = () => {
    const trimmed = title.trim()
    if (trimmed.length > 0 && trimmed !== task.title) {
      onTitleChange(task.id, trimmed)
    } else {
      setTitle(task.title)
    }
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur()
      const trimmed = title.trim()
      if (trimmed.length > 0 && trimmed !== task.title) {
        onTitleChange(task.id, trimmed)
      } else {
        setTitle(task.title)
      }
    }
  }

  const handleDescriptionBlur = () => {
    if (description !== task.description) {
      onDescriptionChange(task.id, description)
    }
  }

  const handleDescriptionKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur()
      if (description !== task.description) {
        onDescriptionChange(task.id, description)
      }
    }
  }

  return (
    <div className={`task-item ${task.status}`}>
      <label className="task-label">
        <span>Title</span>
        <input
          type="text"
          className="task-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          onKeyDown={handleTitleKeyDown}
        />
      </label>

      <label className="task-label">
        <span>Description</span>
        <input
          type="text"
          className="task-input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={handleDescriptionBlur}
          onKeyDown={handleDescriptionKeyDown}
          placeholder="Add a description..."
        />
      </label>

      <label className="task-label">
        <span>Status</span>
        <select
          value={task.status}
          onChange={e => onStatusChange(task.id, e.target.value)}
          aria-label="Status"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <div className="delete-btn-wrapper">
        <button
          onClick={() => onDelete(task.id)}
          className="task-delete-btn"
          aria-label={`Delete ${task.title}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M232.7 69.9L224 96L128 96C110.3 96 96 110.3 96 128C96 145.7 110.3 160 128 160L512 160C529.7 160 544 145.7 544 128C544 110.3 529.7 96 512 96L416 96L407.3 69.9C402.9 56.8 390.7 48 376.9 48L263.1 48C249.3 48 237.1 56.8 232.7 69.9zM512 208L128 208L149.1 531.1C150.7 556.4 171.7 576 197 576L443 576C468.3 576 489.3 556.4 490.9 531.1L512 208z"/></svg>
        </button>
    </div>
    </div>
  )
}

export default TaskItem
