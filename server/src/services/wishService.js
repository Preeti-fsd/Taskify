import { AppError } from "../errors/AppError.js";
import { wishRepository } from "../repositories/wishRepository.js";
import { emailService } from "./emailService.js";

const normalizeWish = (wish) => ({
  ...wish,
  scheduledTime: wish.scheduled_time || wish.scheduledTime || null,
});

export const wishService = {
  async listWishes(userId) {
    const wishes = await wishRepository.listByUserId(userId);
    return wishes.map(normalizeWish);
  },

  async createWish(userId, payload) {
    const recipientEmail = payload.recipientEmail?.trim();
    const subject = payload.subject?.trim();
    const message = payload.message?.trim();

    if (!recipientEmail || !subject || !message) {
      throw new AppError("Recipient email, subject, and message are required.", 400);
    }

    const scheduledTime = payload.scheduledTime ? new Date(payload.scheduledTime) : null;
    if (!payload.sendNow && !scheduledTime) {
      throw new AppError("Schedule time is required when scheduling a wish.", 400);
    }
    const shouldSendNow = Boolean(payload.sendNow);

    const wish = await wishRepository.create({
      userId,
      recipientEmail,
      subject,
      message,
      scheduledTime: shouldSendNow ? null : scheduledTime,
      status: shouldSendNow ? "pending" : "pending",
    });

    if (shouldSendNow) {
      const sentWish = await this.sendWishNow(userId, wish.id);
      return sentWish;
    }

    return normalizeWish(wish);
  },

  async updateWish(userId, id, payload) {
    const wish = await wishRepository.findById(id);
    if (!wish || wish.user_id !== userId) {
      throw new AppError("Wish not found.", 404);
    }

    if (wish.status !== "pending") {
      throw new AppError("Only pending wishes can be edited.", 400);
    }

    const updated = await wishRepository.update(id, {
      recipientEmail: payload.recipientEmail?.trim() || null,
      subject: payload.subject?.trim() || null,
      message: payload.message?.trim() || null,
      scheduledTime: payload.scheduledTime ? new Date(payload.scheduledTime) : null,
    });

    return normalizeWish(updated);
  },

  async cancelWish(userId, id) {
    const wish = await wishRepository.findById(id);
    if (!wish || wish.user_id !== userId) {
      throw new AppError("Wish not found.", 404);
    }

    const updated = await wishRepository.update(id, {
      status: "cancelled",
      cancelledAt: new Date(),
    });

    return normalizeWish(updated);
  },

  async sendWishNow(userId, id) {
    const wish = await wishRepository.findById(id);
    if (!wish || wish.user_id !== userId) {
      throw new AppError("Wish not found.", 404);
    }

    try {
      await emailService.sendWishEmail({
        id: wish.id,
        recipientEmail: wish.recipient_email,
        subject: wish.subject,
        message: wish.message,
      });

      const updated = await wishRepository.update(id, {
        status: "sent",
        sentAt: new Date(),
        deliveryError: null,
      });

      return normalizeWish(updated);
    } catch (error) {
      const updated = await wishRepository.update(id, {
        status: "failed",
        deliveryError: error.message,
      });
      return normalizeWish(updated);
    }
  },

  async processDueWishes(limit = 25) {
    const dueWishes = await wishRepository.listDue(limit);
    let sent = 0;
    let failed = 0;

    for (const wish of dueWishes) {
      try {
        await emailService.sendWishEmail({
          id: wish.id,
          recipientEmail: wish.recipient_email,
          subject: wish.subject,
          message: wish.message,
        });
        await wishRepository.update(wish.id, {
          status: "sent",
          sentAt: new Date(),
          deliveryError: null,
        });
        sent++;
      } catch (error) {
        await wishRepository.update(wish.id, {
          status: "failed",
          deliveryError: error.message,
        });
        failed++;
      }
    }

    return { checked: dueWishes.length, sent, failed };
  },
};
