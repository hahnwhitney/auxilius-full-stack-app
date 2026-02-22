import { render, screen, act, fireEvent } from "@testing-library/react";
import TaskBoardView from "./index";
import { io } from "socket.io-client";
import { TaskStatus, type Task } from "../../types";

jest.mock("../../api/tasks", () => ({
  addTask: jest.fn().mockResolvedValue(undefined),
  patchTask: jest.fn().mockResolvedValue(undefined),
  deleteTask: jest.fn().mockResolvedValue(undefined),
  getTasks: jest.fn().mockResolvedValue([]),
}));
jest.mock("socket.io-client", () => ({
  io: jest.fn(() => {
    const listeners: Record<string, (...args: unknown[]) => void> = {};
    const on = jest.fn((event: string, cb: (...args: unknown[]) => void) => {
      listeners[event] = cb;
    });
    return {
      on,
      emit: jest.fn(),
      disconnect: jest.fn(),
      listeners,
    };
  }),
}));
jest.mock("../../components/TaskForm", () => ({
  __esModule: true,
  default: ({
    onAdd,
  }: {
    onAdd: (title: string, desc: string, status: string) => void;
  }) => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onAdd("title", "desc", TaskStatus.TODO);
      }}
    >
      <button type="submit">Add</button>
    </form>
  ),
}));
jest.mock("../../components/TaskColumn", () => ({
  __esModule: true,
  default: (props: { status: string; statusName: string; tasks?: Task[] }) => (
    <div data-testid={props.status}>
      <h2>{props.statusName}</h2>
      {props.tasks && props.tasks.length === 0 && <p>No tasks yet</p>}
      {props.tasks && props.tasks.length > 0 && <div>Tasks present</div>}
    </div>
  ),
}));

function triggerSocketEvent(
  socket: { listeners: Record<string, (...args: unknown[]) => void> },
  event: string,
  payload?: unknown,
) {
  act(() => {
    socket.listeners[event](payload);
  });
}

describe("TaskBoardView", () => {
  let socket: {
    emit: jest.Mock;
    listeners: Record<string, (...args: unknown[]) => void>;
    disconnect: jest.Mock;
    on: jest.Mock;
  };

  beforeEach(async () => {
    (io as jest.Mock).mockClear();
    await act(async () => {
      render(<TaskBoardView />);
    });
    socket = (io as jest.Mock).mock.results[0].value;
  });

  it("renders header, connection status, and columns", () => {
    expect(screen.getByText("All Tasks")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "To Do" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "In Progress" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Done" })).toBeInTheDocument();
  });

  it("shows 'Disconnected' initially, then 'Connected' on connect", () => {
    expect(screen.getByText("Disconnected")).toBeInTheDocument();
    triggerSocketEvent(socket, "connect");
    expect(screen.getByText("Connected")).toBeInTheDocument();
    triggerSocketEvent(socket, "disconnect");
    expect(screen.getByText("Disconnected")).toBeInTheDocument();
  });

  it("shows empty message when no tasks", () => {
    expect(screen.getAllByText("No tasks yet").length).toBeGreaterThan(0);
  });

  it("handles tasks:initial event", () => {
    const initialTasks = [
      { id: "1", title: "A", description: "B", status: TaskStatus.TODO },
      { id: "2", title: "C", description: "D", status: TaskStatus.DONE },
    ];
    triggerSocketEvent(socket, "tasks:initial", initialTasks);
    expect(screen.getByTestId(TaskStatus.TODO)).toBeInTheDocument();
    expect(screen.getByTestId(TaskStatus.DONE)).toBeInTheDocument();
  });

  it("calls addTask when TaskForm adds a task", async () => {
    const { addTask } = await import("../../api/tasks");
    const addBtn = screen.getByText("Add");
    fireEvent.click(addBtn);
    expect(addTask).toHaveBeenCalledWith("title", "desc", TaskStatus.TODO);
  });

  it("renders a status filter dropdown with All and status options", () => {
    const filterSelect = screen.getByRole("combobox");
    expect(filterSelect).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "All" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "To Do" })).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "In Progress" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Done" })).toBeInTheDocument();
  });

  it("calls getTasks with the selected status when filter changes", async () => {
    const { getTasks } = await import("../../api/tasks");
    const filterSelect = screen.getByRole("combobox");
    await act(async () => {
      fireEvent.change(filterSelect, {
        target: { value: TaskStatus.IN_PROGRESS },
      });
    });
    expect(getTasks).toHaveBeenCalledWith(TaskStatus.IN_PROGRESS);
  });

  it("shows only the matching column when a status is selected", async () => {
    const filterSelect = screen.getByRole("combobox");
    await act(async () => {
      fireEvent.change(filterSelect, {
        target: { value: TaskStatus.IN_PROGRESS },
      });
    });
    expect(screen.queryByTestId(TaskStatus.TODO)).not.toBeInTheDocument();
    expect(screen.getByTestId(TaskStatus.IN_PROGRESS)).toBeInTheDocument();
    expect(screen.queryByTestId(TaskStatus.DONE)).not.toBeInTheDocument();
  });

  it("shows all columns when filter is reset to All", async () => {
    const filterSelect = screen.getByRole("combobox");
    await act(async () => {
      fireEvent.change(filterSelect, {
        target: { value: TaskStatus.IN_PROGRESS },
      });
    });
    await act(async () => {
      fireEvent.change(filterSelect, { target: { value: "" } });
    });
    expect(screen.getByTestId(TaskStatus.TODO)).toBeInTheDocument();
    expect(screen.getByTestId(TaskStatus.IN_PROGRESS)).toBeInTheDocument();
    expect(screen.getByTestId(TaskStatus.DONE)).toBeInTheDocument();
  });

  it("calls getTasks with undefined when filter is reset to All", async () => {
    const { getTasks } = await import("../../api/tasks");
    const filterSelect = screen.getByRole("combobox");
    await act(async () => {
      fireEvent.change(filterSelect, {
        target: { value: TaskStatus.IN_PROGRESS },
      });
    });
    await act(async () => {
      fireEvent.change(filterSelect, { target: { value: "" } });
    });
    expect(getTasks).toHaveBeenCalledWith(undefined);
  });
});
