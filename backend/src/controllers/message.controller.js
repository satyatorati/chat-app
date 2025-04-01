import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import axios from "axios";
import { checkAndUpdateUsage } from "../utils/usageTracker.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    
    // Get all users except the logged-in user
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
    
    // Get the last message for each user
    const usersWithLastMessage = await Promise.all(
      filteredUsers.map(async (user) => {
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: loggedInUserId, receiverId: user._id },
            { senderId: user._id, receiverId: loggedInUserId }
          ]
        }).sort({ createdAt: -1 });
        
        return {
          ...user.toObject(),
          lastMessage: lastMessage ? lastMessage.createdAt : null
        };
      })
    );
    
    // Sort users by last message timestamp (most recent first)
    const sortedUsers = usersWithLastMessage.sort((a, b) => {
      if (!a.lastMessage && !b.lastMessage) return 0;
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return b.lastMessage - a.lastMessage;
    });

    res.status(200).json(sortedUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

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

export const translateMessage = async (req, res) => {
  try {
    const { text, targetLang } = req.body;

    if (!text || !targetLang) {
      return res.status(400).json({ error: "Text and target language are required" });
    }

    if (!process.env.GOOGLE_TRANSLATE_API_KEY) {
      console.error("Google Translate API key is not configured");
      return res.status(500).json({ error: "Translation service is not configured" });
    }

    // Check usage limits
    const usageCheck = checkAndUpdateUsage(text.length);
    if (!usageCheck.allowed) {
      return res.status(429).json({ 
        error: "Translation limit reached for this month",
        remaining: usageCheck.remaining
      });
    }

    const response = await axios.post(
      `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_TRANSLATE_API_KEY}`,
      {
        q: text,
        target: targetLang,
        format: 'text'
      }
    );

    const translatedText = response.data.data.translations[0].translatedText;
    res.status(200).json({ 
      translatedText,
      remaining: usageCheck.remaining
    });
  } catch (error) {
    console.error("Error in translateMessage controller: ", error.message);
    if (error.response) {
      console.error("API Error:", error.response.data);
    }
    res.status(500).json({ error: "Internal server error" });
  }
};
