import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


export const createOrGetPersonalChat = async (req, res) => {
  try {
    const { userA, userB } = req.body;

    if (!userA || !userB) {
      return res.status(400).json({ message: "Both users required." });
    }

    // Find personal room with exactly 2 members
    const existingRoom = await prisma.chatRoom.findFirst({
      where: {
        type: "PERSONAL",
        members: {
          every: {
            userId: { in: [userA, userB] },
          },
        },
      },
      include: { members: true },
    });

    if (existingRoom) return res.json(existingRoom);

    // Create new room
    const room = await prisma.chatRoom.create({
      data: {
        type: "PERSONAL",
        members: {
          create: [{ userId: userA }, { userId: userB }],
        },
      },
      include: { members: true },
    });

    res.json(room);
  } catch (err) {
    console.error("Error createOrGetPersonalChat:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createWorkspaceChat = async (req, res) => {
  try {
    const { workspaceId } = req.body;

    if (!workspaceId)
      return res.status(400).json({ message: "Workspace ID required." });

    let room = await prisma.chatRoom.findFirst({
      where: { workspaceId, type: "WORKSPACE" },
    });

    if (room) return res.json(room);

    room = await prisma.chatRoom.create({
      data: {
        type: "WORKSPACE",
        workspaceId,
      },
    });

    res.json(room);
  } catch (err) {
    console.error("Error createWorkspaceChat:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createBoardChat = async (req, res) => {
  try {
    const { boardId } = req.body;

    if (!boardId)
      return res.status(400).json({ message: "Board ID required." });

    let room = await prisma.chatRoom.findFirst({
      where: { boardId, type: "BOARD" },
    });

    if (room) return res.json(room);

    room = await prisma.chatRoom.create({
      data: {
        type: "BOARD",
        boardId,
      },
    });

    res.json(room);
  } catch (err) {
    console.error("Error createBoardChat:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { roomId, senderId, text, attachment } = req.body;

    if (!roomId || !senderId) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const msg = await prisma.message.create({
      data: {
        roomId,
        senderId,
        text,
        attachment,
      },
      include: {
        sender: true,
      },
    });

    // Emit via socket in routes
    req.app.get("io").to(`room_${roomId}`).emit("new_message", msg);

    res.json(msg);
  } catch (err) {
    console.error("Error sendMessage:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const roomId = Number(req.params.roomId);

    const messages = await prisma.message.findMany({
      where: { roomId },
      include: { sender: true },
      orderBy: { createdAt: "asc" },
    });

    res.json(messages);
  } catch (err) {
    console.error("Error getMessages:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserChatRooms = async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    const rooms = await prisma.chatRoom.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        members: { include: { user: true } },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    res.json(rooms);
  } catch (err) {
    console.error("Error getUserChatRooms:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
