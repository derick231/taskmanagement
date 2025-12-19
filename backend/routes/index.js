import { Router } from "express";
import UserRoutes from "./userRoutes.js";
import WorkRoutes from "./workRoutes.js";
import BoardRoutes from "./BoardRoutes.js";
import TasksRoutes from "./taskRoutes.js";
import ChatRoutes from "./chatRoute.js";
import OrganizationRoutes from "./OrganizationRoutes.js";
import DashboardRoutes from "./dashboardRoutes.js";

const router = Router();

router.use("/", UserRoutes);
router.use("/", OrganizationRoutes);
router.use("/", WorkRoutes);
router.use("/", BoardRoutes);
router.use("/", TasksRoutes);
router.use("/", ChatRoutes);
router.use("/", DashboardRoutes);

export default router;



