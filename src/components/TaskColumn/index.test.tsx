import { render, screen } from "@testing-library/react";
import TaskColumn from "./index";
import TaskItem from "../TaskItem";
import { TaskStatus, type Task } from "../../types";

jest.mock("../TaskItem", () => jest.fn(() => <div data-testid="task-item" />));

const MockedTaskItem = TaskItem as jest.Mock;

describe("TaskColumn", () => {
  const mockTasks: Task[] = [
    {
      id: "1",
      title: "Task 1",
      description: "Desc 1",
      status: TaskStatus.TODO,
      userId: null,
    },
    {
      id: "2",
      title: "Task 2",
      description: "Desc 2",
      status: TaskStatus.TODO,
      userId: null,
    },
  ];
  const status = TaskStatus.TODO;
  const statusName = "To Do";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders column with correct status and name", () => {
    render(
      <TaskColumn tasks={mockTasks} status={status} statusName={statusName} onEditStart={jest.fn()} onEditStop={jest.fn()} editingBy={{}} currentUsername="testuser" />,
    );
    expect(screen.getByText(statusName)).toBeInTheDocument();
    expect(document.querySelector(`.${status}`)).toBeInTheDocument();
  });

  it("renders TaskItem for each task", () => {
    render(
      <TaskColumn tasks={mockTasks} status={status} statusName={statusName} onEditStart={jest.fn()} onEditStop={jest.fn()} editingBy={{}} currentUsername="testuser" />,
    );
    const items = screen.getAllByTestId("task-item");
    expect(items).toHaveLength(mockTasks.length);
  });

  it("passes correct props to TaskItem", () => {
    render(
      <TaskColumn tasks={mockTasks} status={status} statusName={statusName} onEditStart={jest.fn()} onEditStop={jest.fn()} editingBy={{}} currentUsername="testuser" />,
    );
    expect(MockedTaskItem).toHaveBeenCalledTimes(mockTasks.length);
    mockTasks.forEach((task, idx) => {
      expect(MockedTaskItem.mock.calls[idx][0]).toMatchObject({ task });
    });
  });

  it("renders nothing if tasks array is empty", () => {
    render(<TaskColumn tasks={[]} status={status} statusName={statusName} onEditStart={jest.fn()} onEditStop={jest.fn()} editingBy={{}} currentUsername="testuser" />);
    expect(screen.queryByTestId("task-item")).toBeNull();
  });
});
