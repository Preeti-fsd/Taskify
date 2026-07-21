import { screen, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "../../../context/ThemeContext";
import TaskAnalytics from "../pages/TaskAnalytics";
import * as taskHook from "../hooks/useTasks";
import { vi } from "vitest";
import { calculateAnalytics } from "../utility/taskUtils";
import type { Task } from "../../../types/task";

const createMockTask = (task: Partial<Task> & Pick<Task, "id" | "title" | "status">): Task => ({
  createdAt: Date.now(),
  priority: "medium",
  category: "General",
  tags: [],
  subtasks: [],
  estimatedMinutes: 25,
  actualMinutes: 0,
  recurring: "none",
  focusSessions: [],
  actionType: "task",
  ...task,
});

const mockTasks: Task[] = [
  createMockTask({
    id: "1",
    title: "Task 1",
    status: "completed",
  }),
  createMockTask({
    id: "2",
    title: "Task 2",
    status: "pending",
  }),
  createMockTask({
    id: "3",
    title: "Task 3",
    status: "pending",
    dueDate: "2020-01-01",
  }),
  createMockTask({
    id: "4",
    title: "Task 4",
    status: "completed",
  }),
  createMockTask({
    id: "5",
    title: "Task 5",
    status: "pending",
  }),
];

const renderAnalytics = () => {
  vi.spyOn(taskHook, "useTasks").mockReturnValue({
    tasks: mockTasks,
    isLoading: false,
    error: null,
    addTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    replaceTasks: vi.fn(),
    addFocusSession: vi.fn(),
    reloadTasks: vi.fn(),
  });

  render(
    <MemoryRouter>
      <ThemeProvider>
        <TaskAnalytics />
      </ThemeProvider>
    </MemoryRouter>,
  );
};

describe("Task Analytics Screen", () => {
  beforeEach(() => {
    renderAnalytics();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders analytics title", () => {
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /task analytics/i,
      }),
    ).toBeInTheDocument();
  });

  it("calculates totals correctly", () => {
    const result = calculateAnalytics(mockTasks);
    expect(result.total).toBe(5);
    expect(result.completed).toBe(2);
    expect(result.pending).toBe(3);
    expect(result.overdue).toBe(1);
    expect(result.completedPercent).toBe(40);
    expect(result.pendingPercent).toBe(60);
  });

  it("handles empty task list", () => {
    const result = calculateAnalytics([]);
    expect(result.total).toBe(0);
    expect(result.completedPercent).toBe(0);
    expect(result.pendingPercent).toBe(0);
  });
});
