import { Router } from "express";
import {
  createOrGetPersonalChat,
  createWorkspaceChat,
  createBoardChat,
  sendMessage,
  getMessages,
  getUserChatRooms,
} from "../Controller/chatController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/personal", authenticateToken, createOrGetPersonalChat);
router.post("/workspace", authenticateToken, createWorkspaceChat);
router.post("/board", authenticateToken, createBoardChat);

router.post("/message", authenticateToken, sendMessage);

router.get("/messages/:roomId", authenticateToken, getMessages);
router.get("/user/:userId", authenticateToken, getUserChatRooms);

export default router;
