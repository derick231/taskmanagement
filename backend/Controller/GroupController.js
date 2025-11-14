import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to create permanent groups for a workspace (if workspace provided)
export const createPermanentGroups = async (work_id = null) => {
  try {
    const permanentGroups = [
      {
        name: "TODO",
        work_id: work_id,
        description: "Tasks to be completed",
        createdAt: new Date()
      },
      {
        name: "COMPLETED", 
        work_id: work_id,
        description: "Completed tasks",
        createdAt: new Date()
      }
    ];

    // Create permanent groups if they don't exist
    for (const groupData of permanentGroups) {
      // Check if group already exists
      const existingGroup = await prisma.group.findFirst({
        where: {
          name: groupData.name,
          work_id: work_id
        }
      });

      if (!existingGroup) {
        await prisma.group.create({
          data: groupData
        });
      }
    }
    
    if (work_id) {
      console.log(`Permanent groups created for workspace ${work_id}`);
    } else {
      console.log("Permanent groups created without workspace");
    }
  } catch (error) {
    console.error("Error creating permanent groups:", error);
    throw error;
  }
};

// Create a new group
export const createGroup = async (req, res) => {
  try {
    const { name, work_id, description } = req.body;

    // Basic validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Group name is required"
      });
    }

    if (name.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Group name is too long (max 100 characters)"
      });
    }

    // Validate workspace if provided
    if (work_id && (isNaN(work_id) || work_id <= 0)) {
      return res.status(400).json({
        success: false,
        message: "Invalid workspace ID"
      });
    }

    // Check if workspace exists (if provided)
    if (work_id) {
      const workspace = await prisma.workspace.findUnique({
        where: { id: parseInt(work_id) }
      });

      if (!workspace) {
        return res.status(404).json({
          success: false,
          message: "Workspace not found"
        });
      }
    }

    // Prevent creating groups with permanent names
    if (name.toUpperCase() === 'TODO' || name.toUpperCase() === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: "Cannot create group with reserved names (TODO, COMPLETED)"
      });
    }

    const group = await prisma.group.create({
      data: {
        name: name.trim(),
        work_id: work_id ? parseInt(work_id) : null,
        description: description || null
      },
      include: {
        task: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        workspace: work_id ? {
          select: {
            id: true,
            name: true
          }
        } : false,
        _count: {
          select: {
            task: true,
            user: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: "Group created successfully",
      data: group
    });

  } catch (error) {
    console.error("Error creating group:", error);

    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: "Group with this name already exists"
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get all groups (optionally filter by workspace)
export const getGroups = async (req, res) => {
  try {
    const { work_id } = req.query;

    // Build where condition
    const whereCondition = {};
    if (work_id) {
      const work_idNum = parseInt(work_id);
      if (isNaN(work_idNum)) {
        return res.status(400).json({
          success: false,
          message: "Invalid workspace ID"
        });
      }
      whereCondition.work_id = work_idNum;
    }

    const groups = await prisma.group.findMany({
      where: whereCondition,
      include: {
        task: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        workspace: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            task: true,
            user: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: groups,
      count: groups.length
    });

  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get groups by workspace
export const getGroupsByWorkspace = async (req, res) => {
  try {
    const { work_id } = req.params;
    const work_idNum = parseInt(work_id);

    if (isNaN(work_idNum)) {
      return res.status(400).json({
        success: false,
        message: "Invalid workspace ID"
      });
    }

    // Ensure permanent groups exist for this workspace
    await createPermanentGroups(work_idNum);

    const groups = await prisma.group.findMany({
      where: { work_id: work_idNum },
      include: {
        task: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        workspace: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            task: true,
            user: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: groups,
      count: groups.length
    });

  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get groups without workspace (global groups)
export const getGlobalGroups = async (req, res) => {
  try {
    // Ensure permanent global groups exist
    await createPermanentGroups(null);

    const groups = await prisma.group.findMany({
      where: { work_id: null },
      include: {
        task: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            task: true,
            user: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: groups,
      count: groups.length
    });

  } catch (error) {
    console.error("Error fetching global groups:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get single group with tasks
export const getGroupById = async (req, res) => {
  try {
    const { id } = req.params;
    const groupId = parseInt(id);

    if (isNaN(groupId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid group ID"
      });
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        task: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        workspace: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            task: true,
            user: true
          }
        }
      }
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }

    res.json({
      success: true,
      data: group
    });

  } catch (error) {
    console.error("Error fetching group:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Update group
export const updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const groupId = parseInt(id);

    if (isNaN(groupId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid group ID"
      });
    }

    const { name, work_id, description } = req.body;

    // Validate name if provided
    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Group name cannot be empty"
        });
      }

      if (name.length > 100) {
        return res.status(400).json({
          success: false,
          message: "Group name is too long (max 100 characters)"
        });
      }
    }

    // Validate workspace if provided
    if (work_id !== undefined && work_id !== null && (isNaN(work_id) || work_id <= 0)) {
      return res.status(400).json({
        success: false,
        message: "Invalid workspace ID"
      });
    }

    // Check if group exists
    const existingGroup = await prisma.group.findUnique({
      where: { id: groupId }
    });

    if (!existingGroup) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }

    // Prevent naming groups with permanent names (unless they already are permanent)
    if (name && (name.toUpperCase() === 'TODO' || name.toUpperCase() === 'COMPLETED')) {
      if (existingGroup.name.toUpperCase() !== name.toUpperCase()) {
        return res.status(400).json({
          success: false,
          message: "Cannot use reserved names (TODO, COMPLETED)"
        });
      }
    }

    // Check if workspace exists (if provided)
    if (work_id && work_id !== null) {
      const workspace = await prisma.workspace.findUnique({
        where: { id: parseInt(work_id) }
      });

      if (!workspace) {
        return res.status(404).json({
          success: false,
          message: "Workspace not found"
        });
      }
    }

    // Build update data object
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (work_id !== undefined) updateData.work_id = work_id ? parseInt(work_id) : null;
    if (description !== undefined) updateData.description = description;

    const group = await prisma.group.update({
      where: { id: groupId },
      data: updateData,
      include: {
        task: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        workspace: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            task: true,
            user: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: "Group updated successfully",
      data: group
    });

  } catch (error) {
    console.error("Error updating group:", error);

    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: "Group with this name already exists"
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Delete group
export const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const groupId = parseInt(id);

    if (isNaN(groupId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid group ID"
      });
    }

    // Check if group exists
    const existingGroup = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        _count: {
          select: {
            task: true,
            user: true
          }
        }
      }
    });

    if (!existingGroup) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }

    // Prevent deleting permanent groups
    if (existingGroup.name.toUpperCase() === 'TODO' || existingGroup.name.toUpperCase() === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: "Cannot delete permanent groups (TODO, COMPLETED)"
      });
    }

    // Check if group has tasks
    if (existingGroup._count.task > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete group with ${existingGroup._count.task} tasks. Move tasks to another group first.`
      });
    }

    // Check if group has users
    if (existingGroup._count.user > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete group with ${existingGroup._count.user} users. Remove users from group first.`
      });
    }

    await prisma.group.delete({
      where: { id: groupId }
    });

    res.json({
      success: true,
      message: "Group deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting group:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Move task to different group
export const moveTaskToGroup = async (req, res) => {
  try {
    const { taskId, targetGroupId } = req.body;

    // Validation
    if (!taskId || !targetGroupId) {
      return res.status(400).json({
        success: false,
        message: "Task ID and target group ID are required"
      });
    }

    if (isNaN(taskId) || isNaN(targetGroupId)) {
      return res.status(400).json({
        success: false,
        message: "Task ID and target group ID must be valid numbers"
      });
    }

    // Check if task and group exist
    const [task, group] = await Promise.all([
      prisma.task.findUnique({ where: { id: parseInt(taskId) } }),
      prisma.group.findUnique({ where: { id: parseInt(targetGroupId) } })
    ]);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Target group not found"
      });
    }

    const updatedTask = await prisma.task.update({
      where: { id: parseInt(taskId) },
      data: { groupId: parseInt(targetGroupId) },
      include: {
        group: true
      }
    });

    res.json({
      success: true,
      message: `Task moved to ${group.name} successfully`,
      data: updatedTask
    });

  } catch (error) {
    console.error("Error moving task:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};