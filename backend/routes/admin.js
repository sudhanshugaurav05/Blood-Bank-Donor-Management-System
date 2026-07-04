import express from "express";
import User from "../models/User.js";
import BloodRequest from "../models/BloodRequest.js";
import SupportMessage from "../models/SupportMessage.js";
import { protect, allowRoles } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.use(allowRoles("admin"));

router.get("/donors", async (req, res) => {
  const donors = await User.find({ role: "donor" }).select("-password").sort({ createdAt: -1 });
  res.json({ donors });
});

router.get("/patients", async (req, res) => {
  const patients = await User.find({ role: "patient" }).select("-password").sort({ createdAt: -1 });
  res.json({ patients });
});

router.get("/requests", async (req, res) => {
  const requests = await BloodRequest.find().sort({ createdAt: -1 });
  res.json({ requests });
});

router.get("/queries", async (req, res) => {
  const queries = await SupportMessage.find().sort({ createdAt: -1 });
  res.json({ queries });
});

router.post("/users", async (req, res) => {
  try {
    const { role, name, email, password, phone, bloodGroup, city, address, age, gender } = req.body;

    if (!["donor", "patient"].includes(role)) {
      return res.status(400).json({ message: "Admin can add only donor or patient." });
    }

    if (!name || !email || !password || !phone || !bloodGroup || !city) {
      return res.status(400).json({ message: "Please fill required fields." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });

    if (existingUser) {
      return res.status(409).json({ message: "Email already registered." });
    }

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
      isAvailable: role === "donor",
    });

    res.status(201).json({ user: user.toSafeObject() });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to add user." });
  }
});

router.put("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.role === "admin") {
      return res.status(403).json({ message: "Admin account cannot be edited here." });
    }

    const allowedFields = [
      "role",
      "name",
      "email",
      "phone",
      "bloodGroup",
      "city",
      "address",
      "age",
      "gender",
      "isAvailable",
      "hospitalName",
      "emergencyContact",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    if (req.body.password) {
      user.password = req.body.password;
    }

    await user.save();

    res.json({ user: user.toSafeObject() });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to update user." });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.role === "admin") {
      return res.status(403).json({ message: "Admin account cannot be deleted." });
    }

    await user.deleteOne();

    res.json({ message: "User deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to delete user." });
  }
});

router.put("/requests/:id", async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Blood request not found." });
    }

    if (req.body.isOpen !== undefined) {
      request.isOpen = req.body.isOpen;
    }

    if (req.body.urgency) {
      request.urgency = req.body.urgency;
    }

    await request.save();

    res.json({ request });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to update request." });
  }
});

router.delete("/requests/:id", async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Blood request not found." });
    }

    await request.deleteOne();

    res.json({ message: "Blood request deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to delete request." });
  }
});

router.put("/queries/:id", async (req, res) => {
  try {
    const query = await SupportMessage.findById(req.params.id);

    if (!query) {
      return res.status(404).json({ message: "Query not found." });
    }

    query.status = req.body.status || query.status;

    await query.save();

    res.json({ query });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to update query." });
  }
});

router.delete("/queries/:id", async (req, res) => {
  try {
    const query = await SupportMessage.findById(req.params.id);

    if (!query) {
      return res.status(404).json({ message: "Query not found." });
    }

    await query.deleteOne();

    res.json({ message: "Query deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to delete query." });
  }
});

export default router;