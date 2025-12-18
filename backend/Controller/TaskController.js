import { PrismaClient } from "@prisma/client";
import { emitTaskUpdate } from "../socketHandlers.js";

const prisma = new PrismaClient();

/* -----------------------------------------------------
   WEIGHTED SCORING ALGORITHM
   Calculates priority score based on multiple factors:
   - Priority Level: 40% weight
   - Due Date Urgency: 30% weight
   - Task Status: 20% weight
   - Task Age: 10% weight
----------------------------------------------------- */
const calculateTaskScore = (task) => {
  let score = 0;

  // 1. Priority Weight (40 points max)
  const priorityWeights = {
    URGENT: 40,
    HIGH: 30,
    NORMAL: 20,
    LOW: 10,
  };
  score += priorityWeights[task.priority] || 20;

  // 2. Due Date Urgency (30 points max)
  if (task.dueDate) {
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const daysUntilDue = (dueDate - now) / (1000 * 60 * 60 * 24);

    if (daysUntilDue < 0) {
      // Overdue - highest urgency
      score += 30;
    } else if (daysUntilDue <= 1) {
      // Due today or tomorrow
      score += 25;
    } else if (daysUntilDue <= 3) {
      // Due within 3 days
      score += 20;
    } else if (daysUntilDue <= 7) {
      // Due within a week
      score += 15;
    } else if (daysUntilDue <= 14) {
      // Due within 2 weeks
      score += 10;
    } else {
      // Due later
      score += 5;
    }
  } else {
    // No due date - neutral score
    score += 10;
  }

  // 3. Status Weight (20 points max)
  const statusWeights = {
    BLOCKED: 20,      // Blocked tasks need immediate attention
    IN_PROGRESS: 18,  // Active tasks should be completed
    REVIEW: 15,       // Tasks in review are near completion
    TODO: 12,         // New tasks waiting to start
    COMPLETED: 0,     // Completed tasks have lowest priority
  };
  score += statusWeights[task.status] || 12;

  // 4. Age Weight (10 points max)
  // Older tasks get slightly higher priority to prevent stagnation
  const now = new Date();
  const createdDate = new Date(task.createdAt);
  const ageInDays = (now - createdDate) / (1000 * 60 * 60 * 24);

  if (ageInDays > 30) {
    score += 10;
  } else if (ageInDays > 14) {
    score += 7;
  } else if (ageInDays > 7) {
    score += 5;
  } else {
    score += 3;
  }

  return Math.round(score);
};

// Add score to tasks array
const addScoresToTasks = (tasks) => {
  return tasks.map(task => ({
    ...task,
    priorityScore: calculateTaskScore(task),
  })).sort((a, b) => b.priorityScore - a.priorityScore);
};

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
    });

    // Apply weighted scoring algorithm
    const scoredTasks = addScoresToTasks(tasks);

    return res.json({ success: true, data: scoredTasks });
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
    });

    // Apply weighted scoring algorithm
    const scoredTasks = addScoresToTasks(tasks);

    return res.json({ success: true, data: scoredTasks });
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

/* -----------------------------------------------------
   UPDATE TASK STATUS
----------------------------------------------------- */
export const updateTaskStatus = async (req, res) => {
  try {
    const taskId = Number(req.params.id);
    const { status } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    // Validate status
    const validStatuses = ["TODO", "IN_PROGRESS", "BLOCKED", "REVIEW", "COMPLETED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { workspace: true },
    });

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    // Check if user is a member of the workspace
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: task.workspaceId,
          userId,
        },
      },
    });

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You must be a workspace member to update tasks."
      });
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { status },
      include: {
        board: true,
        workspace: true,
        assignments: { include: { user: true } },
      },
    });

    // Emit real-time event
    const io = req.app.get("io");
    if (io) {
      emitTaskUpdate(io, task.workspaceId, "task_status_updated", {
        task: updated,
        oldStatus: task.status,
        newStatus: status,
        updatedBy: userId,
      });
    }

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update Task Status Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

/* -----------------------------------------------------
   GET TASKS ASSIGNED TO CURRENT USER
----------------------------------------------------- */
export const getMyTasks = async (req, res) => {
  try {
    const userId = req.user?.id;

    const assignments = await prisma.taskAssignment.findMany({
      where: { userId },
      include: {
        task: {
          include: {
            board: true,
            workspace: true,
            assignments: { include: { user: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const tasks = assignments.map((a) => a.task);

    // Apply weighted scoring algorithm
    const scoredTasks = addScoresToTasks(tasks);

    return res.json({ success: true, data: scoredTasks });
  } catch (error) {
    console.error("Get My Tasks Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

/* -----------------------------------------------------
   UPDATE TASK (GENERAL) - Used by drag-and-drop
----------------------------------------------------- */
export const updateTask = async (req, res) => {
  try {
    const taskId = Number(req.params.id);
    const { name, description, priority, dueDate, status } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { workspace: true },
    });

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    // Check if user is a member of the workspace
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: task.workspaceId,
          userId,
        },
      },
    });

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You must be a workspace member to update tasks."
      });
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        name,
        description,
        priority,
        status,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      },
      include: {
        board: true,
        workspace: true,
        assignments: { include: { user: true } },
      },
    });

    // Emit real-time event
    const io = req.app.get("io");
    if (io) {
      emitTaskUpdate(io, task.workspaceId, "task_updated", {
        task: updated,
        updatedBy: userId,
      });
    }

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update Task Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

/* -----------------------------------------------------
   FILTER TASKS
----------------------------------------------------- */
export const filterTasks = async (req, res) => {
  try {
    const { workspaceId, status, priority, assigneeId } = req.query;

    const where = {};

    if (workspaceId) where.workspaceId = Number(workspaceId);
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigneeId) {
      where.assignments = {
        some: { userId: Number(assigneeId) },
      };
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        board: true,
        workspace: true,
        assignments: { include: { user: true } },
      },
    });

    // Apply weighted scoring algorithm
    const scoredTasks = addScoresToTasks(tasks);

    return res.json({ success: true, data: scoredTasks });
  } catch (error) {
    console.error("Filter Tasks Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};