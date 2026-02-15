import { TaskStatus, type Task } from '../../types'
import TaskItem from '../TaskItem'

interface TaskColumnProps {
  tasks: Task[];
  status: TaskStatus;
  statusName: string;
  onTitleChange: (id: string, title: string) => void;
  onDescriptionChange: (id: string, description: string) => void;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}

const TaskColumn = ({
  tasks,
  status,
  statusName,
  onTitleChange,
  onDescriptionChange,
  onStatusChange,
  onDelete,
}: TaskColumnProps) => (
  <div className={status}>
    <h2>{statusName}</h2>
    {tasks.map((task) => (
      <TaskItem
        key={task.id}
        task={task}
        onTitleChange={onTitleChange}
        onDescriptionChange={onDescriptionChange}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
      />
    ))}
  </div>
);

export default TaskColumn
