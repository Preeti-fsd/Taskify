import { taskService } from "../services/taskService.js";

export const taskController = {
  async getTasks(req, res, next) {
    try {
      const tasks = await taskService.getTasks(req.user.id);
      res.json(tasks);
    } catch (error) {
      next(error);
    }
  },

  async createTask(req, res, next) {
    try {
      const task = await taskService.createTask(req.user.id, req.body);
      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  },

  async updateTask(req, res, next) {
    try {
      const task = await taskService.updateTask(req.user.id, req.params.id, req.body);
      res.json(task);
    } catch (error) {
      next(error);
    }
  },

  async deleteTask(req, res, next) {
    try {
      await taskService.deleteTask(req.user.id, req.params.id);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  },

  async reorderTasks(req, res, next) {
    try {
      const tasks = await taskService.reorderTasks(req.user.id, req.body.tasks);
      res.json(tasks);
    } catch (error) {
      next(error);
    }
  },

  async sendDueEmailReminders(req, res, next) {
    try {
      const result = await taskService.sendDueEmailReminders(req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async addFocusSession(req, res, next) {
    try {
      const task = await taskService.addFocusSession(req.user.id, req.params.id, req.body.session);
      res.json(task);
    } catch (error) {
      next(error);
    }
  },

  async listAttachments(req, res, next) {
    try {
      res.json(await taskService.listAttachments(req.user.id, req.params.id));
    } catch (error) {
      next(error);
    }
  },

  async downloadAttachment(req, res, next) {
    try {
      const { absolutePath, downloadName } = await taskService.downloadAttachment(
        req.user.id,
        req.params.id,
        req.params.attachmentId,
      );
      res.download(absolutePath, downloadName);
    } catch (error) {
      next(error);
    }
  },
};
