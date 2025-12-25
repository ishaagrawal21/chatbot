import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDb from "./connection";
import AdminRoutes from "./router/AdminRoutes";
import ChatRoutes from "./router/ChatRoutes";
import Chat from "./model/ChatModel";
import Message from "./model/MessageModel";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

app.use("/api/admin", AdminRoutes);
app.use("/api/chats", ChatRoutes);

const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-chat", async (data: { sessionId?: string; userIp?: string; userAgent?: string }) => {
    let chat;
    
    const clientIp = socket.handshake.address || data.userIp || "unknown";
    const userAgent = data.userAgent || socket.handshake.headers["user-agent"] || "unknown";
    
    if (data.sessionId) {
      chat = await Chat.findOne({ sessionId: data.sessionId });
    }

    if (!chat) {
      const newSessionId = generateSessionId();
      chat = await Chat.create({
        sessionId: newSessionId,
        userIp: clientIp,
        userAgent: userAgent,
        status: "active",
        aiEnabled: true,
      });
      socket.emit("session-created", { sessionId: newSessionId });
    }

    socket.join(chat.sessionId);
    socket.data.chatId = chat._id.toString();
    socket.data.sessionId = chat.sessionId;

    const messages = await Message.find({ chatId: chat._id }).sort({ createdAt: 1 });
    socket.emit("chat-history", {
      messages: messages.map((msg) => ({
        id: msg._id.toString(),
        content: msg.content,
        sender: msg.sender,
        isAI: msg.isAI,
        createdAt: msg.createdAt,
      })),
    });
  });

  socket.on("send-message", async (data: { content: string }) => {
    if (!socket.data.chatId) return;

    const message = await Message.create({
      chatId: socket.data.chatId,
      content: data.content,
      sender: "user",
      isAI: false,
    });

    await Chat.findByIdAndUpdate(socket.data.chatId, { updatedAt: new Date() });

    const messageData = {
      id: message._id.toString(),
      content: message.content,
      sender: message.sender,
      isAI: message.isAI,
      createdAt: message.createdAt,
      chatId: socket.data.chatId,
    };

    io.to(socket.data.sessionId).emit("new-message", messageData);
    io.emit("admin-new-message", messageData);
    io.emit("chat-updated", { sessionId: socket.data.sessionId });
  });

  socket.on("admin-send-message", async (data: { chatId: string; content: string; isAI?: boolean }) => {
    const message = await Message.create({
      chatId: data.chatId,
      content: data.content,
      sender: data.isAI ? "ai" : "admin",
      isAI: data.isAI || false,
    });

    const chat = await Chat.findById(data.chatId);
    if (chat) {
      await Chat.findByIdAndUpdate(data.chatId, { updatedAt: new Date() });
      
      const messageData = {
        id: message._id.toString(),
        content: message.content,
        sender: message.sender,
        isAI: message.isAI,
        createdAt: message.createdAt,
        chatId: data.chatId,
      };

      io.to(chat.sessionId).emit("new-message", messageData);
      io.emit("admin-new-message", messageData);
      io.emit("chat-updated", { sessionId: chat.sessionId });
    }
  });

  socket.on("typing-start", (data: { sessionId: string; sender: string }) => {
    socket.to(data.sessionId).emit("typing-start", { sender: data.sender });
  });

  socket.on("typing-stop", (data: { sessionId: string; sender: string }) => {
    socket.to(data.sessionId).emit("typing-stop", { sender: data.sender });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

connectDb().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

