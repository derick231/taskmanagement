import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/* ======================================================
   CREATE BOARD
====================================================== */
export const createBoard = async (req, res) => {
    try {
        const { name, description, workspaceId } = req.body;
        const userId = req.user?.id;

        if (!name || !workspaceId) {
            return res.status(400).json({ error: "Name and workspace ID are required" });
        }

        // Verify workspace access
        const workspace = await prisma.workspace.findUnique({
            where: { id: Number(workspaceId) },
        });

        if (!workspace) {
            return res.status(404).json({ error: "Workspace not found" });
        }

        // Only manager can create boards
        if (workspace.managerId !== userId) {
            return res.status(403).json({ error: "Only workspace manager can create boards" });
        }

        const board = await prisma.board.create({
            data: {
                name,
                description,
                workspaceId: Number(workspaceId),
            },
            include: {
                tasks: true,
            },
        });

        res.status(201).json({ success: true, data: board });
    } catch (error) {
        console.error("Create Board Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

/* ======================================================
   GET BOARDS BY WORKSPACE
====================================================== */
export const getBoardsByWorkspace = async (req, res) => {
    try {
        const workspaceId = Number(req.params.workspaceId);

        const boards = await prisma.board.findMany({
            where: { workspaceId },
            include: {
                tasks: {
                    include: {
                        assignments: { include: { user: true } },
                        createdBy: true,
                    },
                },
            },
            orderBy: { position: "asc" },
        });

        res.json({ success: true, data: boards });
    } catch (error) {
        console.error("Get Boards Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

/* ======================================================
   GET BOARD BY ID
====================================================== */
export const getBoardById = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const board = await prisma.board.findUnique({
            where: { id },
            include: {
                tasks: {
                    include: {
                        assignments: { include: { user: true } },
                        createdBy: true,
                    },
                },
            },
        });

        if (!board) {
            return res.status(404).json({ error: "Board not found" });
        }

        res.json({ success: true, data: board });
    } catch (error) {
        console.error("Get Board Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

/* ======================================================
   UPDATE BOARD
====================================================== */
export const updateBoard = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name, description, position } = req.body;
        const userId = req.user?.id;

        const board = await prisma.board.findUnique({
            where: { id },
            include: { workspace: true },
        });

        if (!board) {
            return res.status(404).json({ error: "Board not found" });
        }

        // Only manager can update
        if (board.workspace.managerId !== userId) {
            return res.status(403).json({ error: "Only workspace manager can update boards" });
        }

        const updated = await prisma.board.update({
            where: { id },
            data: { name, description, position },
        });

        res.json({ success: true, data: updated });
    } catch (error) {
        console.error("Update Board Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

/* ======================================================
   DELETE BOARD
====================================================== */
export const deleteBoard = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const userId = req.user?.id;

        const board = await prisma.board.findUnique({
            where: { id },
            include: { workspace: true },
        });

        if (!board) {
            return res.status(404).json({ error: "Board not found" });
        }

        // Only manager can delete
        if (board.workspace.managerId !== userId) {
            return res.status(403).json({ error: "Only workspace manager can delete boards" });
        }

        await prisma.board.delete({
            where: { id },
        });

        res.json({ success: true, message: "Board deleted" });
    } catch (error) {
        console.error("Delete Board Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
