import { Router } from "express";
import { createGroup, getGroupsByWorkspace } from "../Controller/GroupController.js";

const router = Router()

router.post("/group", createGroup)
router.get("/getgroupsforworkspace", getGroupsByWorkspace)

export default router