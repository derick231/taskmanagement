import { Router } from "express";
import { 
    createWorkspace, 
    getWorkspaces,
    getWorkspacesByUserId,
    getWorkspaceById,
    updateWorkspace,
    deleteWorkspace,
    addWorkspaceMember,
    removeWorkspaceMember,
    updateMemberRole
} from "../Controller/WorkspaceController.js";
import { authenticateToken } from "../middleware/authMiddleware.js"; // Import middleware

const router = Router();

// Core workspace CRUD operations (Protected)
router.post("/workspace", authenticateToken, createWorkspace);                          // Create new workspace
router.get("/workspaces", authenticateToken, getWorkspaces);                            // Get all workspaces
router.get("/workspaces/user/:userId", authenticateToken, getWorkspacesByUserId);       // Get workspaces by user ID
router.get("/workspaces/:id", authenticateToken, getWorkspaceById);                     // Get single workspace by ID
router.put("/workspaces/:id", authenticateToken, updateWorkspace);                      // Update workspace
router.delete("/workspaces/:id", authenticateToken, deleteWorkspace);                   // Delete workspace

// Workspace member management (Protected)
router.post("/workspaces/:id/members", authenticateToken, addWorkspaceMember);          // Add member to workspace
router.delete("/workspaces/:id/members/:userId", authenticateToken, removeWorkspaceMember); // Remove member from workspace
router.put("/workspaces/:id/members/:userId/role", authenticateToken, updateMemberRole);    // Update member role

export default router;
