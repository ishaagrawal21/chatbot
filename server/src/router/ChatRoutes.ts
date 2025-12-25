import express from "express";
import { getAllChats, getChatById, closeChat, getAllMessages, toggleAI } from "../controller/chat.controller";
import auth from "../middleware/auth";

const router = express.Router();

router.get("/", auth, getAllChats);
router.get("/messages/all", auth, getAllMessages);
router.get("/:id", auth, getChatById);
router.put("/:id/close", auth, closeChat);
router.put("/:id/toggle-ai", auth, toggleAI);

export default router;

