import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

// Create a new workspace
export const createWorkspace = async(req, res) => {
    try {
        const { name, tags, description } = req.body
        const createdBy = req.user?.id // Assuming user ID comes from auth middleware

        // Basic validation
        if (!name) {
            return res.status(400).json({ error: 'Workspace name is required' })
        }

        // Create workspace with default groups
        const workspace = await prisma.workspace.create({
            data: {
                name,
                tags,
                description,
                created_at: new Date(),
                // Create default groups
                group: {
                    create: [
                        {
                            name: 'TODO',
                            description: 'Tasks to be started',
                            createdAt: new Date()
                        },
                        {
                            name: 'IN PROGRESS',
                            description: 'Tasks currently being worked on',
                            createdAt: new Date()
                        },
                        {
                            name: 'COMPLETED',
                            description: 'Finished tasks',
                            createdAt: new Date()
                        }
                    ]
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                group: true,
                _count: {
                    select: {
                        user: true,
                        group: true,
                        task: true
                    }
                }
            }
        })

        // If user is authenticated, assign them to this workspace
        if (createdBy) {
            await prisma.user.update({
                where: { id: createdBy },
                data: { work_id: workspace.id }
            })
        }

        res.status(201).json({
            workspace, 
            message: "Workspace created successfully."
        })

    } catch (error) {
        console.error("Error creating workspace:", error)
        
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'User not found' })
        }
        
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Workspace name already exists' })
        }
        
        res.status(500).json({ error: 'Internal server error' })
    }
}

// Get all workspaces
export const getWorkspaces = async(req, res) => {
    try {
        const workspaces = await prisma.workspace.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                group: true,
                _count: {
                    select: {
                        user: true,
                        group: true,
                        task: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        })

        if (workspaces.length === 0) {
            return res.status(200).json({
                message: 'No workspaces found',
                data: []
            })
        }

        // Transform data to match frontend expectations
        const transformedWorkspaces = workspaces.map(workspace => ({
            id: workspace.id,
            name: workspace.name,
            description: workspace.description,
            tags: workspace.tags,
            created_at: workspace.created_at,
            task_count: workspace._count.task,
            member_count: workspace._count.user,
            group_count: workspace._count.group,
            groups: workspace.group,
            members: workspace.user
        }))

        res.json({
            data: transformedWorkspaces,
            count: transformedWorkspaces.length
        })

    } catch (error) {
        console.error("Error fetching workspaces:", error)
        res.status(500).json({ error: 'Internal server error' })
    }
}

// Get workspaces by user ID
export const getWorkspacesByUserId = async(req, res) => {
    try {
        const { userId } = req.params
        
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' })
        }

        // Find user first to get their workspace
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
            include: {
                workspace: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        },
                        group: {
                            orderBy: {
                                createdAt: 'asc'
                            }
                        },
                        _count: {
                            select: {
                                user: true,
                                group: true,
                                task: true
                            }
                        }
                    }
                }
            }
        })

        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        const workspaces = user.workspace ? [user.workspace] : []

        // Transform data to match frontend expectations
        const transformedWorkspaces = workspaces.map(workspace => ({
            id: workspace.id,
            name: workspace.name,
            description: workspace.description,
            tags: workspace.tags,
            created_at: workspace.created_at,
            task_count: workspace._count.task,
            member_count: workspace._count.user,
            group_count: workspace._count.group,
            groups: workspace.group,
            members: workspace.user,
            userRole: 'MEMBER' // Since schema doesn't have roles, default to MEMBER
        }))

        res.json({
            data: transformedWorkspaces,
            count: transformedWorkspaces.length,
            message: transformedWorkspaces.length === 0 ? 'No workspaces found for this user' : undefined
        })

    } catch (error) {
        console.error("Error fetching user workspaces:", error)
        res.status(500).json({ error: 'Internal server error' })
    }
}

// Get workspace by ID
export const getWorkspaceById = async(req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({ error: 'Workspace ID is required' })
        }

        const workspace = await prisma.workspace.findUnique({
            where: {
                id: parseInt(id)
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                group: {
                    include: {
                        task: {
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
                                },
                                createdBy: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'asc'
                    }
                },
                _count: {
                    select: {
                        user: true,
                        group: true,
                        task: true
                    }
                }
            }
        })

        if (!workspace) {
            return res.status(404).json({ error: 'Workspace not found' })
        }

        // Transform data to match frontend expectations
        const transformedWorkspace = {
            id: workspace.id,
            name: workspace.name,
            description: workspace.description,
            tags: workspace.tags,
            created_at: workspace.created_at,
            task_count: workspace._count.task,
            member_count: workspace._count.user,
            group_count: workspace._count.group,
            groups: workspace.group,
            members: workspace.user
        }

        res.json(transformedWorkspace)

    } catch (error) {
        console.error("Error fetching workspace:", error)
        res.status(500).json({ error: 'Internal server error' })
    }
}

// Update workspace
export const updateWorkspace = async(req, res) => {
    try {
        const { id } = req.params
        const { name, tags, description } = req.body
        const userId = req.user?.id

        if (!id) {
            return res.status(400).json({ error: 'Workspace ID is required' })
        }

        // Check if workspace exists
        const existingWorkspace = await prisma.workspace.findUnique({
            where: { id: parseInt(id) }
        })

        if (!existingWorkspace) {
            return res.status(404).json({ error: 'Workspace not found' })
        }

        // For now, allow any authenticated user to update workspace
        // You can add more specific permission logic here if needed

        const workspace = await prisma.workspace.update({
            where: {
                id: parseInt(id)
            },
            data: {
                name,
                tags,
                description
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                group: true,
                _count: {
                    select: {
                        user: true,
                        group: true,
                        task: true
                    }
                }
            }
        })

        res.json({
            workspace,
            message: "Workspace updated successfully."
        })

    } catch (error) {
        console.error("Error updating workspace:", error)
        
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Workspace not found' })
        }
        
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Workspace name already exists' })
        }
        
        res.status(500).json({ error: 'Internal server error' })
    }
}

// Delete workspace
export const deleteWorkspace = async(req, res) => {
    try {
        const { id } = req.params
        const userId = req.user?.id

        if (!id) {
            return res.status(400).json({ error: 'Workspace ID is required' })
        }

        // Check if workspace exists
        const existingWorkspace = await prisma.workspace.findUnique({
            where: { id: parseInt(id) }
        })

        if (!existingWorkspace) {
            return res.status(404).json({ error: 'Workspace not found' })
        }

        // Remove users from this workspace first
        await prisma.user.updateMany({
            where: { work_id: parseInt(id) },
            data: { work_id: null }
        })

        // Delete workspace (cascade will handle related records)
        await prisma.workspace.delete({
            where: {
                id: parseInt(id)
            }
        })

        res.json({
            message: "Workspace deleted successfully."
        })

    } catch (error) {
        console.error("Error deleting workspace:", error)
        
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Workspace not found' })
        }
        
        res.status(500).json({ error: 'Internal server error' })
    }
}

// Add member to workspace
export const addWorkspaceMember = async(req, res) => {
    try {
        const { id } = req.params
        const { userId } = req.body
        const requestingUserId = req.user?.id

        if (!id || !userId) {
            return res.status(400).json({ error: 'Workspace ID and User ID are required' })
        }

        // Check if workspace exists
        const workspace = await prisma.workspace.findUnique({
            where: { id: parseInt(id) }
        })

        if (!workspace) {
            return res.status(404).json({ error: 'Workspace not found' })
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) }
        })

        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        // Check if user is already in a workspace
        if (user.work_id) {
            return res.status(409).json({ error: 'User is already a member of another workspace' })
        }

        // Add user to workspace
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(userId) },
            data: { work_id: parseInt(id) },
            select: {
                id: true,
                name: true,
                email: true,
                work_id: true
            }
        })

        res.status(201).json({
            member: updatedUser,
            message: "Member added successfully."
        })

    } catch (error) {
        console.error("Error adding workspace member:", error)
        res.status(500).json({ error: 'Internal server error' })
    }
}

// Remove member from workspace
export const removeWorkspaceMember = async(req, res) => {
    try {
        const { id, userId } = req.params
        const requestingUserId = req.user?.id

        if (!id || !userId) {
            return res.status(400).json({ error: 'Workspace ID and User ID are required' })
        }

        // Check if user exists and is in this workspace
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) }
        })

        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        if (user.work_id !== parseInt(id)) {
            return res.status(404).json({ error: 'User is not a member of this workspace' })
        }

        // Remove user from workspace
        await prisma.user.update({
            where: { id: parseInt(userId) },
            data: { work_id: null }
        })

        res.json({
            message: "Member removed successfully."
        })

    } catch (error) {
        console.error("Error removing workspace member:", error)
        res.status(500).json({ error: 'Internal server error' })
    }
}

// Update member role (placeholder function since schema doesn't have roles)
export const updateMemberRole = async(req, res) => {
    try {
        const { id, userId } = req.params
        const { role } = req.body

        // Since the schema doesn't have roles, this is a placeholder
        res.json({
            message: "Role update not supported in current schema. User roles are not implemented."
        })

    } catch (error) {
        console.error("Error updating member role:", error)
        res.status(500).json({ error: 'Internal server error' })
    }
}