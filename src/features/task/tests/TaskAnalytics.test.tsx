import { screen, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "../../../context/ThemeContext";
import TaskAnalytics from "../pages/TaskAnalytics";
import * as localStorageHook from "../../../hooks/useLocalStorage";
import { vi } from "vitest";
import { calculateAnalytics } from "../utility/taskUtils";
import type { Task } from "../../../types/task";

const mockTasks: Task[] = [
    {
      id: "1",
      title: "Task 1",
      status: "completed",
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      title: "Task 2",
      status: "pending",
      createdAt: new Date().toISOString(),
    },
    {
      id: "3",
      title: "Task 3",
      status: "pending",
      createdAt: new Date().toISOString(),
      dueDate: "2020-01-01",
    },
    {
      id: "4",
      title: "Task 4",
      status: "completed",
      createdAt: new Date().toISOString(),
    },
    {
      id: "5",
      title: "Task 5",
      status: "pending",
      createdAt: new Date().toISOString(),
    },
  ];

describe("Task Analytics Screen", () => {
  beforeEach(() => {
    vi.spyOn(localStorageHook, "useLocalStorage").mockReturnValue([
      mockTasks,
      vi.fn(),
    ] as any);

    render(
      <MemoryRouter>
        <ThemeProvider>
          <TaskAnalytics />
        </ThemeProvider>
      </MemoryRouter>
    );
  });

  it("renders analytics title", () => {
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /task analytics/i,
      })
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