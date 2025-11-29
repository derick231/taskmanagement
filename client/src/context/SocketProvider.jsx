import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used within SocketProvider");
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) return;

        // Create socket connection
        const newSocket = io("http://localhost:3000", {
            auth: { token },
            autoConnect: true,
        });

        newSocket.on("connect", () => {
            console.log("Socket connected");
            setConnected(true);
        });

        newSocket.on("disconnect", () => {
            console.log("Socket disconnected");
            setConnected(false);
        });

        newSocket.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
            setConnected(false);
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    const joinWorkspace = (workspaceId) => {
        if (socket && connected) {
            socket.emit("join_workspace", workspaceId);
        }
    };

    const leaveWorkspace = (workspaceId) => {
        if (socket && connected) {
            socket.emit("leave_workspace", workspaceId);
        }
    };

    const joinOrganization = (organizationId) => {
        if (socket && connected) {
            socket.emit("join_organization", organizationId);
        }
    };

    const leaveOrganization = (organizationId) => {
        if (socket && connected) {
            socket.emit("leave_organization", organizationId);
        }
    };

    const value = {
        socket,
        connected,
        joinWorkspace,
        leaveWorkspace,
        joinOrganization,
        leaveOrganization,
    };

    return (
        <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
    );
};
