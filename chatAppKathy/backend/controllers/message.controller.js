import mongoose from "mongoose";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

// Function to create a group chat
export const createGroupChat = async (req, res) => {
	try {
		const { participants, groupName } = req.body;
		const userId = req.user._id;

		// Validate participants are valid ObjectIds
		const validParticipants = participants.map((participant) => {
			if (!mongoose.Types.ObjectId.isValid(participant)) {
				throw new Error(`Invalid participant ID: ${participant}`);
			}
			return new mongoose.Types.ObjectId(participant);
		});

		// Include the current user in the participants list if not already included
		if (!validParticipants.includes(userId)) {
			validParticipants.push(userId);
		}

		// Create a new conversation
		const conversation = await Conversation.create({
			participants: validParticipants,
			isGroupChat: true,
			groupName,
		});

		// Respond with the created conversation
		res.status(201).json(conversation);
	} catch (error) {
		console.log("Error in createGroupChat controller: ", error.message);
		res.status(500).json({ error: "Internal server error", message: error.message });
	}
};

// Function to delete a chat
export const deleteChat = async (req, res) => {
	try {
		const { id: conversationId } = req.params;
		const userId = req.user._id;

		// Find and delete the conversation
		const conversation = await Conversation.findOneAndDelete({
			_id: conversationId,
			participants: userId,
		});

		// If conversation not found, respond with 404
		if (!conversation) {
			return res.status(404).json({ error: "Conversation not found" });
		}

		// Delete all messages associated with the conversation
		await Message.deleteMany({ _id: { $in: conversation.messages } });

		// Respond with success message
		res.status(200).json({ message: "Conversation deleted successfully" });
	} catch (error) {
		console.log("Error in deleteChat controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};


export const sendMessage = async (req, res) => {
	try {
		const { message } = req.body;
		const { id: receiverId } = req.params;
		const senderId = req.user._id;

		let conversation = await Conversation.findOne({
			participants: { $all: [senderId, receiverId] },
		});

		if (!conversation) {
			conversation = await Conversation.create({
				participants: [senderId, receiverId],
			});
		}

		const newMessage = new Message({
			senderId,
			receiverId,
			message,
		});

		if (newMessage) {
			conversation.messages.push(newMessage._id);
		}

		// this will run in parallel
		await Promise.all([conversation.save(), newMessage.save()]);

		const receiverSocketId = getReceiverSocketId(receiverId);
		if (receiverSocketId) {
			io.to(receiverSocketId).emit("newMessage", newMessage);
		}

		res.status(201).json(newMessage);
	} catch (error) {
		console.log("Error in sendMessage controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getMessages = async (req, res) => {
	try {
		const { id: userToChatId } = req.params;
		const senderId = req.user._id;

		const conversation = await Conversation.findOne({
			participants: { $all: [senderId, userToChatId] },
		}).populate("messages");

		if (!conversation) return res.status(200).json([]);

		const messages = conversation.messages;

		res.status(200).json(messages);
	} catch (error) {
		console.log("Error in getMessages controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

