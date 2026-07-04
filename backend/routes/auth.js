import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

router.post("/register", async (req, res) => {
  try {
    const {
      role,
      name,
      email,
      password,
      phone,
      bloodGroup,
      city,
      address,
      age,
      gender,
      hospitalName,
      emergencyContact,
    } = req.body;

    if (
      !role ||
      !name ||
      !email ||
      !password ||
      !phone ||
      !bloodGroup ||
      !city
    ) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered." });
    }

    const colors = [
      "#ef4444",
      "#f97316",
      "#ec4899",
      "#8b5cf6",
      "#06b6d4",
      "#22c55e",
    ];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];

    const user = await User.create({
      role,
      name,
      email,
      password,
      phone,
      bloodGroup,
      city,
      address,
      age,
      gender,
      hospitalName,
      emergencyContact,
      avatarColor,
    });

    return res.status(201).json({
      token: generateToken(user._id),
      user: user.toSafeObject(),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Registration failed." });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Username/Email and password are required.' });
    }

    const loginValue = email.toLowerCase().trim();

    const user = await User.findOne({
      $or: [{ email: loginValue }, { username: loginValue }],
    }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid username/email or password.' });
    }

    return res.json({
      token: generateToken(user._id),
      user: user.toSafeObject(),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Login failed.' });
  }
});

router.get("/me", protect, async (req, res) => {
  return res.json({ user: req.user });
});

export default router;
