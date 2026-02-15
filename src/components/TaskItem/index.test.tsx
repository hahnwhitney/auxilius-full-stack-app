import { render, screen, fireEvent } from "@testing-library/react";
import TaskItem from "./index";
import { TaskStatus } from "../../types";

describe("TaskItem", () => {
  const task = {
    id: "1",
    title: "Test Task",
    description: "Test Description",
    status: TaskStatus.TODO,
  };
  const onTitleChange = jest.fn();
  const onDescriptionChange = jest.fn();
  const onStatusChange = jest.fn();
  const onDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all fields and options", () => {
    render(
      <TaskItem
        task={task}
        onTitleChange={onTitleChange}
        onDescriptionChange={onDescriptionChange}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
      />
    );
    expect(screen.getByDisplayValue(task.title)).toBeInTheDocument();
    expect(screen.getByDisplayValue(task.description)).toBeInTheDocument();
    expect(screen.getByText("To Do")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: `Delete ${task.title}` })).toBeInTheDocument();
  });

  it("calls onTitleChange on blur if title changed and not empty", () => {
    render(
      <TaskItem
        task={task}
        onTitleChange={onTitleChange}
        onDescriptionChange={onDescriptionChange}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
      />
    );
    const titleInput = screen.getByDisplayValue(task.title);
    fireEvent.change(titleInput, { target: { value: "New Title" } });
    fireEvent.blur(titleInput);
    expect(onTitleChange).toHaveBeenCalledWith(task.id, "New Title");
  });

  it("resets title if changed to empty or unchanged", () => {
    render(
      <TaskItem
        task={task}
        onTitleChange={onTitleChange}
        onDescriptionChange={onDescriptionChange}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
      />
    );
    const titleInput = screen.getByDisplayValue(task.title);
    fireEvent.change(titleInput, { target: { value: "" } });
    fireEvent.blur(titleInput);
    expect(onTitleChange).not.toHaveBeenCalled();
    expect(titleInput).toHaveValue(task.title);

    fireEvent.change(titleInput, { target: { value: task.title } });
    fireEvent.blur(titleInput);
    expect(onTitleChange).not.toHaveBeenCalled();
    expect(titleInput).toHaveValue(task.title);
  });

  it("calls onDescriptionChange on blur if description changed", () => {
    render(
      <TaskItem
        task={task}
        onTitleChange={onTitleChange}
        onDescriptionChange={onDescriptionChange}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
      />
    );
    const descInput = screen.getByDisplayValue(task.description);
    fireEvent.change(descInput, { target: { value: "New Desc" } });
    fireEvent.blur(descInput);
    expect(onDescriptionChange).toHaveBeenCalledWith(task.id, "New Desc");
  });

  it("does not call onDescriptionChange if unchanged", () => {
    render(
      <TaskItem
        task={task}
        onTitleChange={onTitleChange}
        onDescriptionChange={onDescriptionChange}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
      />
    );
    const descInput = screen.getByDisplayValue(task.description);
    fireEvent.blur(descInput);
    expect(onDescriptionChange).not.toHaveBeenCalled();
  });

  it("calls onStatusChange when select changes", () => {
    render(
      <TaskItem
        task={task}
        onTitleChange={onTitleChange}
        onDescriptionChange={onDescriptionChange}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
      />
    );
    const select = screen.getByLabelText("Status");
    fireEvent.change(select, { target: { value: TaskStatus.DONE } });
    fireEvent.change(select, { target: { value: TaskStatus.IN_PROGRESS } });
    expect(onStatusChange).toHaveBeenCalledTimes(2);
    expect(onStatusChange).toHaveBeenCalledWith(task.id, TaskStatus.DONE);
    expect(onStatusChange).toHaveBeenCalledWith(task.id, TaskStatus.IN_PROGRESS);
  });

  it("calls onDelete when delete button clicked", () => {
    render(
      <TaskItem
        task={task}
        onTitleChange={onTitleChange}
        onDescriptionChange={onDescriptionChange}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
      />
    );
    const deleteBtn = screen.getByRole("button", { name: `Delete ${task.title}` });
    fireEvent.click(deleteBtn);
    expect(onDelete).toHaveBeenCalledWith(task.id);
  });

  it("handles Enter key for title and description blur", () => {
    render(
      <TaskItem
        task={task}
        onTitleChange={onTitleChange}
        onDescriptionChange={onDescriptionChange}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
      />
    );
    const titleInput = screen.getByDisplayValue(task.title);
    fireEvent.change(titleInput, { target: { value: "New Title" } });
    fireEvent.keyDown(titleInput, { key: "Enter" });
    expect(onTitleChange).toHaveBeenCalledWith(task.id, "New Title");

    const descInput = screen.getByDisplayValue(task.description);
    fireEvent.change(descInput, { target: { value: "New Desc" } });
    fireEvent.keyDown(descInput, { key: "Enter" });
    expect(onDescriptionChange).toHaveBeenCalledWith(task.id, "New Desc");
  });
});
