import { request } from "./http";
import type { Wish, WishInput } from "../types/wish";

export const wishApi = {
  listWishes: () => request<Wish[]>("/api/wishes"),
  createWish: (payload: WishInput) =>
    request<Wish>("/api/wishes", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateWish: (id: string, payload: Partial<WishInput>) =>
    request<Wish>(`/api/wishes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  cancelWish: (id: string) =>
    request<Wish>(`/api/wishes/${id}/cancel`, {
      method: "POST",
    }),
  sendWishNow: (id: string) =>
    request<Wish>(`/api/wishes/${id}/send`, {
      method: "POST",
    }),
};
