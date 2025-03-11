import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173","https://chat-app-6nvc.onrender.com"],
    methods: ["GET", "POST"]
  },
});

// Function to get the socket ID of a receiver
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// Store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  // Broadcast updated online users list
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle new message event
  socket.on("newMessage", ({ senderId, receiverId, message }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      // Send the new message directly to the receiver
      io.to(receiverSocketId).emit("newMessage", {
        senderId,
        message,
      });
    } else {
      console.log(`User ${receiverId} is offline. Unread count should increase.`);
    }
  });

  // Mark messages as read when a user opens a chat
  socket.on("markAsRead", ({ userId, senderId }) => {
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesRead", { userId });
    }
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };