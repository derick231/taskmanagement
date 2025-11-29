import { Router } from "express";
import {
    createOrganization,
    getUserOrganizations,
    getOrganization,
    updateOrganization,
    deleteOrganization,
    addOrganizationMember,
    removeOrganizationMember,
    updateMemberRole,
} from "../Controller/OrganizationController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = Router();

// Organization CRUD (all require authentication)
router.post("/organizations", authenticateToken, createOrganization);
router.get("/organizations", authenticateToken, getUserOrganizations);
router.get("/organizations/:id", authenticateToken, getOrganization);
router.put("/organizations/:id", authenticateToken, updateOrganization);
router.delete("/organizations/:id", authenticateToken, deleteOrganization);

// Member management
router.post("/organizations/:id/members", authenticateToken, addOrganizationMember);
router.delete("/organizations/:id/members/:userId", authenticateToken, removeOrganizationMember);
router.put("/organizations/:id/members/:userId/role", authenticateToken, updateMemberRole);

export default router;
