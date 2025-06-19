import { Server } from "socket.io";
import http from "http";

// io instance
let io: Server;

let activeSockets: { [userId: string]: string } = {};

/**
 * Connects socket.io to the server and sets up the chat, and video call sockets also notification events.
 * @param server - The server to connect socket.io to.
 */
export const connectSocketIO = (server: http.Server) => {
    try {
        io = new Server(server, {
            cors: {
                origin: process.env.CLIENT_URL,
            },
        });

        io.on("connection", (socket) => {
            console.log("Socket-io connected with id", socket.id);

            // Get started
            socket.on("get-started", (phoneNumber: string) => {
                activeSockets[phoneNumber] = socket.id;
                console.log(phoneNumber + " get started with id " + socket.id);
            });

            // Refresh socket
            socket.on("refresh-socket", (phoneNumber: string) => {
                delete activeSockets[phoneNumber];
                console.log(phoneNumber + " refreshed socket");

                console.log(activeSockets);
            });
        });
    } catch (err: unknown) {
        console.log(err);
    }
};

// Export the socket.io instance
export const getIO = () => io;
export const getActiveSockets = () => activeSockets;
