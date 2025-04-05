import express from "express";
import http from "http";
import { Server } from "socket.io";
import Message from "../models/MessageModel.js";
import Conversation from "../models/conversationModel.js";

// Create express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Create Socket.IO server
const io =  new Server(server, {
    cors:{
        origin:["http://localhost:5175",["https://bclicscom.vercel.app"],"https://www.bclics.com"],
        methods:["GET","POST"]
    }
});

// Hash map to store userId -> socketId
const userSocketMap = {};

// Utility function to get recipient's socket ID
export const getRecipientSocketId = (recipientId) => {
  return userSocketMap[recipientId];
};

// Socket connection handler
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  console.log("🔌 User connected:", socket.id, "| userId:", userId);

  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
    // Broadcast updated online users list
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  }

  // Mark messages as seen
  socket.on("markMessagesAsSeen", async ({ conversationId, userId }) => {
    try {
      await Message.updateMany(
        { conversationId, seen: false },
        { $set: { seen: true } }
      );

      await Conversation.updateOne(
        { _id: conversationId },
        { $set: { "lastMessage.seen": true } }
      );

      const recipientSocketId = userSocketMap[userId];
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("messagesSeen", { conversationId });
      }
    } catch (err) {
      console.error("❌ Error marking messages as seen:", err);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);

    if (userId && userSocketMap[userId]) {
      delete userSocketMap[userId];
    }

    // Broadcast updated online users list
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Export for usage elsewhere
export { io, server, app };
