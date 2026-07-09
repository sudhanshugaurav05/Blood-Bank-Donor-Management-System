import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import { checkDonorEligibility } from "../utils/eligibilityChecker.js";
import { sendPasswordResetEmail } from "../utils/sendMail.js";

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const isValidProofDocument = (document = {}) => {
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
  ];

  if (!document.fileName || !document.fileType || !document.fileData) {
    return false;
  }

  return allowedTypes.includes(document.fileType);
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

      // patient verification fields
      hospitalName,
      hospitalContactNumber,
      emergencyContact,
      patientProofDocument,

      // donor eligibility fields
      weight,
      hemoglobin,
      donationType,
      lastDonationDate,
      permanentRestrictions,
      temporaryRestrictions,
      lifestyleRestrictions,
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

    if (!["donor", "patient"].includes(role)) {
      return res.status(400).json({
        message: "Role must be donor or patient.",
      });
    }

    if (role === "patient") {
      if (!hospitalName || !hospitalContactNumber) {
        return res.status(400).json({
          message:
            "Hospital name and hospital contact number are required for patient registration.",
        });
      }

      if (!isValidProofDocument(patientProofDocument)) {
        return res.status(400).json({
          message:
            "Please upload a valid proof document. Allowed files: PDF, JPG, JPEG, PNG.",
        });
      }
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(409).json({ message: "Email already registered." });
    }

    let eligibility = {
      isEligible: true,
      status: "Eligible",
      reasons: [],
    };

    if (role === "donor") {
      eligibility = checkDonorEligibility({
        age,
        weight,
        hemoglobin,
        donationType,
        lastDonationDate,
        permanentRestrictions,
        temporaryRestrictions,
        lifestyleRestrictions,
      });

      if (!eligibility.isEligible) {
        return res.status(400).json({
          message: "Donor is not eligible to donate blood.",
          eligibility,
        });
      }
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

    const userPayload = {
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
      emergencyContact,
      avatarColor,

      isAvailable: role === "donor",

      // donor data
      weight,
      hemoglobin,
      donationType,
      lastDonationDate,
      permanentRestrictions,
      temporaryRestrictions,
      lifestyleRestrictions,
      eligibility,
    };

    if (role === "patient") {
      userPayload.hospitalName = hospitalName;
      userPayload.hospitalContactNumber = hospitalContactNumber;
      userPayload.patientProofDocument = {
        fileName: patientProofDocument.fileName,
        fileType: patientProofDocument.fileType,
        fileData: patientProofDocument.fileData,
        uploadedAt: new Date(),
      };
      userPayload.isVerifiedPatient = false;
      userPayload.patientVerificationNote =
        "Patient proof document uploaded. Waiting for admin verification.";
    }

    const user = await User.create(userPayload);

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

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Username/Email and password are required." });
    }

    const loginValue = email.toLowerCase().trim();

    const user = await User.findOne({
      $or: [{ email: loginValue }, { username: loginValue }],
    }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res
        .status(401)
        .json({ message: "Invalid username/email or password." });
    }

    return res.json({
      token: generateToken(user._id),
      user: user.toSafeObject(),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Login failed." });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.json({
        message:
          "If this email is registered, a password reset link has been sent.",
      });
    }

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const clientUrl = (
      process.env.CLIENT_URL ||
      "http://localhost:5173/Blood-Bank-Donor-Management-System"
    ).replace(/\/$/, "");

    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    try {
      await sendPasswordResetEmail({
        userEmail: user.email,
        userName: user.name,
        resetUrl,
      });
    } catch (mailError) {
      console.log("Password reset email failed:", mailError.message);

      return res.status(500).json({
        message: "Could not send password reset email.",
      });
    }

    return res.json({
      message:
        "If this email is registered, a password reset link has been sent.",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Forgot password failed.",
    });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters.",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    } catch (tokenError) {
      return res.status(400).json({
        message: "Reset link is invalid or expired.",
      });
    }

    const user = await User.findById(decoded.id).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.password = password;
    await user.save();

    return res.json({
      message: "Password reset successfully. Please login with new password.",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Password reset failed.",
    });
  }
});

router.get("/me", protect, async (req, res) => {
  return res.json({ user: req.user });
});

router.get("/profile-cards", protect, async (req, res) => {
  try {
    const users = await User.find({
      role: { $in: ["donor", "patient"] },
    })
      .select(
        "name bloodGroup role city avatarColor isVerifiedDonor isVerifiedPatient"
      )
      .sort({ createdAt: -1 });

    const cards = users.map((item) => ({
      _id: item._id,
      name: item.name,
      bloodGroup: item.bloodGroup,
      role: item.role,
      city: item.city,
      avatarColor: item.avatarColor,
      isVerifiedDonor: item.isVerifiedDonor,
      isVerifiedPatient: item.isVerifiedPatient,
      isMe: item._id.toString() === req.user._id.toString(),
    }));

    return res.json({ cards });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to fetch profile cards.",
    });
  }
});

export default router;