import crypto from "node:crypto";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";

export const MAX_ATTACHMENT_SIZE_BYTES = 20 * 1024 * 1024;

const allowedMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "application/zip",
]);

const allowedExtensions = new Set([".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg", ".zip"]);

const sanitizeName = (name) =>
  String(name || "attachment")
    .replaceAll(/[\\/:*?"<>|]/g, "-")
    .replaceAll(/\s+/g, "-")
    .replaceAll(/-+/g, "-")
    .replaceAll(/^-|-$/g, "")
    .slice(0, 120) || "attachment";

const parseDataUrl = (dataUrl) => {
  const match = /^data:([^;]+);base64,(.+)$/i.exec(String(dataUrl || ""));
  if (!match) {
    throw new Error("Attachment data must be a base64 data URL.");
  }

  return { mimeType: match[1], base64: match[2] };
};

const isAllowedAttachment = (mimeType, fileName) => {
  const extension = path.extname(String(fileName || "")).toLowerCase();
  return allowedMimeTypes.has(mimeType) && allowedExtensions.has(extension);
};

export const saveTaskAttachment = async ({ taskId, originalName, dataUrl, uploadedBy }) => {
  const { mimeType, base64 } = parseDataUrl(dataUrl);
  if (!isAllowedAttachment(mimeType, originalName)) {
    throw new Error("Unsupported attachment type.");
  }

  const buffer = Buffer.from(base64, "base64");
  if (!buffer.length) {
    throw new Error("Attachment file is empty.");
  }
  if (buffer.length > MAX_ATTACHMENT_SIZE_BYTES) {
    throw new Error("Attachment must be 20MB or smaller.");
  }

  const safeName = sanitizeName(originalName);
  const fileName = `${Date.now()}-${crypto.randomUUID()}-${safeName}`;
  const relativeDir = path.join("uploads", "tasks", String(taskId));
  const absoluteDir = path.resolve(process.cwd(), relativeDir);
  await mkdir(absoluteDir, { recursive: true });

  const relativePath = path.join(relativeDir, fileName);
  const absolutePath = path.resolve(process.cwd(), relativePath);
  await writeFile(absolutePath, buffer);

  return {
    fileName,
    originalName: String(originalName || safeName),
    filePath: relativePath,
    fileSize: buffer.length,
    mimeType,
    uploadedBy,
  };
};

export const resolveAttachmentPath = (filePath) => path.resolve(process.cwd(), filePath);
