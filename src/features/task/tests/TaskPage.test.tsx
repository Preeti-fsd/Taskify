import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TaskPage from "../pages/TaskPage";
import { vi } from "vitest";
import type { Task } from "../../../types/task";

let tasks: Task[] = [];

const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const mockFetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = new URL(input.toString(), "http://localhost");
  const method = init?.method || "GET";

  if (url.pathname === "/api/tasks" && method === "GET") {
    return jsonResponse(tasks);
  }

  if (url.pathname === "/api/tasks" && method === "POST") {
    const body = JSON.parse(init?.body as string);
    const task: Task = {
      id: crypto.randomUUID(),
      title: body.title,
      dueDate: body.dueDate,
      status: "pending",
      createdAt: Date.now(),
      priority: body.priority || "medium",
      category: body.category || "General",
      tags: body.tags || [],
      subtasks: body.subtasks || [],
      estimatedMinutes: body.estimatedMinutes || 25,
      actualMinutes: 0,
      reminderAt: body.reminderAt,
      recurring: body.recurring || "none",
      focusSessions: [],
      actionType: body.actionType || "task",
      targetEmail: body.targetEmail,
      targetPlatform: body.targetPlatform,
      targetAccount: body.targetAccount,
      scheduledMessage: body.scheduledMessage,
    };
    tasks = [task, ...tasks];
    return jsonResponse(task, 201);
  }

  if (url.pathname === "/api/tasks/reorder" && method === "PUT") {
    const body = JSON.parse(init?.body as string);
    tasks = body.tasks;
    return jsonResponse(tasks);
  }

  const taskId = url.pathname.split("/").at(-1);

  if (url.pathname.startsWith("/api/tasks/") && method === "PATCH") {
    const body = JSON.parse(init?.body as string);
    const task = tasks.find((item) => item.id === taskId);

    if (!task) {
      return jsonResponse({ message: "Task not found." }, 404);
    }

    const updatedTask = { ...task, ...body, updateAt: Date.now() };
    tasks = tasks.map((item) => (item.id === taskId ? updatedTask : item));
    return jsonResponse(updatedTask);
  }

  if (url.pathname.startsWith("/api/tasks/") && method === "DELETE") {
    tasks = tasks.filter((item) => item.id !== taskId);
    return new Response(null, { status: 204 });
  }

  return jsonResponse({ message: "Route not found." }, 404);
});

describe("Task Feature Integration", () => {
  beforeEach(() => {
    tasks = [];
    mockFetch.mockClear();
    vi.stubGlobal("fetch", mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders input field", async () => {
    render(<TaskPage />);
    const input = await screen.findByPlaceholderText(/enter a task/i);
    expect(input).toBeInTheDocument();
  });

  it("adds new task and renders it", async () => {
    render(<TaskPage />);

    const input = await screen.findByPlaceholderText(/enter a task/i);
    fireEvent.change(input, { target: { value: "New Add new Task Task" } });

    const addBtn = screen.getByRole("button", { name: /^add task$/i });
    fireEvent.click(addBtn);

    expect(await screen.findByText("New Add new Task Task")).toBeInTheDocument();
  });

  it("deletes a task when delete button is clicked", async () => {
    render(<TaskPage />);

    const input = await screen.findByPlaceholderText(/enter a task/i);
    fireEvent.change(input, { target: { value: "Test Delete Task" } });

    fireEvent.click(screen.getByRole("button", { name: /^add task$/i }));

    const deleteBtn = await screen.findByRole("button", {
      name: /delete test delete task/i,
    });

    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(screen.queryByText("Test Delete Task")).not.toBeInTheDocument();
    });
  });

  it("edits a task title", async () => {
    render(<TaskPage />);

    const input = await screen.findByPlaceholderText(/enter a task/i);
    fireEvent.change(input, { target: { value: "Old Task" } });

    fireEvent.click(screen.getByRole("button", { name: /^add task$/i }));

    const editBtn = await screen.findByRole("button", { name: /edit task/i });

    fireEvent.click(editBtn);

    const editInput = screen.getByDisplayValue("Old Task");
    fireEvent.change(editInput, { target: { value: "Updated Task" } });

    const saveBtn = screen.getByRole("button", { name: /save task/i });
    fireEvent.click(saveBtn);

    expect(await screen.findByText("Updated Task")).toBeInTheDocument();
  });

  it("filters tasks by search term", async () => {
    render(<TaskPage />);

    const input = await screen.findByPlaceholderText(/enter a task/i);

    fireEvent.change(input, { target: { value: "Clean Home" } });
    fireEvent.click(screen.getByRole("button", { name: /^add task$/i }));

    fireEvent.change(input, { target: { value: "Wash Cloths" } });
    fireEvent.click(screen.getByRole("button", { name: /^add task$/i }));

    fireEvent.change(input, { target: { value: "Cook Food" } });
    fireEvent.click(screen.getByRole("button", { name: /^add task$/i }));

    await screen.findByText("Cook Food");

    const searchBtn = screen.getByTestId(/search btn/i);
    fireEvent.click(searchBtn);

    const searchInput = screen.getByTestId(/search input/i);
    fireEvent.change(searchInput, { target: { value: "Clean Home" } });

    expect(screen.getByText("Clean Home")).toBeInTheDocument();
    expect(screen.queryByText("Wash Cloths")).not.toBeInTheDocument();
    expect(screen.queryByText("Cook Food")).not.toBeInTheDocument();
  });

  it("filters tasks by search placeholder", async () => {
    render(<TaskPage />);

    const input = await screen.findByPlaceholderText(/enter a task/i);

    fireEvent.change(input, { target: { value: "Deposit Money" } });
    fireEvent.click(screen.getByRole("button", { name: /^add task$/i }));

    fireEvent.change(input, { target: { value: "File ITR" } });
    fireEvent.click(screen.getByRole("button", { name: /^add task$/i }));

    fireEvent.change(input, { target: { value: "Car Wash" } });
    fireEvent.click(screen.getByRole("button", { name: /^add task$/i }));

    await screen.findByText("Car Wash");

    const searchBtn = screen.getByTestId(/search btn/i);
    fireEvent.click(searchBtn);

    const searchInput = screen.getByPlaceholderText(/search tasks/i);
    fireEvent.change(searchInput, { target: { value: "File ITR" } });

    expect(screen.getByText("File ITR")).toBeInTheDocument();
    expect(screen.queryByText("Deposit Money")).not.toBeInTheDocument();
    expect(screen.queryByText("Car Wash")).not.toBeInTheDocument();
  });

  it("sorts tasks alphabetically", async () => {
    render(<TaskPage />);

    const input = await screen.findByPlaceholderText(/enter a task/i);

    fireEvent.change(input, { target: { value: "B Task" } });
    fireEvent.click(screen.getByRole("button", { name: /^add task$/i }));

    fireEvent.change(input, { target: { value: "A Task" } });
    fireEvent.click(screen.getByRole("button", { name: /^add task$/i }));

    fireEvent.change(input, { target: { value: "C Task" } });
    fireEvent.click(screen.getByRole("button", { name: /^add task$/i }));

    await screen.findByText("C Task");

    const sortSelect = screen.getByRole("combobox", { name: /sort/i });
    fireEvent.change(sortSelect, { target: { value: "asc" } });

    await waitFor(() => {
      const renderedTasks = screen.getAllByTestId("task-title");

      expect(renderedTasks[0]).toHaveTextContent("A Task");
      expect(renderedTasks[1]).toHaveTextContent("B Task");
      expect(renderedTasks[2]).toHaveTextContent("C Task");
    });
  });

  it("does not add empty task", async () => {
    render(<TaskPage />);

    await screen.findByPlaceholderText(/enter a task/i);
    fireEvent.click(screen.getByRole("button", { name: /^add task$/i }));

    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });

  it("search with no results shows empty state", async () => {
    render(<TaskPage />);

    const input = await screen.findByPlaceholderText(/enter a task/i);

    fireEvent.change(input, { target: { value: "Deposit Money" } });
    fireEvent.click(screen.getByRole("button", { name: /^add task$/i }));

    fireEvent.change(input, { target: { value: "File ITR" } });
    fireEvent.click(screen.getByRole("button", { name: /^add task$/i }));

    fireEvent.change(input, { target: { value: "Car Wash" } });
    fireEvent.click(screen.getByRole("button", { name: /^add task$/i }));

    await screen.findByText("Car Wash");

    const searchBtn = screen.getByTestId(/search btn/i);
    fireEvent.click(searchBtn);

    const searchInput = screen.getByPlaceholderText(/search tasks/i);
    fireEvent.change(searchInput, { target: { value: "No Match" } });
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
  });
});
