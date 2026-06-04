export interface NotificationEvent {
  id: number;
  userId: number;
  event: string;
  category: "info" | "warning" | "success" | "error";
  title: string;
  message: string;
  status: "scheduled" | "sent" | "failed";
  metadata: Record<string, unknown>;
  scheduledFor?: string | null;
  sentAt?: string | null;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
}
