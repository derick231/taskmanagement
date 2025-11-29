import { PrismaClient } from "@prisma/client";
import { emitWorkspaceUpdate, emitMemberUpdate } from "../socketHandlers.js";

const prisma = new PrismaClient();

/* ======================================================
   CREATE WORKSPACE
====================================================== */
export const createWorkspace = async (req, res) => {
  try {
    const { name, description, tags, organizationId, slug } = req.body;
    const userId = req.user?.id;

    if (!name || !organizationId || !slug) {
      return res.status(400).json({ error: "Name, organization, and slug are required" });
    }

    // Check if slug is unique within organization
    const existing = await prisma.workspace.findUnique({
      where: {
        organizationId_slug: {
          organizationId: Number(organizationId),
          slug,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ error: "Workspace slug already exists in this organization" });
    }

    const workspace = await prisma.workspace.create({
      data: {
        name,
        description,
        tags,
        slug,
        organizationId: Number(organizationId),
        managerId: userId, // Creator becomes manager
        members: {
          create: {
            userId: Number(userId),
            role: "MANAGER",
          },
        },
      },
      include: {
        members: {
          include: { user: true },
        },
        boards: true,
        tasks: true,
        manager: true,
      },
    });

    // Create default boards for the workspace
    const defaultBoards = [
      { name: "To Do", description: "Tasks to be started", position: 0 },
      { name: "Ongoing", description: "Tasks in progress", position: 1 },
      { name: "In Review", description: "Tasks under review", position: 2 },
      { name: "Completed", description: "Finished tasks", position: 3 },
    ];

    await prisma.board.createMany({
      data: defaultBoards.map(board => ({
        ...board,
        workspaceId: workspace.id,
      })),
    });

    // Fetch workspace with boards
    const workspaceWithBoards = await prisma.workspace.findUnique({
      where: { id: workspace.id },
      include: {
        members: {
          include: { user: true },
        },
        boards: {
          orderBy: { position: "asc" },
        },
        tasks: true,
        manager: true,
      },
    });

    // Emit real-time event
    const io = req.app.get("io");
    if (io) {
      emitWorkspaceUpdate(io, workspaceWithBoards.organizationId, "workspace_created", {
        workspace: workspaceWithBoards,
        createdBy: userId,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Workspace created successfully",
      data: workspaceWithBoards,
    });
  } catch (error) {
    console.error("Create Workspace Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* ======================================================
   GET ALL WORKSPACES (Admin/Debug)
====================================================== */
export const getWorkspaces = async (req, res) => {
  try {
    const workspaces = await prisma.workspace.findMany({
      include: {
        members: {
          include: { user: true },
        },
        boards: true,
        tasks: true,
        manager: true,
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
            boards: true,
            tasks: true,
            manager: true,
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
        boards: {
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
        manager: true,
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
    const userId = req.user?.id;

    const workspace = await prisma.workspace.findUnique({
      where: { id },
    });

    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    // Check permissions (Manager or MANAGER role member)
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: id,
          userId,
        },
      },
    });

    const isManager = workspace.managerId === userId || member?.role === "MANAGER";
    if (!isManager) {
      return res.status(403).json({ error: "Only workspace managers can update details" });
    }

    const updated = await prisma.workspace.update({
      where: { id },
      data: { name, description, tags },
      include: {
        members: { include: { user: true } },
        boards: true,
        tasks: true,
        manager: true,
      },
    });

    // Emit real-time event
    const io = req.app.get("io");
    if (io) {
      emitWorkspaceUpdate(io, updated.organizationId, "workspace_updated", {
        workspace: updated,
        updatedBy: userId,
      });
    }

    res.json({
      success: true,
      message: "Workspace updated successfully",
      data: updated,
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
    const userId = req.user?.id;

    const workspace = await prisma.workspace.findUnique({
      where: { id },
    });

    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    if (workspace.managerId !== userId) {
      return res.status(403).json({ error: "Only workspace manager can delete workspace" });
    }

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
    const requesterId = req.user?.id;

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    // Check if requester is manager or has MANAGER role
    const requesterMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: requesterId,
        },
      },
    });

    const canAddMembers = workspace.managerId === requesterId || requesterMember?.role === "MANAGER";
    if (!canAddMembers) {
      return res.status(403).json({ error: "Only workspace managers can add members" });
    }

    const member = await prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId: Number(userId),
        role,
      },
      include: { user: true },
    });

    // Emit real-time event
    const io = req.app.get("io");
    if (io) {
      emitMemberUpdate(io, workspaceId, "member_added", {
        member,
        workspaceId,
        addedBy: requesterId,
      });
    }

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
    const requesterId = req.user?.id;

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    // Check if requester is manager or has MANAGER role
    const requesterMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: requesterId,
        },
      },
    });

    const canRemoveMembers = workspace.managerId === requesterId || requesterMember?.role === "MANAGER" || requesterId === userId;
    if (!canRemoveMembers) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Cannot remove manager
    if (workspace.managerId === userId) {
      return res.status(400).json({ error: "Cannot remove workspace manager" });
    }

    await prisma.workspaceMember.delete({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    // Emit real-time event
    const io = req.app.get("io");
    if (io) {
      emitMemberUpdate(io, workspaceId, "member_removed", {
        userId,
        workspaceId,
        removedBy: requesterId,
      });
    }

    res.json({ success: true, message: "Member removed" });
  } catch (error) {
    console.error("Remove Member Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* ======================================================
   UPDATE MEMBER ROLE
====================================================== */
export const updateMemberRole = async (req, res) => {
  try {
    const workspaceId = Number(req.params.id);
    const userId = Number(req.params.userId);
    const { role } = req.body;
    const requesterId = req.user?.id;

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    // Only workspace manager can change roles
    if (workspace.managerId !== requesterId) {
      return res.status(403).json({ error: "Only workspace manager can change roles" });
    }

    // Cannot change manager's role
    if (workspace.managerId === userId) {
      return res.status(400).json({ error: "Cannot change workspace manager's role" });
    }

    const updated = await prisma.workspaceMember.update({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
      data: { role },
      include: { user: true },
    });

    // Emit real-time event
    const io = req.app.get("io");
    if (io) {
      emitMemberUpdate(io, workspaceId, "member_role_updated", {
        member: updated,
        workspaceId,
        updatedBy: requesterId,
      });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update Member Role Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
