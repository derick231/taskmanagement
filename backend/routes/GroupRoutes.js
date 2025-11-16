import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";

import {
  createGroup,
  getGroupsByWorkspace,
  getGroupById,
  updateGroup,
  deleteGroup,
  moveTaskToGroup,
} from "../Controller/GroupController.js";

const router = Router();

router.post("/groups", authenticateToken, createGroup);
router.get(
  "/groups/workspace/:workId",
  authenticateToken,
  getGroupsByWorkspace
);
router.get("/groups/:id", authenticateToken, getGroupById);
router.put("/groups/:id", authenticateToken, updateGroup);
router.delete("/groups/:id", authenticateToken, deleteGroup);
router.put("/groups/move-task", authenticateToken, moveTaskToGroup);

export default router;
