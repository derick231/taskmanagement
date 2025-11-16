import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/* ======================================================
   CREATE WORKSPACE
====================================================== */
export const createWorkspace = async (req, res) => {
  try {
    const { name, description, tags } = req.body;
    const userId = req.user?.id;

    if (!name) {
      return res.status(400).json({ error: "Workspace name is required" });
    }

    const workspace = await prisma.workspace.create({
      data: {
        name,
        description,
        tags,
        members: {
          create: userId
            ? { userId: Number(userId), role: "OWNER" }
            : undefined,
        },
      },
      include: {
        members: {
          include: { user: true },
        },
        groups: true,
        tasks: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Workspace created successfully",
      data: workspace,
    });
  } catch (error) {
    console.error("Create Workspace Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* ======================================================
   GET ALL WORKSPACES
====================================================== */
export const getWorkspaces = async (req, res) => {
  try {
    const workspaces = await prisma.workspace.findMany({
      include: {
        members: {
          include: { user: true },
        },
        groups: true,
        tasks: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: workspaces });
  } catch (error) {
    console.error("Get Workspaces Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* ======================================================
   GET WORKSPACES BY USER ID
====================================================== */
export const getWorkspacesByUserId = async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    const memberships = await prisma.workspaceMember.findMany({
      where: { userId },
      include: {
        workspace: {
          include: {
            members: { include: { user: true } },
            groups: true,
            tasks: true,
          },
        },
      },
    });

    const result = memberships.map((m) => m.workspace);

    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Get Workspaces by User Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* ======================================================
   GET WORKSPACE BY ID
====================================================== */
export const getWorkspaceById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const workspace = await prisma.workspace.findUnique({
      where: { id },
      include: {
        members: { include: { user: true } },
        groups: {
          include: {
            tasks: {
              include: {
                assignments: { include: { user: true } },
                createdBy: true,
              },
            },
          },
        },
        tasks: {
          include: {
            assignments: { include: { user: true } },
            createdBy: true,
          },
        },
      },
    });

    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    res.json({ success: true, data: workspace });
  } catch (error) {
    console.error("Get Workspace Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* ======================================================
   UPDATE WORKSPACE
====================================================== */
export const updateWorkspace = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, description, tags } = req.body;

    const workspace = await prisma.workspace.update({
      where: { id },
      data: { name, description, tags },
      include: {
        members: { include: { user: true } },
        groups: true,
        tasks: true,
      },
    });

    res.json({
      success: true,
      message: "Workspace updated successfully",
      data: workspace,
    });
  } catch (error) {
    console.error("Update Workspace Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* ======================================================
   DELETE WORKSPACE
====================================================== */
export const deleteWorkspace = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.workspace.delete({
      where: { id },
    });

    res.json({ success: true, message: "Workspace deleted" });
  } catch (error) {
    console.error("Delete Workspace Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* ======================================================
   ADD MEMBER
====================================================== */
export const addWorkspaceMember = async (req, res) => {
  try {
    const workspaceId = Number(req.params.id);
    const { userId, role = "MEMBER" } = req.body;

    const member = await prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId: Number(userId),
        role,
      },
      include: { user: true },
    });

    res.json({ success: true, data: member });
  } catch (error) {
    console.error("Add Member Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* ======================================================
   REMOVE MEMBER
====================================================== */
export const removeWorkspaceMember = async (req, res) => {
  try {
    const workspaceId = Number(req.params.id);
    const userId = Number(req.params.userId);

    await prisma.workspaceMember.delete({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    res.json({ success: true, message: "Member removed" });
  } catch (error) {
    console.error("Remove Member Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
