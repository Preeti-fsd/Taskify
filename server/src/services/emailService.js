import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { emailLogRepository } from "../repositories/emailLogRepository.js";

const hasEmailConfig = () =>
  Boolean(env.emailHost && env.emailPort && env.emailUser && env.emailPass && env.emailFrom);

const transporter = hasEmailConfig()
  ? nodemailer.createTransport({
      host: env.emailHost,
      port: env.emailPort,
      secure: env.emailPort === 465,
      auth: {
        user: env.emailUser,
        pass: env.emailPass,
      },
    })
  : null;

const sendAndLog = async ({ to, subject, text, html, attachments = [], sourceType = null, sourceId = null }) => {
  if (!transporter) {
    throw new Error("Email service is not configured.");
  }

  try {
    const info = await transporter.sendMail({
      from: env.emailFrom,
      to,
      subject,
      text,
      html,
      attachments,
    });

    await emailLogRepository.createLog({
      recipient: to,
      subject,
      status: "sent",
      sentAt: new Date(),
      sourceType,
      sourceId,
    });

    return info;
  } catch (error) {
    await emailLogRepository.createLog({
      recipient: to,
      subject,
      status: "failed",
      sentAt: new Date(),
      sourceType,
      sourceId,
    });
    throw error;
  }
};

const buildText = (parts) => parts.filter(Boolean).join("\n\n");
const buildButton = (label, url) =>
  `<p><a href="${url}" style="display:inline-block;padding:12px 18px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;">${label}</a></p>`;

export const emailService = {
  isEnabled() {
    return Boolean(transporter);
  },

  async sendOtpEmail({ to, name, otp }) {
    await sendAndLog({
      to,
      subject: "Verify your Taskify account",
      text: buildText([
        `Hi ${name || "there"},`,
        `Your Taskify verification code is ${otp}.`,
        "This code expires in 10 minutes.",
      ]),
      sourceType: "otp",
    });
  },

  async sendPasswordResetEmail({ to, name, resetUrl }) {
    await sendAndLog({
      to,
      subject: "Taskify password reset",
      text: buildText([
        `Hi ${name || "there"},`,
        "We received a request to reset your Taskify password.",
        `Reset it here: ${resetUrl}`,
        "If you did not request this, you can ignore this email.",
      ]),
      html: `<p>Hi ${name || "there"},</p><p>We received a request to reset your Taskify password.</p><p><a href="${resetUrl}">Reset your password</a></p><p>If you did not request this, you can ignore this email.</p>`,
      sourceType: "password-reset",
    });
  },

  async sendWishEmail({ id, recipientEmail, subject, message }) {
    await sendAndLog({
      to: recipientEmail,
      subject,
      text: buildText([message]),
      sourceType: "wish",
      sourceId: id,
    });
  },

  async sendTaskReminder({ task, toEmail }) {
    const taskUrl = `${env.appUrl}/tasks?task=${task.id}`;
    await sendAndLog({
      to: toEmail,
      subject: "Task Reminder",
      text: buildText([
        `Task Name: ${task.title}`,
        task.dueDate ? `Due Date: ${task.dueDate}` : null,
        task.priority ? `Priority: ${task.priority}` : null,
        `Open Task: ${taskUrl}`,
      ]),
      html: [
        `<p><strong>Task Name:</strong> ${task.title}</p>`,
        task.dueDate ? `<p><strong>Due Date:</strong> ${task.dueDate}</p>` : "",
        task.priority ? `<p><strong>Priority:</strong> ${task.priority}</p>` : "",
        buildButton("Open Task", taskUrl),
      ].join(""),
      sourceType: "task-reminder",
      sourceId: task.id,
    });
  },

  async sendTaskOverdue({ task, toEmail }) {
    const taskUrl = `${env.appUrl}/tasks?task=${task.id}`;
    await sendAndLog({
      to: toEmail,
      subject: "Task Overdue",
      text: buildText([
        `Task Name: ${task.title}`,
        task.dueDate ? `Due Date: ${task.dueDate}` : null,
        `Reschedule: ${taskUrl}`,
      ]),
      html: [
        `<p><strong>Task Name:</strong> ${task.title}</p>`,
        task.dueDate ? `<p><strong>Due Date:</strong> ${task.dueDate}</p>` : "",
        buildButton("Reschedule Task", taskUrl),
      ].join(""),
      sourceType: "task-overdue",
      sourceId: task.id,
    });
  },

  async sendTaskCompletionEmail({ task, toEmail, attachments = [] }) {
    const taskUrl = `${env.appUrl}/tasks?task=${task.id}`;
    await sendAndLog({
      to: toEmail,
      subject: task.emailSubject || `Task Completed: ${task.title}`,
      text: buildText([
        "Hello,",
        "The task has been completed.",
        `Task: ${task.title}`,
        `Completed At: ${new Date().toLocaleString()}`,
        task.emailMessage || null,
        `Open Task: ${taskUrl}`,
      ]),
      html: [
        "<p>Hello,</p>",
        "<p>The task has been completed.</p>",
        `<p><strong>Task:</strong> ${task.title}</p>`,
        `<p><strong>Completed At:</strong> ${new Date().toLocaleString()}</p>`,
        task.emailMessage ? `<p>${task.emailMessage.replaceAll("\n", "<br />")}</p>` : "",
        buildButton("Open Task", taskUrl),
      ].join(""),
      attachments,
      sourceType: "task-completion",
      sourceId: task.id,
    });
  },

  async sendGenericEmail({ to, subject, text, html, attachments, sourceType, sourceId }) {
    await sendAndLog({ to, subject, text, html, attachments, sourceType, sourceId });
  },
};
