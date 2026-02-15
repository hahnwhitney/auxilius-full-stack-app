import { render, screen } from "@testing-library/react";
import TaskColumn from "./index";
import TaskItem from "../TaskItem";
import { TaskStatus, type Task } from "../../types";

jest.mock("../TaskItem", () => jest.fn(() => <div data-testid="task-item" />));

const MockedTaskItem = TaskItem as jest.Mock;

describe("TaskColumn", () => {
  const mockTasks: Task[] = [
    { id: "1", title: "Task 1", description: "Desc 1", status: TaskStatus.TODO },
    { id: "2", title: "Task 2", description: "Desc 2", status: TaskStatus.TODO },
  ];
  const status = TaskStatus.TODO;
  const statusName = "To Do";
  const onTitleChange = jest.fn();
  const onDescriptionChange = jest.fn();
  const onStatusChange = jest.fn();
  const onDelete = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders column with correct status and name", () => {
    render(
      <TaskColumn
        tasks={mockTasks}
        status={status}
        statusName={statusName}
        onTitleChange={onTitleChange}
        onDescriptionChange={onDescriptionChange}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
      />
    );
    expect(screen.getByText(statusName)).toBeInTheDocument();
    expect(document.querySelector(`.${status}`)).toBeInTheDocument();
  });

  it("renders TaskItem for each task", () => {
    render(
      <TaskColumn
        tasks={mockTasks}
        status={status}
        statusName={statusName}
        onTitleChange={onTitleChange}
        onDescriptionChange={onDescriptionChange}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
      />
    );
    const items = screen.getAllByTestId("task-item");
    expect(items).toHaveLength(mockTasks.length);
  });

  it("passes correct props to TaskItem", () => {
    render(
      <TaskColumn
        tasks={mockTasks}
        status={status}
        statusName={statusName}
        onTitleChange={onTitleChange}
        onDescriptionChange={onDescriptionChange}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
      />
    );
    expect(MockedTaskItem).toHaveBeenCalledTimes(mockTasks.length);
    mockTasks.forEach((task, idx) => {
      expect(MockedTaskItem.mock.calls[idx][0]).toMatchObject({
        task,
        onTitleChange,
        onDescriptionChange,
        onStatusChange,
        onDelete,
      });
    });
  });

  it("renders nothing if tasks array is empty", () => {
    render(
      <TaskColumn
        tasks={[]}
        status={status}
        statusName={statusName}
        onTitleChange={onTitleChange}
        onDescriptionChange={onDescriptionChange}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
      />
    );
    expect(screen.queryByTestId("task-item")).toBeNull();
  });
});
