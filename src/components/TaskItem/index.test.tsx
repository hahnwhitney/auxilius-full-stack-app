import { render, screen, fireEvent } from "@testing-library/react";
import TaskItem from "./index";
import { TaskStatus } from "../../types";
import { patchTask, deleteTask } from "../../api/tasks";

jest.mock("../../api/tasks", () => ({
  patchTask: jest.fn().mockResolvedValue(undefined),
  deleteTask: jest.fn().mockResolvedValue(undefined),
}));

afterEach(() => {
  jest.clearAllMocks();
});

describe("TaskItem", () => {
  const task = {
    id: "1",
    title: "Test Task",
    description: "Test Description",
    status: TaskStatus.TODO,
    userId: null,
  };

  it("renders all fields and options", () => {
    render(<TaskItem task={task} />);
    expect(screen.getByDisplayValue(task.title)).toBeInTheDocument();
    expect(screen.getByDisplayValue(task.description)).toBeInTheDocument();
    expect(screen.getByText("To Do")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: `Delete ${task.title}` }),
    ).toBeInTheDocument();
  });

  it("PATCHes title on blur if title changed and not empty", () => {
    render(<TaskItem task={task} />);
    const titleInput = screen.getByDisplayValue(task.title);
    fireEvent.change(titleInput, { target: { value: "New Title" } });
    fireEvent.blur(titleInput);
    expect(patchTask).toHaveBeenCalledWith(task.id, { title: "New Title" });
  });

  it("resets title if changed to empty or unchanged", () => {
    render(<TaskItem task={task} />);
    const titleInput = screen.getByDisplayValue(task.title);
    fireEvent.change(titleInput, { target: { value: "" } });
    fireEvent.blur(titleInput);
    expect(patchTask).not.toHaveBeenCalled();
    expect(titleInput).toHaveValue(task.title);

    fireEvent.change(titleInput, { target: { value: task.title } });
    fireEvent.blur(titleInput);
    expect(patchTask).not.toHaveBeenCalled();
    expect(titleInput).toHaveValue(task.title);
  });

  it("PATCHes description on blur if description changed", () => {
    render(<TaskItem task={task} />);
    const descInput = screen.getByDisplayValue(task.description);
    fireEvent.change(descInput, { target: { value: "New Desc" } });
    fireEvent.blur(descInput);
    expect(patchTask).toHaveBeenCalledWith(task.id, {
      description: "New Desc",
    });
  });

  it("does not PATCH description if unchanged", () => {
    render(<TaskItem task={task} />);
    const descInput = screen.getByDisplayValue(task.description);
    fireEvent.blur(descInput);
    expect(patchTask).not.toHaveBeenCalled();
  });

  it("PATCHes status when select changes", () => {
    render(<TaskItem task={task} />);
    const select = screen.getByLabelText("Status");
    fireEvent.change(select, { target: { value: TaskStatus.DONE } });
    expect(patchTask).toHaveBeenCalledWith(task.id, {
      status: TaskStatus.DONE,
    });

    jest.clearAllMocks();
    fireEvent.change(select, { target: { value: TaskStatus.IN_PROGRESS } });
    expect(patchTask).toHaveBeenCalledWith(task.id, {
      status: TaskStatus.IN_PROGRESS,
    });
  });

  it("DELETEs task when delete button clicked", () => {
    render(<TaskItem task={task} />);
    const deleteBtn = screen.getByRole("button", {
      name: `Delete ${task.title}`,
    });
    fireEvent.click(deleteBtn);
    expect(deleteTask).toHaveBeenCalledWith(task.id);
  });

  it("syncs local state when task prop changes", () => {
    const { rerender } = render(<TaskItem task={task} />);
    expect(screen.getByDisplayValue("Test Task")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test Description")).toBeInTheDocument();

    const updatedTask = {
      ...task,
      title: "Updated Title",
      description: "Updated Description",
    };
    rerender(<TaskItem task={updatedTask} />);
    expect(screen.getByDisplayValue("Updated Title")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Updated Description")).toBeInTheDocument();
  });

  it("PATCHes on Enter key for title and description", () => {
    render(<TaskItem task={task} />);
    const titleInput = screen.getByDisplayValue(task.title);
    titleInput.focus();
    fireEvent.change(titleInput, { target: { value: "New Title" } });
    fireEvent.keyDown(titleInput, { key: "Enter" });
    expect(patchTask).toHaveBeenCalledWith(task.id, { title: "New Title" });

    jest.clearAllMocks();
    const descInput = screen.getByDisplayValue(task.description);
    descInput.focus();
    fireEvent.change(descInput, { target: { value: "New Desc" } });
    fireEvent.keyDown(descInput, { key: "Enter" });
    expect(patchTask).toHaveBeenCalledWith(task.id, {
      description: "New Desc",
    });
  });
});
