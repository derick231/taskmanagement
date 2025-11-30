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
    const userId = req.user?.id;

    if (!workspaceId)
      return res.status(400).json({ message: "Workspace ID required." });

    // Verify user is a member of the workspace
    const workspaceMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: Number(workspaceId),
          userId,
        },
      },
    });

    if (!workspaceMember) {
      return res.status(403).json({
        message: "Access denied. You must be a workspace member to access this chat."
      });
    }

    let room = await prisma.chatRoom.findFirst({
      where: { workspaceId: Number(workspaceId), type: "WORKSPACE" },
    });

    if (room) return res.json(room);

    room = await prisma.chatRoom.create({
      data: {
        type: "WORKSPACE",
        workspaceId: Number(workspaceId),
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
    const userId = req.user?.id;

    if (!boardId)
      return res.status(400).json({ message: "Board ID required." });

    // Verify user is a member of the board
    const boardMember = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId: Number(boardId),
          userId,
        },
      },
    });

    if (!boardMember) {
      return res.status(403).json({
        message: "Access denied. You must be a board member to access this chat."
      });
    }

    let room = await prisma.chatRoom.findFirst({
      where: { boardId: Number(boardId), type: "BOARD" },
    });

    if (room) return res.json(room);

    room = await prisma.chatRoom.create({
      data: {
        type: "BOARD",
        boardId: Number(boardId),
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
    const userId = req.user?.id;

    if (!roomId || !senderId) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Verify user has access to this chat room
    const room = await prisma.chatRoom.findUnique({
      where: { id: Number(roomId) },
      include: {
        workspace: true,
        board: true,
        members: true,
      },
    });

    if (!room) {
      return res.status(404).json({ message: "Chat room not found." });
    }

    // Check access based on room type
    let hasAccess = false;

    if (room.type === "WORKSPACE" && room.workspaceId) {
      const workspaceMember = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: room.workspaceId,
            userId,
          },
        },
      });
      hasAccess = !!workspaceMember;
    } else if (room.type === "BOARD" && room.boardId) {
      const boardMember = await prisma.boardMember.findUnique({
        where: {
          boardId_userId: {
            boardId: room.boardId,
            userId,
          },
        },
      });
      hasAccess = !!boardMember;
    } else if (room.type === "PERSONAL") {
      hasAccess = room.members.some((m) => m.userId === userId);
    }

    if (!hasAccess) {
      return res.status(403).json({
        message: "Access denied. You don't have permission to send messages in this chat."
      });
    }

    const msg = await prisma.message.create({
      data: {
        roomId: Number(roomId),
        senderId,
        text,
        attachment,
      },
      include: {
        sender: true,
      },
    });

    // Emit to all users in the room (including sender)
    const io = req.app.get("io");
    io.to(`room_${roomId}`).emit("new_message", msg);
    console.log(`Emitted new_message to room_${roomId}:`, msg.id);

    res.json(msg);
  } catch (err) {
    console.error("Error sendMessage:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const roomId = Number(req.params.roomId);
    const userId = req.user?.id;

    // Verify user has access to this chat room
    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: {
        workspace: true,
        board: true,
        members: true,
      },
    });

    if (!room) {
      return res.status(404).json({ message: "Chat room not found." });
    }

    // Check access based on room type
    let hasAccess = false;

    if (room.type === "WORKSPACE" && room.workspaceId) {
      const workspaceMember = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: room.workspaceId,
            userId,
          },
        },
      });
      hasAccess = !!workspaceMember;
    } else if (room.type === "BOARD" && room.boardId) {
      const boardMember = await prisma.boardMember.findUnique({
        where: {
          boardId_userId: {
            boardId: room.boardId,
            userId,
          },
        },
      });
      hasAccess = !!boardMember;
    } else if (room.type === "PERSONAL") {
      hasAccess = room.members.some((m) => m.userId === userId);
    }

    if (!hasAccess) {
      return res.status(403).json({
        message: "Access denied. You don't have permission to view this chat."
      });
    }

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

    // Get user's workspace memberships
    const workspaceMemberships = await prisma.workspaceMember.findMany({
      where: { userId },
      select: { workspaceId: true },
    });
    const workspaceIds = workspaceMemberships.map((m) => m.workspaceId);

    // Get user's board memberships
    const boardMemberships = await prisma.boardMember.findMany({
      where: { userId },
      select: { boardId: true },
    });
    const boardIds = boardMemberships.map((m) => m.boardId);

    // Fetch all chat rooms the user has access to
    const rooms = await prisma.chatRoom.findMany({
      where: {
        OR: [
          // Personal chats where user is a member
          {
            type: "PERSONAL",
            members: {
              some: { userId },
            },
          },
          // Workspace chats for workspaces user is a member of
          {
            type: "WORKSPACE",
            workspaceId: { in: workspaceIds },
          },
          // Board chats for boards user is a member of
          {
            type: "BOARD",
            boardId: { in: boardIds },
          },
        ],
      },
      include: {
        members: { include: { user: true } },
        workspace: {
          select: { id: true, name: true, slug: true },
        },
        board: {
          select: { id: true, name: true },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    res.json(rooms);
  } catch (err) {
    console.error("Error getUserChatRooms:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
