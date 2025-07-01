import { Server } from "socket.io";
import http from "http";
import { notificationSocket } from ".";

// io instance
let io: Server;

// Connect socket io
export const connectSocketIO = (server: http.Server) => {
    try {
        io = new Server(server, {
            cors: {
                origin: process.env.CLIENT_URL,
            },
        });

        io.on("connection", (socket) => {
            console.log("Socket-io connected with id", socket.id);

            // Notification socket
            notificationSocket(socket);
        });
    } catch (err: any) {
        console.log(err.message, "my message");
    }
};

// Export the socket.io instance
export const getIO = () => io;
