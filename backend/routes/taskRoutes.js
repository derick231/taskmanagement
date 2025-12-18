import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";

import {
  createTask,
  getTasksByWorkspace,
  getTasksByBoard,
  getTaskById,
  updateTask,
  moveTaskToBoard,
  assignUsersToTask,
  removeUserFromTask,
  deleteTask,
  updateTaskStatus,
  getMyTasks,
  filterTasks,
} from "../Controller/taskController.js";

const router = Router();

router.post("/tasks", authenticateToken, createTask);
router.get("/tasks/workspace/:workspaceId", authenticateToken, getTasksByWorkspace);
router.get("/tasks/board/:boardId", authenticateToken, getTasksByBoard);
router.get("/tasks/my-tasks", authenticateToken, getMyTasks);
router.get("/tasks/filter", authenticateToken, filterTasks);
router.get("/tasks/:id", authenticateToken, getTaskById);
router.put("/tasks/:id", authenticateToken, updateTask);
router.put("/tasks/move", authenticateToken, moveTaskToBoard);
router.put("/tasks/:id/status", authenticateToken, updateTaskStatus);
router.put("/tasks/:id/assign", authenticateToken, assignUsersToTask);
router.delete("/tasks/:id/unassign", authenticateToken, removeUserFromTask);
router.delete("/tasks/:id", authenticateToken, deleteTask);

export default router;
