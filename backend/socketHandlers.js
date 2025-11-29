import jwt from "jsonwebtoken";

/**
 * Socket.IO event handlers for real-time updates
 * Handles workspace rooms, task updates, and member presence
 */

export const setupSocketHandlers = (io) => {
    // Authentication middleware for Socket.IO
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error("Authentication error"));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            socket.userEmail = decoded.email;
            next();
        } catch (error) {
            next(new Error("Authentication error"));
        }
    });

    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.userId}`);

        // Join workspace room
        socket.on("join_workspace", (workspaceId) => {
            const room = `workspace_${workspaceId}`;
            socket.join(room);
            console.log(`User ${socket.userId} joined ${room}`);

            // Notify others in the workspace
            socket.to(room).emit("user_joined", {
                userId: socket.userId,
                userEmail: socket.userEmail,
                workspaceId,
            });
        });

        // Leave workspace room
        socket.on("leave_workspace", (workspaceId) => {
            const room = `workspace_${workspaceId}`;
            socket.leave(room);
            console.log(`User ${socket.userId} left ${room}`);

            socket.to(room).emit("user_left", {
                userId: socket.userId,
                workspaceId,
            });
        });

        // Join organization room
        socket.on("join_organization", (organizationId) => {
            const room = `organization_${organizationId}`;
            socket.join(room);
            console.log(`User ${socket.userId} joined ${room}`);
        });

        // Leave organization room
        socket.on("leave_organization", (organizationId) => {
            const room = `organization_${organizationId}`;
            socket.leave(room);
            console.log(`User ${socket.userId} left ${room}`);
        });

        // Join chat room
        socket.on("join_chat_room", (roomId) => {
            const room = `room_${roomId}`;
            socket.join(room);
            console.log(`User ${socket.userId} joined chat ${room}`);
        });

        // Leave chat room
        socket.on("leave_chat_room", (roomId) => {
            const room = `room_${roomId}`;
            socket.leave(room);
            console.log(`User ${socket.userId} left chat ${room}`);
        });

        // Handle disconnect
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.userId}`);
        });
    });
};

/**
 * Emit task update to workspace room
 */
export const emitTaskUpdate = (io, workspaceId, event, data) => {
    io.to(`workspace_${workspaceId}`).emit(event, data);
};

/**
 * Emit workspace update to organization room
 */
export const emitWorkspaceUpdate = (io, organizationId, event, data) => {
    io.to(`organization_${organizationId}`).emit(event, data);
};

/**
 * Emit organization update to organization room
 */
export const emitOrganizationUpdate = (io, organizationId, event, data) => {
    io.to(`organization_${organizationId}`).emit(event, data);
};

/**
 * Emit member update to workspace room
 */
export const emitMemberUpdate = (io, workspaceId, event, data) => {
    io.to(`workspace_${workspaceId}`).emit(event, data);
};
