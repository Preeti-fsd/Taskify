export type TaskStatus = "pending" | "completed";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  createdAt: number;
  updateAt?: number;
  dueDate?: string;
}