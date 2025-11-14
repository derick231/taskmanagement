import { Router } from "express";
import { createTask} from "../Controller/TaskController.js";

const router = Router()

router.post("/tasks", createTask)



export default router