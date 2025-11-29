import { Router } from "express";
import {
  createWorkspace,
  getWorkspaces,
  getWorkspacesByUserId,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  addWorkspaceMember,
  updateMemberRole,
} from "../Controller/WorkspaceController.js";

import { authenticateToken } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/workspaces", authenticateToken, createWorkspace);
router.get("/workspaces", authenticateToken, getWorkspaces);
router.get(
  "/workspaces/user/:userId",
  authenticateToken,
  getWorkspacesByUserId
);
router.get("/workspaces/:id", authenticateToken, getWorkspaceById);
router.put("/workspaces/:id", authenticateToken, updateWorkspace);
router.delete("/workspaces/:id", authenticateToken, deleteWorkspace);

router.post("/workspaces/:id/members", authenticateToken, addWorkspaceMember);
// router.delete(
//   "/workspaces/:id/members/:userId",
//   authenticateToken,
//   removeWorkspaceMember
// );
router.put(
  "/workspaces/:id/members/:userId/role",
  authenticateToken,
  updateMemberRole
);

export default router;
