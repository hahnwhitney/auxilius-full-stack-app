import { render, screen, fireEvent } from "@testing-library/react";
import TaskForm from "./index";
import { TaskStatus } from "../../types";

describe("TaskForm", () => {
  const onAdd = jest.fn();

  beforeEach(() => {
    onAdd.mockClear();
  });

  it("renders all form fields and options", () => {
    render(<TaskForm onAdd={onAdd} />);
    expect(screen.getByPlaceholderText("Task title...")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Description (optional)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
    expect(screen.getByText("To Do")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
  });

  it("calls onAdd with correct values and resets fields", () => {
    render(<TaskForm onAdd={onAdd} />);
    const titleInput = screen.getByPlaceholderText("Task title...");
    const descInput = screen.getByPlaceholderText("Description (optional)");
    const select = screen.getByRole("combobox");
    const addBtn = screen.getByRole("button", { name: /add/i });

    fireEvent.change(titleInput, { target: { value: "New Task" } });
    fireEvent.change(descInput, { target: { value: "Some description" } });
    fireEvent.change(select, { target: { value: TaskStatus.IN_PROGRESS } });
    fireEvent.click(addBtn);

    expect(onAdd).toHaveBeenCalledWith("New Task", "Some description", TaskStatus.IN_PROGRESS);
    expect(titleInput).toHaveValue("");
    expect(descInput).toHaveValue("");
    expect(select).toHaveValue(TaskStatus.TODO); // resets to TODO
  });

  it("does not call onAdd if title is empty or whitespace", () => {
    render(<TaskForm onAdd={onAdd} />);
    const titleInput = screen.getByPlaceholderText("Task title...");
    const addBtn = screen.getByRole("button", { name: /add/i });

    fireEvent.change(titleInput, { target: { value: "   " } });
    fireEvent.click(addBtn);
    expect(onAdd).not.toHaveBeenCalled();

    fireEvent.change(titleInput, { target: { value: "" } });
    fireEvent.click(addBtn);
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("changes status select value", () => {
    render(<TaskForm onAdd={onAdd} />);
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: TaskStatus.DONE } });
    expect(select).toHaveValue(TaskStatus.DONE);
  });
});
