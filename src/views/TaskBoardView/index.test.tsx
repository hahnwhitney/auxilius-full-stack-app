import { render, screen, act, fireEvent } from "@testing-library/react";
import TaskBoardView from "./index";
import { io } from "socket.io-client";
import { TaskStatus, type Task } from "../../types";

jest.mock("../../api/tasks", () => ({
  addTask: jest.fn().mockResolvedValue(undefined),
  patchTask: jest.fn().mockResolvedValue(undefined),
  deleteTask: jest.fn().mockResolvedValue(undefined),
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
    expect(screen.getByText("To Do")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
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
});
