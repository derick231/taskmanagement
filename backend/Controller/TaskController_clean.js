import { PrismaClient } from "@prisma/client";
import { emitTaskUpdate } from "../socketHandlers.js";

const prisma = new PrismaClient();

/* -----------------------------------------------------
   CREATE TASK
----------------------------------------------------- */
export const createTask = async (req, res) => {
  try {
    const {
      name,
      description,
      dueDate,
      priority = "NORMAL",
      boardId,
      workspaceId,
      createdById,
      assigneeIds = [],
    } = req.body;

    if (!name || !boardId || !workspaceId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }

    // Validate board
    const board = await prisma.board.findUnique({
      where: { id: Number(boardId) },
    });
    if (!board)
      return res
        .status(404)
        .json({ success: false, message: "Board not found" });

    // Validate workspace
    const workspace = await prisma.workspace.findUnique({
      where: { id: Number(workspaceId) },
    });
    if (!workspace)
      return res
        .status(404)
        .json({ success: false, message: "Workspace not found" });

    // Create task
    const task = await prisma.task.create({
      data: {
        name,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority,
        boardId: Number(boardId),
        workspaceId: Number(workspaceId),
        createdById: createdById ? Number(createdById) : null,
      },
    });

    // Assign multiple users
    if (assigneeIds.length > 0) {
      await prisma.taskAssignment.createMany({
        data: assigneeIds.map((uid) => ({
          taskId: task.id,
          userId: Number(uid),
          role: "ASSIGNEE",
        })),
      });
    }

    const fullTask = await prisma.task.findUnique({
      where: { id: task.id },
      include: {
        board: true,
        workspace: true,
        assignments: { include: { user: true } },
      },
    });

    // Emit real-time event
    const io = req.app.get("io");
    if (io) {
      emitTaskUpdate(io, workspaceId, "task_created", {
        task: fullTask,
        createdBy: createdById,
      });
    }

    return res.status(201).json({ success: true, data: fullTask });
  } catch (error) {
    console.error("Create Task Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

/* -----------------------------------------------------
   GET TASKS BY WORKSPACE
----------------------------------------------------- */
export const getTasksByWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const tasks = await prisma.task.findMany({
      where: { workspaceId: Number(workspaceId) },
      include: {
        board: true,
        assignments: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ success: true, data: tasks });
  } catch (error) {
    console.error("Workspace Tasks Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

/* -----------------------------------------------------
   GET TASKS BY BOARD
----------------------------------------------------- */
export const getTasksByBoard = async (req, res) => {
  try {
    const { boardId } = req.params;

    const tasks = await prisma.task.findMany({
      where: { boardId: Number(boardId) },
      include: {
        board: true,
        assignments: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ success: true, data: tasks });
  } catch (error) {
    console.error("Board Tasks Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

/* -----------------------------------------------------
   GET SINGLE TASK
----------------------------------------------------- */
export const getTaskById = async (req, res) => {
  try {
    const taskId = Number(req.params.id);

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        board: true,
        workspace: true,
        assignments: { include: { user: true } },
      },
    });

    if (!task)
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });

    return res.json({ success: true, data: task });
  } catch (error) {
    console.error("Get Task Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

/* -----------------------------------------------------
   MOVE TASK (DRAG & DROP)
----------------------------------------------------- */
export const moveTaskToBoard = async (req, res) => {
  try {
    const { taskId, targetBoardId } = req.body;

    const updated = await prisma.task.update({
      where: { id: Number(taskId) },
      data: { boardId: Number(targetBoardId) },
      include: { board: true },
    });

    // Emit real-time event
    const io = req.app.get("io");
    if (io) {
      const task = await prisma.task.findUnique({
        where: { id: Number(taskId) },
        include: { workspace: true },
      });
      if (task) {
        emitTaskUpdate(io, task.workspaceId, "task_moved", {
          task: updated,
          fromBoardId: task.boardId,
          toBoardId: targetBoardId,
        });
      }
    }

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Move Task Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

/* -----------------------------------------------------
   ASSIGN USERS
----------------------------------------------------- */
export const assignUsersToTask = async (req, res) => {
  try {
    const taskId = Number(req.params.id);
    const { userIds = [], role = "ASSIGNEE" } = req.body;

    await prisma.taskAssignment.createMany({
      data: userIds.map((uid) => ({
        taskId,
        userId: Number(uid),
        role,
      })),
      skipDuplicates: true,
    });

    const updated = await prisma.task.findUnique({
      where: { id: taskId },
      include: { assignments: { include: { user: true } } },
    });

    // Emit real-time event
    const io = req.app.get("io");
    if (io) {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: { workspace: true },
      });
      if (task) {
        emitTaskUpdate(io, task.workspaceId, "task_assigned", {
          task: updated,
          assignedUsers: userIds,
        });
      }
    }

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Assign Users Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

/* -----------------------------------------------------
   REMOVE USER FROM TASK
----------------------------------------------------- */
export const removeUserFromTask = async (req, res) => {
  try {
    const { taskId, userId } = req.body;

    await prisma.taskAssignment.deleteMany({
      where: {
        taskId: Number(taskId),
        userId: Number(userId),
      },
    });

    return res.json({ success: true, message: "User removed" });
  } catch (error) {
    console.error("Remove User Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

/* -----------------------------------------------------
   DELETE TASK
----------------------------------------------------- */
export const deleteTask = async (req, res) => {
  try {
    await prisma.task.delete({
      where: { id: Number(req.params.id) },
    });

    return res.json({ success: true, message: "Task deleted" });
  } catch (error) {
    console.error("Delete Task Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
