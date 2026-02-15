import { useEffect, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import { TaskStatus, type Task } from './types'
import TaskForm from './components/TaskForm'
import TaskColumn from './components/TaskColumn'
import './App.css'

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const newSocket = io()

    newSocket.on('connect', () => setConnected(true))
    newSocket.on('disconnect', () => setConnected(false))

    newSocket.on('tasks:initial', (initialTasks: Task[]) => {
      setTasks(initialTasks)
    })

    newSocket.on('task:added', (task: Task) => {
      setTasks((prev) => [...prev, task])
    })

    newSocket.on('task:statusChanged', ({ id, status }: { id: string; status: TaskStatus }) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status } : t))
      )
    })

    newSocket.on('task:titleChanged', ({ id, title }: { id: string; title: string }) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, title } : t))
      )
    })

    newSocket.on('task:descriptionChanged', ({ id, description }: { id: string; description: string }) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, description } : t))
      )
    })

    newSocket.on('task:deleted', (id: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== id))
    })


    // Defer setSocket to avoid cascading renders
    Promise.resolve().then(() => setSocket(newSocket))

    return () => {
      newSocket.disconnect()
    }
  }, [])

  const handleAdd = (title: string, description: string, status: TaskStatus) => {
    socket?.emit('task:add', { title, description, status })
  }

  const handleTitleChange = (id: string, title: string) => {
    socket?.emit('task:titleChange', { id, title })
  }

  const handleDescriptionChange = (id: string, description: string) => {
    socket?.emit('task:descriptionChange', { id, description })
  }

  const handleStatusChange = (id: string) => {
    socket?.emit('task:statusChange', id)
  }

  const handleDelete = (id: string) => {
    socket?.emit('task:delete', id)
  }

  const toBeDoneTasks = tasks.filter((task) => task.status === TaskStatus.TODO)
  const inProgressTasks = tasks.filter((task) => task.status === TaskStatus.IN_PROGRESS)
  const completedTasks = tasks.filter((task) => task.status === TaskStatus.DONE)

  return (
    <div className="app">
      <div className="header-wrapper">
        <h1>All Tasks</h1>
        <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
          {connected ? 'Connected' : 'Disconnected'}
        </div>
      </div>
      <TaskForm onAdd={handleAdd} />

      {tasks.length === 0 && <p className="empty-message">No tasks yet</p>}

      <div className="task-grid">
        <TaskColumn
          tasks={toBeDoneTasks}
          status={TaskStatus.TODO}
          statusName="To Do"
          onTitleChange={handleTitleChange}
          onDescriptionChange={handleDescriptionChange}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />

        <TaskColumn
          tasks={inProgressTasks}
          status={TaskStatus.IN_PROGRESS}
          statusName="In Progress"
          onTitleChange={handleTitleChange}
          onDescriptionChange={handleDescriptionChange}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />

        <TaskColumn
          tasks={completedTasks}
          status={TaskStatus.DONE}
          statusName="Done"
          onTitleChange={handleTitleChange}
          onDescriptionChange={handleDescriptionChange}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      </div>
    </div>
  )
}

export default App
