import express from "express";
import { getMessages, sendMessage, createGroupChat, deleteChat } from "../controllers/message.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);
router.post("/group", protectRoute, createGroupChat);
router.delete("/:id", protectRoute, deleteChat);

export default router;
