import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// --------------------------------------------------
// CREATE GROUP
// --------------------------------------------------
export const createGroup = async (req, res) => {
  try {
    const { name, workId, description } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Group name is required" });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: Number(workId) },
    });

    if (!workspace) {
      return res
        .status(404)
        .json({ success: false, message: "Workspace not found" });
    }

    const group = await prisma.group.create({
      data: {
        name,
        description,
        workId: Number(workId),
      },
      include: {
        tasks: true,
        members: {
          include: { user: true },
        },
      },
    });

    res.status(201).json({ success: true, data: group });
  } catch (error) {
    console.error("Create Group Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// --------------------------------------------------
// GET ALL GROUPS OF WORKSPACE
// --------------------------------------------------
export const getGroupsByWorkspace = async (req, res) => {
  try {
    const { workId } = req.params;

    const groups = await prisma.group.findMany({
      where: { workId: Number(workId) },
      include: {
        tasks: {
          include: {
            assignments: { include: { user: true } },
            createdBy: true,
          },
          orderBy: { createdAt: "desc" },
        },
        members: { include: { user: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return res.json({ success: true, data: groups });
  } catch (error) {
    console.error("Fetch Groups Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// --------------------------------------------------
// SINGLE GROUP
// --------------------------------------------------
export const getGroupById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        tasks: {
          include: {
            assignments: { include: { user: true } },
            createdBy: true,
          },
        },
        members: { include: { user: true } },
      },
    });

    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    return res.json({ success: true, data: group });
  } catch (error) {
    console.error("Fetch Group Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// --------------------------------------------------
// UPDATE GROUP
// --------------------------------------------------
export const updateGroup = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, description } = req.body;

    const group = await prisma.group.update({
      where: { id },
      data: { name, description },
    });

    res.json({ success: true, data: group });
  } catch (error) {
    console.error("Update Group Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// --------------------------------------------------
// DELETE GROUP
// --------------------------------------------------
export const deleteGroup = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.group.delete({ where: { id } });

    res.json({ success: true, message: "Group deleted" });
  } catch (error) {
    console.error("Delete Group Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// --------------------------------------------------
// MOVE TASK BETWEEN GROUPS
// --------------------------------------------------
export const moveTaskToGroup = async (req, res) => {
  try {
    const { taskId, targetGroupId } = req.body;

    const updated = await prisma.task.update({
      where: { id: Number(taskId) },
      data: { groupId: Number(targetGroupId) },
      include: { group: true },
    });

    res.json({
      success: true,
      message: "Task moved successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Move Task Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
