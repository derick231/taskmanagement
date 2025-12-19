
import { Router } from "express";
import { getDashboardStats } from "../Controller/DashboardController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/dashboard/stats", authenticateToken, getDashboardStats);

export default router;
