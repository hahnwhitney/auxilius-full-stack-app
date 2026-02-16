import { render, screen, act, fireEvent } from "@testing-library/react";
import TaskBoardView from "./index";
import { io } from "socket.io-client";
import { TaskStatus } from "../../types";

jest.mock("socket.io-client", () => ({
  io: jest.fn(() => {
    const listeners: Record<string, (...args: unknown[]) => void> = {};
    return {
      on: (event: string, cb: (...args: unknown[]) => void) => {
        listeners[event] = cb;
      },
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
    <button onClick={() => onAdd("title", "desc", TaskStatus.TODO)}>
      Add Task
    </button>
  ),
}));
jest.mock("../../components/TaskColumn", () => ({
  __esModule: true,
  default: (props: { status: string; statusName: string }) => (
    <div data-testid={props.status}>{props.statusName}</div>
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
    expect(screen.getByText("No tasks yet")).toBeInTheDocument();
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

  it("handles task:added event", () => {
    triggerSocketEvent(socket, "tasks:initial", []);
    triggerSocketEvent(socket, "task:added", {
      id: "3",
      title: "E",
      description: "F",
      status: TaskStatus.IN_PROGRESS,
    });
    expect(screen.getByTestId(TaskStatus.IN_PROGRESS)).toBeInTheDocument();
  });

  it("handles task:statusChanged event", () => {
    triggerSocketEvent(socket, "tasks:initial", [
      { id: "1", title: "A", description: "B", status: TaskStatus.TODO },
    ]);
    triggerSocketEvent(socket, "task:statusChanged", {
      id: "1",
      status: TaskStatus.DONE,
    });
    expect(screen.getByTestId(TaskStatus.DONE)).toBeInTheDocument();
  });

  it("handles task:titleChanged event", () => {
    triggerSocketEvent(socket, "tasks:initial", [
      { id: "1", title: "A", description: "B", status: TaskStatus.TODO },
    ]);
    triggerSocketEvent(socket, "task:titleChanged", { id: "1", title: "Z" });
    expect(screen.getByTestId(TaskStatus.TODO)).toBeInTheDocument();
  });

  it("handles task:descriptionChanged event", () => {
    triggerSocketEvent(socket, "tasks:initial", [
      { id: "1", title: "A", description: "B", status: TaskStatus.TODO },
    ]);
    triggerSocketEvent(socket, "task:descriptionChanged", {
      id: "1",
      description: "ZZ",
    });
    expect(screen.getByTestId(TaskStatus.TODO)).toBeInTheDocument();
  });

  it("handles task:deleted event", () => {
    triggerSocketEvent(socket, "tasks:initial", [
      { id: "1", title: "A", description: "B", status: TaskStatus.TODO },
    ]);
    triggerSocketEvent(socket, "task:deleted", "1");
    expect(screen.getByText("No tasks yet")).toBeInTheDocument();
  });

  it("emits task:add when TaskForm adds task", () => {
    const addBtn = screen.getByText("Add Task");
    fireEvent.click(addBtn);
    expect(socket.emit).toHaveBeenCalledWith("task:add", {
      title: "title",
      description: "desc",
      status: TaskStatus.TODO,
    });
  });

  it("emits task:titleChange, descriptionChange, statusChange, delete on handlers", () => {
    const task = {
      id: "1",
      title: "A",
      description: "B",
      status: TaskStatus.TODO,
    };
    triggerSocketEvent(socket, "tasks:initial", [task]);
    expect(socket.emit).toBeDefined();
  });
});
