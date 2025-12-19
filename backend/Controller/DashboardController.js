
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id; // Assumes auth middleware populates req.user

        // 2. Get Team Members count
        // We will count distinct users in all ORGANIZATIONS the user is a member of.
        // This aligns with user expectation that "Team" = "Organization".

        const userOrgs = await prisma.organizationMember.findMany({
            where: { userId: userId },
            select: { organizationId: true }
        });

        const orgIds = userOrgs.map(o => o.organizationId);

        let teamMembers = 0;
        if (orgIds.length > 0) {
            const distinctMembers = await prisma.organizationMember.groupBy({
                by: ['userId'],
                where: {
                    organizationId: { in: orgIds },
                },
            });
            teamMembers = distinctMembers.length;
        }

        // 1. Get ALL Tasks in User's Workspaces
        // User expects to see project-level stats, matching the sidebar counts.
        const userWorkspaces = await prisma.workspaceMember.findMany({
            where: { userId: userId },
            select: { workspaceId: true }
        });
        const workspaceIds = userWorkspaces.map(w => w.workspaceId);

        const tasks = await prisma.task.findMany({
            where: {
                workspaceId: { in: workspaceIds }
            }
        });

        const totalTasks = tasks.length;
        const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;
        const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS").length;


        // 3. Get Recently Updated Tasks (in my workspaces)
        const recentTasksRaw = await prisma.task.findMany({
            where: {
                workspaceId: { in: workspaceIds }
            },
            orderBy: {
                updatedAt: 'desc'
            },
            take: 5
        });

        const recentTasks = recentTasksRaw.map(t => ({
            id: t.id,
            title: t.name,
            status: t.status,
            priority: t.priority,
            dueDate: t.dueDate,
        }));


        res.status(200).json({
            data: {
                stats: {
                    totalTasks,
                    completedTasks,
                    inProgressTasks,
                    teamMembers
                },
                recentTasks
            },
        });
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
