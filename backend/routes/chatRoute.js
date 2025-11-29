import { Router } from "express";
import {
  createOrGetPersonalChat,
  createWorkspaceChat,
  createBoardChat,
  sendMessage,
  getMessages,
  getUserChatRooms,
} from "../Controller/chatController.js";

const router = Router();

router.post("/personal", createOrGetPersonalChat);
router.post("/workspace", createWorkspaceChat);
router.post("/board", createBoardChat);

router.post("/message", sendMessage);

router.get("/messages/:roomId", getMessages);
router.get("/user/:userId", getUserChatRooms);

export default router;
