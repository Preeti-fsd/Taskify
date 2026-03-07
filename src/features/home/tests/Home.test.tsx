import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import TaskAnalytics from "../../task/pages/TaskAnalytics";
import TaskPage from "../../task/pages/TaskPage";
import { ThemeProvider } from "../../../context/ThemeContext";
import Header from "../../../components/layout/Header";

describe("Testing Home Screen", () => {
  it("render title", async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );
    const homeTitle = screen.getByRole("heading", { level: 1 });
    const subtitle = screen.getByText(
      /organize your tasks, track your progress/i,
    );
    expect(homeTitle).toBeInTheDocument();
    expect(subtitle).toBeInTheDocument();
  });

  it("toggles theme when theme button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ThemeProvider>
          <Header />
        </ThemeProvider>
      </MemoryRouter>,
    );

    const themeBtn = screen.getByRole("button", { name: /toggle theme/i });
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    await user.click(themeBtn);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("navigates to Task Manager when card is clicked", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/task-manager" element={<TaskPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: /task manager/i }));
    expect(screen.getByPlaceholderText(/enter a task/i)).toBeInTheDocument();
  });

  it("navigates to Task Analytics when card is clicked", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/"]}>
        <ThemeProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/task-analytics" element={<TaskAnalytics />} />
          </Routes>
        </ThemeProvider>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: /task analytics/i }));
    expect(screen.getByText(/Task Analytics/i)).toBeInTheDocument();
  });
});
