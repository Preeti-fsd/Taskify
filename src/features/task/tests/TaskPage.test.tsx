import { render, screen, fireEvent } from "@testing-library/react";
import TaskPage from "../pages/TaskPage";

describe("Task Feature Integration", () => {
  it("renders input field", () => {
    render(<TaskPage />);
    const input = screen.getByPlaceholderText(/enter a task/i);
    expect(input).toBeInTheDocument();
  });

  it("adds new task and renders it", () => {
    render(<TaskPage />);

    const input = screen.getByPlaceholderText(/enter a task/i);
    fireEvent.change(input, { target: { value: "New Add new Task Task" } });

    const addBtn = screen.getByRole("button", { name: /add/i });
    fireEvent.click(addBtn);

    expect(screen.getByText("New Add new Task Task")).toBeInTheDocument();
  });

  it("deletes a task when delete button is clicked", () => {
    render(<TaskPage />);
  
    const input = screen.getByPlaceholderText(/enter a task/i);
    fireEvent.change(input, { target: { value: "Test Delete Task" } });
  
    fireEvent.click(screen.getByRole("button", { name: /add/i }));

    const deleteBtn = screen.getByRole("button", {
      name: /delete test delete task/i,
    })
  
    fireEvent.click(deleteBtn);
  
    expect(screen.queryByText("Test Delete Task")).not.toBeInTheDocument();
  });

  it("edits a task title", () => {
    render(<TaskPage />);
  
    const input = screen.getByPlaceholderText(/enter a task/i);
    fireEvent.change(input, { target: { value: "Old Task" } });
  
    fireEvent.click(screen.getByRole("button", { name: /add/i }));
  
    const editBtn = screen.getByRole("button", {name: /edit task/i});
  
    fireEvent.click(editBtn);
  
    const editInput = screen.getByDisplayValue("Old Task");
    fireEvent.change(editInput, { target: { value: "Updated Task" } });
  
    const saveBtn = screen.getByRole("button", { name: /save task/i });
    fireEvent.click(saveBtn);
  
    expect(screen.getByText("Updated Task")).toBeInTheDocument();
  });

  it("filters tasks by search term", () => {
    render(<TaskPage />);
  
    const input = screen.getByPlaceholderText(/enter a task/i);
  
    fireEvent.change(input, { target: { value: "Clean Home" } });
    fireEvent.click(screen.getByRole("button", { name: /add/i }));
  
    fireEvent.change(input, { target: { value: "Wash Cloths" } });
    fireEvent.click(screen.getByRole("button", { name: /add/i }));
    
      
    fireEvent.change(input, { target: { value: "Cook Food" } });
    fireEvent.click(screen.getByRole("button", { name: /add/i }));

    const searchBtn = screen.getByTestId(/search btn/i);
    fireEvent.click(searchBtn);

    const searchInput = screen.getByTestId(/search input/i);
    fireEvent.change(searchInput, { target: { value: "Clean Home" } });

    expect(screen.getByText("Clean Home")).toBeInTheDocument();
    expect(screen.queryByText("Wash Cloths")).not.toBeInTheDocument();
    expect(screen.queryByText("Cook Food")).not.toBeInTheDocument();
  });

  it("filters tasks by search term", () => {
    render(<TaskPage />);
  
    const input = screen.getByPlaceholderText(/enter a task/i);
  
    fireEvent.change(input, { target: { value: "Deposit Money" } });
    fireEvent.click(screen.getByRole("button", { name: /add/i }));
  
    fireEvent.change(input, { target: { value: "File ITR" } });
    fireEvent.click(screen.getByRole("button", { name: /add/i }));
  
  
    fireEvent.change(input, { target: { value: "Car Wash" } });
    fireEvent.click(screen.getByRole("button", { name: /add/i }));
  
    const searchBtn = screen.getByTestId(/search btn/i);
    fireEvent.click(searchBtn);

    const searchInput = screen.getByPlaceholderText(/search tasks/i);
    fireEvent.change(searchInput, { target: { value: "File ITR" } });
  
    expect(screen.getByText("File ITR")).toBeInTheDocument();
    expect(screen.queryByText("Deposit Money")).not.toBeInTheDocument();
    expect(screen.queryByText("Car Wash")).not.toBeInTheDocument();
  });

  it("sorts tasks alphabetically", () => {
    render(<TaskPage />);
  
    const input = screen.getByPlaceholderText(/enter a task/i);
  
    fireEvent.change(input, { target: { value: "B Task" } });
    fireEvent.click(screen.getByRole("button", { name: /add/i }));
  
    fireEvent.change(input, { target: { value: "A Task" } });
    fireEvent.click(screen.getByRole("button", { name: /add/i }));
  
    fireEvent.change(input, { target: { value: "C Task" } });
    fireEvent.click(screen.getByRole("button", { name: /add/i }));
  
    const sortSelect = screen.getByRole("combobox", { name: /sort/i });
    fireEvent.change(sortSelect, { target: { value: "asc" } });
  
    const tasks = screen.getAllByText(/task/i);
  
    expect(tasks[0]).toHaveTextContent("A Task");
    expect(tasks[1]).toHaveTextContent("B Task");
    expect(tasks[2]).toHaveTextContent("C Task");
  });

  it("does not add empty task", () => {
    render(<TaskPage />);
  
    fireEvent.click(screen.getByRole("button", { name: /add/i }));
  
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });
  
  it("search with no results shows empty state", () => {
    render(<TaskPage />);
  
    const input = screen.getByPlaceholderText(/enter a task/i);
  
    fireEvent.change(input, { target: { value: "Deposit Money" } });
    fireEvent.click(screen.getByRole("button", { name: /add/i }));
  
    fireEvent.change(input, { target: { value: "File ITR" } });
    fireEvent.click(screen.getByRole("button", { name: /add/i }));
  
  
    fireEvent.change(input, { target: { value: "Car Wash" } });
    fireEvent.click(screen.getByRole("button", { name: /add/i }));
  
    const searchBtn = screen.getByTestId(/search btn/i);
    fireEvent.click(searchBtn);

    const searchInput = screen.getByPlaceholderText(/search tasks/i);
    fireEvent.change(searchInput, { target: { value: "No Match" } });
    expect(screen.getByText(/no tasks found/i)).toBeInTheDocument();
  });

});