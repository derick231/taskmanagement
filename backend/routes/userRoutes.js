import { Router } from "express";
import { createUser, getUsers, loginUser } from "../Controller/UserController.js";

const router = Router()

router.post("/user", createUser)
router.get("/users",getUsers)
router.post("/login", loginUser)


export default router