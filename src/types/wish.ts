export type WishStatus = "pending" | "sent" | "failed" | "cancelled";

export interface Wish {
  id: string;
  user_id?: string;
  recipient_email: string;
  subject: string;
  message: string;
  scheduled_time: string | null;
  status: WishStatus;
  sent_at: string | null;
  delivery_error?: string | null;
  cancelled_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface WishInput {
  recipientEmail: string;
  subject: string;
  message: string;
  scheduledTime?: string;
  sendNow?: boolean;
}
