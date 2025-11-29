import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Create a new organization
export const createOrganization = async (req, res) => {
    try {
        const { name, description, slug } = req.body;
        const userId = req.user?.id; // Assuming auth middleware sets req.user

        if (!name || !slug) {
            return res.status(400).json({ error: "Name and slug are required" });
        }

        // Check if slug is already taken
        const existing = await prisma.organization.findUnique({
            where: { slug },
        });

        if (existing) {
            return res.status(400).json({ error: "Slug already taken" });
        }

        // Create organization with user as owner
        const organization = await prisma.organization.create({
            data: {
                name,
                description,
                slug,
                ownerId: userId,
                members: {
                    create: {
                        userId,
                        role: "OWNER",
                    },
                },
            },
            include: {
                owner: {
                    select: { id: true, name: true, email: true },
                },
                members: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true },
                        },
                    },
                },
            },
        });

        res.status(201).json(organization);
    } catch (error) {
        console.error("Error creating organization:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get all organizations for the current user
export const getUserOrganizations = async (req, res) => {
    try {
        const userId = req.user?.id;

        const organizations = await prisma.organization.findMany({
            where: {
                OR: [
                    { ownerId: userId },
                    {
                        members: {
                            some: { userId },
                        },
                    },
                ],
            },
            include: {
                owner: {
                    select: { id: true, name: true, email: true },
                },
                members: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true },
                        },
                    },
                },
                workspaces: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                _count: {
                    select: {
                        members: true,
                        workspaces: true,
                    },
                },
            },
        });

        res.json(organizations);
    } catch (error) {
        console.error("Error fetching organizations:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get single organization by ID
export const getOrganization = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const organization = await prisma.organization.findUnique({
            where: { id: Number(id) },
            include: {
                owner: {
                    select: { id: true, name: true, email: true },
                },
                members: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true },
                        },
                    },
                },
                workspaces: {
                    include: {
                        manager: {
                            select: { id: true, name: true, email: true },
                        },
                        _count: {
                            select: {
                                members: true,
                                boards: true,
                                tasks: true,
                            },
                        },
                    },
                },
            },
        });

        if (!organization) {
            return res.status(404).json({ error: "Organization not found" });
        }

        // Check if user is a member
        const isMember =
            organization.ownerId === userId ||
            organization.members.some((m) => m.userId === userId);

        if (!isMember) {
            return res.status(403).json({ error: "Access denied" });
        }

        res.json(organization);
    } catch (error) {
        console.error("Error fetching organization:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Update organization
export const updateOrganization = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const userId = req.user?.id;

        const organization = await prisma.organization.findUnique({
            where: { id: Number(id) },
        });

        if (!organization) {
            return res.status(404).json({ error: "Organization not found" });
        }

        // Check if user is owner or admin
        const member = await prisma.organizationMember.findUnique({
            where: {
                organizationId_userId: {
                    organizationId: Number(id),
                    userId,
                },
            },
        });

        if (organization.ownerId !== userId && member?.role !== "ADMIN") {
            return res.status(403).json({ error: "Access denied" });
        }

        const updated = await prisma.organization.update({
            where: { id: Number(id) },
            data: {
                name: name || organization.name,
                description: description !== undefined ? description : organization.description,
            },
            include: {
                owner: {
                    select: { id: true, name: true, email: true },
                },
                members: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true },
                        },
                    },
                },
            },
        });

        res.json(updated);
    } catch (error) {
        console.error("Error updating organization:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Delete organization
export const deleteOrganization = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const organization = await prisma.organization.findUnique({
            where: { id: Number(id) },
        });

        if (!organization) {
            return res.status(404).json({ error: "Organization not found" });
        }

        // Only owner can delete
        if (organization.ownerId !== userId) {
            return res.status(403).json({ error: "Only owner can delete organization" });
        }

        await prisma.organization.delete({
            where: { id: Number(id) },
        });

        res.json({ message: "Organization deleted successfully" });
    } catch (error) {
        console.error("Error deleting organization:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Add member to organization
export const addOrganizationMember = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId: newUserId, role = "MEMBER" } = req.body;
        const userId = req.user?.id;

        const organization = await prisma.organization.findUnique({
            where: { id: Number(id) },
        });

        if (!organization) {
            return res.status(404).json({ error: "Organization not found" });
        }

        // Check if requester is owner or admin
        const requesterMember = await prisma.organizationMember.findUnique({
            where: {
                organizationId_userId: {
                    organizationId: Number(id),
                    userId,
                },
            },
        });

        if (organization.ownerId !== userId && requesterMember?.role !== "ADMIN") {
            return res.status(403).json({ error: "Access denied" });
        }

        // Check if user already exists
        const existing = await prisma.organizationMember.findUnique({
            where: {
                organizationId_userId: {
                    organizationId: Number(id),
                    userId: newUserId,
                },
            },
        });

        if (existing) {
            return res.status(400).json({ error: "User already a member" });
        }

        const member = await prisma.organizationMember.create({
            data: {
                organizationId: Number(id),
                userId: newUserId,
                role,
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true },
                },
            },
        });

        res.status(201).json(member);
    } catch (error) {
        console.error("Error adding member:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Remove member from organization
export const removeOrganizationMember = async (req, res) => {
    try {
        const { id, userId: memberUserId } = req.params;
        const userId = req.user?.id;

        const organization = await prisma.organization.findUnique({
            where: { id: Number(id) },
        });

        if (!organization) {
            return res.status(404).json({ error: "Organization not found" });
        }

        // Can't remove owner
        if (organization.ownerId === Number(memberUserId)) {
            return res.status(400).json({ error: "Cannot remove organization owner" });
        }

        // Check if requester is owner or admin
        const requesterMember = await prisma.organizationMember.findUnique({
            where: {
                organizationId_userId: {
                    organizationId: Number(id),
                    userId,
                },
            },
        });

        if (organization.ownerId !== userId && requesterMember?.role !== "ADMIN") {
            return res.status(403).json({ error: "Access denied" });
        }

        await prisma.organizationMember.delete({
            where: {
                organizationId_userId: {
                    organizationId: Number(id),
                    userId: Number(memberUserId),
                },
            },
        });

        res.json({ message: "Member removed successfully" });
    } catch (error) {
        console.error("Error removing member:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Update member role
export const updateMemberRole = async (req, res) => {
    try {
        const { id, userId: memberUserId } = req.params;
        const { role } = req.body;
        const userId = req.user?.id;

        const organization = await prisma.organization.findUnique({
            where: { id: Number(id) },
        });

        if (!organization) {
            return res.status(404).json({ error: "Organization not found" });
        }

        // Only owner can change roles
        if (organization.ownerId !== userId) {
            return res.status(403).json({ error: "Only owner can change roles" });
        }

        // Can't change owner's role
        if (organization.ownerId === Number(memberUserId)) {
            return res.status(400).json({ error: "Cannot change owner's role" });
        }

        const updated = await prisma.organizationMember.update({
            where: {
                organizationId_userId: {
                    organizationId: Number(id),
                    userId: Number(memberUserId),
                },
            },
            data: { role },
            include: {
                user: {
                    select: { id: true, name: true, email: true },
                },
            },
        });

        res.json(updated);
    } catch (error) {
        console.error("Error updating role:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
