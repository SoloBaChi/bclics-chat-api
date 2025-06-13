import express from "express";
import http from "http";
import { Server } from "socket.io";
import Message from "../models/MessageModel.js";
import Conversation from "../models/conversationModel.js";
import Notification from "../models/notificationModel.js";
import User from "../models/userModel.js";

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

   // ✅ Emit all notifications for connected user
    emitUserNotifications(userId);

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


    // ✅ Mark notification as read
  // ======================
  socket.on("markNotificationAsRead", async ({ notificationId }) => {
    try {
      await Notification.findByIdAndUpdate(notificationId, { isRead: true });
      if (userId) emitUserNotifications(userId); // Emit updated list
    } catch (err) {
      console.error("❌ Error marking notification as read:", err);
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





    // ✅ Listen for deleteNotification
    socket.on("deleteNotification", async ({ notificationId }) => {
      try {
        await Notification.findByIdAndDelete(notificationId);
        if (userId) emitUserNotifications(userId);
      } catch (err) {
        console.error("❌ Error deleting notification:", err);
      }
    });

  // Helper: Emit all notifications to the user
  async function emitUserNotifications(userId) {
    try {
      const notifications = await Notification.find({ recipientId:userId })
      .populate("senderId", "userName name profileImage")
      .sort({ createdAt: -1 })
      
      const unreadCount = notifications.filter(n => !n.isRead).length;
      const socketId = userSocketMap[userId];
      if (socketId) {
        io.to(socketId).emit("allNotifications", {
          notifications,
          unreadCount
        });
      }
    } catch (err) {
      console.error("❌ Error fetching notifications:", err);
    }
  }
  
});

// Export for usage elsewhere
export { io, server, app };
