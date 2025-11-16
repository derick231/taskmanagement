import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";

import {
  createTask,
  getTasksByWorkspace,
  getTasksByGroup,
  getTaskById,
  moveTaskToGroup,
  assignUsersToTask,
  removeUserFromTask,
  deleteTask,
} from "../Controller/TaskController.js";

const router = Router();

router.post("/tasks", authenticateToken, createTask);
router.get(
  "/tasks/workspace/:workspaceId",
  authenticateToken,
  getTasksByWorkspace
);
router.get("/tasks/group/:groupId", authenticateToken, getTasksByGroup);
router.get("/tasks/:id", authenticateToken, getTaskById);

router.put("/tasks/move", authenticateToken, moveTaskToGroup);
router.post("/tasks/:id/assign", authenticateToken, assignUsersToTask);
router.delete("/tasks/assign/remove", authenticateToken, removeUserFromTask);

router.delete("/tasks/:id", authenticateToken, deleteTask);

export default router;
