import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import {
    createBoard,
    getBoardsByWorkspace,
    getBoardById,
    updateBoard,
    deleteBoard,
} from "../Controller/BoardController.js";

const router = Router();

router.post("/boards", authenticateToken, createBoard);
router.get("/boards/workspace/:workspaceId", authenticateToken, getBoardsByWorkspace);
router.get("/boards/:id", authenticateToken, getBoardById);
router.put("/boards/:id", authenticateToken, updateBoard);
router.delete("/boards/:id", authenticateToken, deleteBoard);

export default router;
