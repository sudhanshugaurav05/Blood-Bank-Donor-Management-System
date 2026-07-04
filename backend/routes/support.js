import express from "express";
import SupportMessage from "../models/SupportMessage.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, async (req, res) => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res
        .status(400)
        .json({ message: "Subject and message are required." });
    }

    const supportMessage = await SupportMessage.create({
      user: req.user._id,
      name: req.user.name,
      email: req.user.email,
      subject,
      message,
    });

    return res.status(201).json({ supportMessage });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Failed to submit support message." });
  }
});

router.get("/my-messages", protect, async (req, res) => {
  try {
    const messages = await SupportMessage.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    return res.json({ messages });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Failed to load support messages." });
  }
});

export default router;
