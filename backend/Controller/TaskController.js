// src/Controller/TaskController.js
import { PrismaClient } from "@prisma/client";
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
      groupId,
      workspaceId,
      createdById,
      assigneeIds = [],
    } = req.body;

    if (!name || !groupId || !workspaceId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }

    // Validate group
    const group = await prisma.group.findUnique({
      where: { id: Number(groupId) },
    });
    if (!group)
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });

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
        groupId: Number(groupId),
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
        group: true,
        workspace: true,
        assignments: { include: { user: true } },
      },
    });

    return res.status(201).json({ success: true, data: fullTask });
  } catch (error) {
    console.error("Create Task Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

/* -----------------------------------------------------
   GET TASKS BY WORKSPACE (for workspace board)
----------------------------------------------------- */
export const getTasksByWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const tasks = await prisma.task.findMany({
      where: { workspaceId: Number(workspaceId) },
      include: {
        group: true,
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
   GET TASKS BY GROUP (optional for filtering)
----------------------------------------------------- */
export const getTasksByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const tasks = await prisma.task.findMany({
      where: { groupId: Number(groupId) },
      include: {
        group: true,
        assignments: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ success: true, data: tasks });
  } catch (error) {
    console.error("Group Tasks Error:", error);
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
        group: true,
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
export const moveTaskToGroup = async (req, res) => {
  try {
    const { taskId, targetGroupId } = req.body;

    const updated = await prisma.task.update({
      where: { id: Number(taskId) },
      data: { groupId: Number(targetGroupId) },
      include: { group: true },
    });

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
