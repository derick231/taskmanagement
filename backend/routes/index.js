import { Router } from "express";
import UserRoutes from './userRoutes.js'
import WorkRoutes from './workRoutes.js'
import GroupRoutes from './GroupRoutes.js'
import TasksRoutes from './taskRoutes.js'

const router = Router()

router.use("/", UserRoutes)
router.use("/",WorkRoutes)
router.use('/',GroupRoutes)
router.use('/',TasksRoutes)



export default router