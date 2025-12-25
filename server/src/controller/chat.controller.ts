import { Response } from "express";
import Chat from "../model/ChatModel";
import Message from "../model/MessageModel";
import { AuthRequest } from "../middleware/auth";

export const getAllChats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const filter: any = {};
    if (status) {
      filter.status = status;
    }

    const chats = await Chat.find(filter).sort({ updatedAt: -1 });

    const chatsWithLastMessage = await Promise.all(
      chats.map(async (chat) => {
        const lastMessage = await Message.findOne({ chatId: chat._id })
          .sort({ createdAt: -1 })
          .limit(1);

        return {
          id: chat._id,
          sessionId: chat.sessionId,
          userIp: chat.userIp,
          userAgent: chat.userAgent,
          status: chat.status,
          aiEnabled: (chat as any).aiEnabled !== false,
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                sender: lastMessage.sender,
                createdAt: lastMessage.createdAt,
              }
            : null,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
        };
      })
    );

    res.status(200).json({
      message: "success",
      chats: chatsWithLastMessage,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getChatById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const chat = await Chat.findById(id);
    if (!chat) {
      res.status(404).json({ message: "Chat not found" });
      return;
    }

    const messages = await Message.find({ chatId: id }).sort({ createdAt: 1 });

    res.status(200).json({
      message: "success",
      chat: {
        id: chat._id,
        sessionId: chat.sessionId,
        userIp: chat.userIp,
        userAgent: chat.userAgent,
        status: chat.status,
        aiEnabled: chat.aiEnabled,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      },
      messages: messages.map((msg) => ({
        id: msg._id,
        content: msg.content,
        sender: msg.sender,
        isAI: msg.isAI,
        createdAt: msg.createdAt,
      })),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const closeChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const chat = await Chat.findByIdAndUpdate(id, { status: "closed" }, { new: true });

    if (!chat) {
      res.status(404).json({ message: "Chat not found" });
      return;
    }

    res.status(200).json({
      message: "Chat closed successfully",
      chat: {
        id: chat._id,
        status: chat.status,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const toggleAI = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { aiEnabled } = req.body;

    const updateData: any = { aiEnabled: aiEnabled === true };
    const chat = await Chat.findByIdAndUpdate(id, updateData, { new: true });

    if (!chat) {
      res.status(404).json({ message: "Chat not found" });
      return;
    }

    res.status(200).json({
      message: "AI toggle updated successfully",
      chat: {
        id: chat._id,
        aiEnabled: (chat as any).aiEnabled === true,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { chatId, sender } = req.query;
    const filter: any = {};

    if (chatId) {
      filter.chatId = chatId;
    }

    if (sender) {
      filter.sender = sender;
    }

    const messages = await Message.find(filter)
      .populate({
        path: "chatId",
        select: "sessionId userIp",
      })
      .sort({ createdAt: -1 })
      .limit(1000);

    res.status(200).json({
      message: "success",
      messages: messages.map((msg) => {
        const chat = msg.chatId as any;
        return {
          id: msg._id,
          content: msg.content,
          sender: msg.sender,
          isAI: msg.isAI,
          chatId: chat?._id || msg.chatId,
          sessionId: chat?.sessionId || "N/A",
          createdAt: msg.createdAt,
        };
      }),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

