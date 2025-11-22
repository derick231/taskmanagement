import { Router } from "express";
import {
  createOrGetPersonalChat,
  createWorkspaceChat,
  createGroupChat,
  sendMessage,
  getMessages,
  getUserChatRooms,
} from "../Controller/chatController";

const router = Router();

router.post("/personal", createOrGetPersonalChat);
router.post("/workspace", createWorkspaceChat);
router.post("/group", createGroupChat);

router.post("/message", sendMessage);

router.get("/messages/:roomId", getMessages);
router.get("/user/:userId", getUserChatRooms);

export default router;
