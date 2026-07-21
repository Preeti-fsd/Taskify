import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy } from "react";
import MainLayout from "../layouts/MainLayout";
import Home from "../features/home/pages/Home";
import ErrorPage from "../features/error/pages/ErrorPage";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import LoginPage from "../features/auth/pages/LoginPage";
import SignupPage from "../features/auth/pages/SignupPage";
import VerifyOtpPage from "../features/auth/pages/VerifyOtpPage";
import ForgotPasswordPage from "../features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "../features/auth/pages/ResetPasswordPage";
import AdminDashboardPage from "../features/admin/pages/AdminDashboardPage";
import AdminUsersPage from "../features/admin/pages/AdminUsersPage";
import AdminEmailLogsPage from "../features/admin/pages/AdminEmailLogsPage";
import AdminAnalyticsPage from "../features/admin/pages/AdminAnalyticsPage";
import AdminSettingsPage from "../features/admin/pages/AdminSettingsPage";
import WishPage from "../features/wish/pages/WishPage";
import ProductivityPage from "../features/productivity/pages/ProductivityPage";
import NotificationCenterPage from "../features/notifications/pages/NotificationCenterPage";

const TaskPage = lazy(() => import("../features/task/pages/TaskPage"));
const TaskAnalytics = lazy(() => import("../features/task/pages/TaskAnalytics"));
const TaskCalendar = lazy(() => import("../features/task/pages/TaskCalendar"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
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
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "signup",
        element: <SignupPage />,
      },
      {
        path: "verify-otp",
        element: <VerifyOtpPage />,
      },
      {
        path: "forgot-password",
        element: <ForgotPasswordPage />,
      },
      {
        path: "reset-password",
        element: <ResetPasswordPage />,
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
      },
      {
        path: "tasks",
        element: (
          <ProtectedRoute>
            <TaskPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "calendar",
        element: (
          <ProtectedRoute>
            <TaskCalendar />
          </ProtectedRoute>
        ),
      },
      {
        path: "analytics",
        element: (
          <ProtectedRoute>
            <TaskAnalytics />
          </ProtectedRoute>
        ),
      },
      {
        path: "wish",
        element: (
          <ProtectedRoute>
            <WishPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "productivity",
        element: (
          <ProtectedRoute>
            <ProductivityPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "notifications",
        element: (
          <ProtectedRoute>
            <NotificationCenterPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin",
        element: (
          <ProtectedRoute role="admin">
            <AdminDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/users",
        element: (
          <ProtectedRoute role="admin">
            <AdminUsersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/email-logs",
        element: (
          <ProtectedRoute role="admin">
            <AdminEmailLogsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/analytics",
        element: (
          <ProtectedRoute role="admin">
            <AdminAnalyticsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/settings",
        element: (
          <ProtectedRoute role="admin">
            <AdminSettingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "task-manager",
        element: <Navigate to="/tasks" replace />,
      },
      {
        path: "task-calendar",
        element: <Navigate to="/calendar" replace />,
      },
      {
        path: "task-analytics",
        element: <Navigate to="/analytics" replace />,
      },
      {
        path: "*",
        element: <Navigate to="/login" replace />,
      },
    ],
  },
]);
