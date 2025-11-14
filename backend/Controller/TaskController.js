import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create a new task
export const createTask = async (req, res) => {
  try {
    const { name, description, dueDate, priority, groupId, workspaceId, createdById, assigneeIds } = req.body;

    // Basic validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Task name is required"
      });
    }

    if (!groupId || isNaN(groupId) || groupId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid group ID is required"
      });
    }

    if (!workspaceId || isNaN(workspaceId) || workspaceId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid workspace ID is required"
      });
    }

    // Validate priority if provided
    const validPriorities = ['URGENT', 'HIGH', 'NORMAL', 'LOW'];
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid priority. Must be one of: URGENT, HIGH, NORMAL, LOW"
      });
    }

    // Check if group and workspace exist
    const [group, workspace] = await Promise.all([
      prisma.group.findUnique({ 
        where: { id: parseInt(groupId) },
        include: { workspace: true }
      }),
      prisma.workspace.findUnique({ where: { id: parseInt(workspaceId) } })
    ]);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found"
      });
    }

    // Ensure group belongs to the workspace
    if (group.workspaceId !== parseInt(workspaceId)) {
      return res.status(400).json({
        success: false,
        message: "Group does not belong to the specified workspace"
      });
    }

    // Check if creator exists (if provided)
    if (createdById) {
      const creator = await prisma.user.findUnique({ where: { id: parseInt(createdById) } });
      if (!creator) {
        return res.status(404).json({
          success: false,
          message: "Creator user not found"
        });
      }
    }

    // Create task
    const task = await prisma.task.create({
      data: {
        name: name.trim(),
        description: description || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || 'NORMAL',
        groupId: parseInt(groupId),
        workspaceId: parseInt(workspaceId),
        createdById: createdById ? parseInt(createdById) : null
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        workspace: {
          select: {
            id: true,
            name: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            assignments: true
          }
        }
      }
    });

    // Create assignments if provided
    if (assigneeIds && Array.isArray(assigneeIds) && assigneeIds.length > 0) {
      await prisma.taskAssignment.createMany({
        data: assigneeIds.map(userId => ({
          taskId: task.id,
          userId: parseInt(userId),
          role: 'ASSIGNEE'
        })),
        skipDuplicates: true
      });

      // Fetch updated task with assignments
      const updatedTask = await prisma.task.findUnique({
        where: { id: task.id },
        include: {
          group: { select: { id: true, name: true, color: true } },
          workspace: { select: { id: true, name: true } },
          createdBy: { select: { id: true, name: true, email: true } },
          assignments: {
            include: {
              user: { select: { id: true, name: true, email: true } }
            }
          }
        }
      });

      return res.status(201).json({
        success: true,
        message: "Task created successfully",
        data: updatedTask
      });
    }

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task
    });

  } catch (error) {
    console.error("Error creating task:", error);

    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: "Task with this name already exists"
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get all tasks (with optional filters)
export const getTasks = async (req, res) => {
  try {
    const { workspaceId, groupId, priority, createdById, assigneeId, page = 1, limit = 10 } = req.query;

    // Build where condition
    const whereCondition = {};
    
    if (workspaceId) {
      const workspaceIdNum = parseInt(workspaceId);
      if (isNaN(workspaceIdNum)) {
        return res.status(400).json({
          success: false,
          message: "Invalid workspace ID"
        });
      }
      whereCondition.workspaceId = workspaceIdNum;
    }

    if (groupId) {
      const groupIdNum = parseInt(groupId);
      if (isNaN(groupIdNum)) {
        return res.status(400).json({
          success: false,
          message: "Invalid group ID"
        });
      }
      whereCondition.groupId = groupIdNum;
    }

    if (priority) {
      whereCondition.priority = priority;
    }

    if (createdById) {
      whereCondition.createdById = parseInt(createdById);
    }

    if (assigneeId) {
      whereCondition.assignments = {
        some: {
          userId: parseInt(assigneeId)
        }
      };
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [tasks, totalCount] = await Promise.all([
      prisma.task.findMany({
        where: whereCondition,
        include: {
          group: {
            select: {
              id: true,
              name: true,
              color: true
            }
          },
          workspace: {
            select: {
              id: true,
              name: true
            }
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          assignments: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          _count: {
            select: {
              assignments: true
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: skip,
        take: limitNum
      }),
      prisma.task.count({ where: whereCondition })
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      success: true,
      data: tasks,
      pagination: {
        currentPage: pageNum,
        totalPages: totalPages,
        totalItems: totalCount,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1
      }
    });

  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get tasks by workspace
export const getTasksByWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const workspaceIdNum = parseInt(workspaceId);

    if (isNaN(workspaceIdNum)) {
      return res.status(400).json({
        success: false,
        message: "Invalid workspace ID"
      });
    }

    const tasks = await prisma.task.findMany({
      where: { workspaceId: workspaceIdNum },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.json({
      success: true,
      data: tasks,
      count: tasks.length
    });

  } catch (error) {
    console.error("Error fetching workspace tasks:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get tasks by group
export const getTasksByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const groupIdNum = parseInt(groupId);

    if (isNaN(groupIdNum)) {
      return res.status(400).json({
        success: false,
        message: "Invalid group ID"
      });
    }

    const tasks = await prisma.task.findMany({
      where: { groupId: groupIdNum },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        workspace: {
          select: {
            id: true,
            name: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.json({
      success: true,
      data: tasks,
      count: tasks.length
    });

  } catch (error) {
    console.error("Error fetching group tasks:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get single task by ID
export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const taskId = parseInt(id);

    if (isNaN(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID"
      });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        workspace: {
          select: {
            id: true,
            name: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    res.json({
      success: true,
      data: task
    });

  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Update task
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const taskId = parseInt(id);

    if (isNaN(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID"
      });
    }

    const { name, description, dueDate, priority, groupId } = req.body;

    // Validate name if provided
    if (name !== undefined && (!name || name.trim().length === 0)) {
      return res.status(400).json({
        success: false,
        message: "Task name cannot be empty"
      });
    }

    // Validate priority if provided
    const validPriorities = ['URGENT', 'HIGH', 'NORMAL', 'LOW'];
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid priority. Must be one of: URGENT, HIGH, NORMAL, LOW"
      });
    }

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    // Check if group exists and belongs to the same workspace (if groupId provided)
    if (groupId) {
      const group = await prisma.group.findUnique({
        where: { id: parseInt(groupId) }
      });

      if (!group) {
        return res.status(404).json({
          success: false,
          message: "Group not found"
        });
      }

      if (group.workspaceId !== existingTask.workspaceId) {
        return res.status(400).json({
          success: false,
          message: "Group does not belong to the same workspace as the task"
        });
      }
    }

    // Build update data
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (priority !== undefined) updateData.priority = priority;
    if (groupId !== undefined) updateData.groupId = parseInt(groupId);

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        group: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        workspace: {
          select: {
            id: true,
            name: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      message: "Task updated successfully",
      data: updatedTask
    });

  } catch (error) {
    console.error("Error updating task:", error);

    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: "Task with this name already exists"
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Delete task
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const taskId = parseInt(id);

    if (isNaN(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID"
      });
    }

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        _count: {
          select: {
            assignments: true
          }
        }
      }
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    // Delete task (assignments will be deleted automatically due to cascade)
    await prisma.task.delete({
      where: { id: taskId }
    });

    res.json({
      success: true,
      message: "Task deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting task:", error);
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
      prisma.task.findUnique({ 
        where: { id: parseInt(taskId) },
        include: { workspace: true }
      }),
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

    // Ensure group belongs to the same workspace as the task
    if (group.workspaceId !== task.workspaceId) {
      return res.status(400).json({
        success: false,
        message: "Cannot move task to a group in a different workspace"
      });
    }

    const updatedTask = await prisma.task.update({
      where: { id: parseInt(taskId) },
      data: { groupId: parseInt(targetGroupId) },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        workspace: {
          select: {
            id: true,
            name: true
          }
        },
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
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

// Assign users to task
export const assignUsersToTask = async (req, res) => {
  try {
    const { id } = req.params;
    const taskId = parseInt(id);
    const { userIds, role = 'ASSIGNEE' } = req.body;

    if (isNaN(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID"
      });
    }

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "User IDs array is required"
      });
    }

    // Validate role
    const validRoles = ['ASSIGNEE', 'REVIEWER', 'WATCHER', 'COLLABORATOR'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be one of: ASSIGNEE, REVIEWER, WATCHER, COLLABORATOR"
      });
    }

    // Check if task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    // Create assignments
    await prisma.taskAssignment.createMany({
      data: userIds.map(userId => ({
        taskId: taskId,
        userId: parseInt(userId),
        role: role
      })),
      skipDuplicates: true
    });

    // Fetch updated task with assignments
    const updatedTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      message: "Users assigned to task successfully",
      data: updatedTask
    });

  } catch (error) {
    console.error("Error assigning users to task:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Remove user assignment from task
export const removeUserFromTask = async (req, res) => {
  try {
    const { taskId, userId } = req.body;

    if (!taskId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Task ID and User ID are required"
      });
    }

    await prisma.taskAssignment.deleteMany({
      where: {
        taskId: parseInt(taskId),
        userId: parseInt(userId)
      }
    });

    res.json({
      success: true,
      message: "User removed from task successfully"
    });

  } catch (error) {
    console.error("Error removing user from task:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};