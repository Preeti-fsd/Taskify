import { execute, query } from "../config/db.js";

export const taskAttachmentRepository = {
  async findById(id) {
    const rows = await query(
      `SELECT id, task_id, file_name, original_name, file_path, file_size, mime_type, uploaded_by, created_at
         FROM task_attachments
        WHERE id = ?
        LIMIT 1`,
      [id],
    );

    return rows[0] || null;
  },

  async listByTaskIds(taskIds) {
    if (!taskIds.length) return [];
    const placeholders = taskIds.map(() => "?").join(",");
    return query(
      `SELECT id, task_id, file_name, original_name, file_path, file_size, mime_type, uploaded_by, created_at
         FROM task_attachments
        WHERE task_id IN (${placeholders})
        ORDER BY created_at ASC`,
      taskIds,
    );
  },

  async listByTaskId(taskId) {
    return query(
      `SELECT id, task_id, file_name, original_name, file_path, file_size, mime_type, uploaded_by, created_at
         FROM task_attachments
        WHERE task_id = ?
        ORDER BY created_at ASC`,
      [taskId],
    );
  },

  async create({ taskId, fileName, originalName, filePath, fileSize, mimeType, uploadedBy }) {
    const result = await execute(
      `INSERT INTO task_attachments
        (task_id, file_name, original_name, file_path, file_size, mime_type, uploaded_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [taskId, fileName, originalName, filePath, fileSize, mimeType, uploadedBy],
    );

    return this.findById(result.insertId);
  },
};
