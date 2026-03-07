import { createBrowserRouter } from "react-router-dom";
import { lazy } from "react";
import MainLayout from "../layouts/MainLayout";
import Home from "../features/home/pages/Home";
import ErrorPage from "../features/error/pages/ErrorPage";

const TaskPage = lazy(() => import("../features/task/pages/TaskPage"));
const TaskAnalytics = lazy(
  () => import("../features/task/pages/TaskAnalytics"),
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: (
      <MainLayout>
        <ErrorPage />
      </MainLayout>
    ),
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "task-manager",
        element: <TaskPage />,
      },
      {
        path: "task-analytics",
        element: <TaskAnalytics />,
      },
    ],
  },
]);
