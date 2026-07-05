import express from "express";
import BloodCamp from "../models/BloodCamp.js";
import { protect, allowRoles } from "../middleware/auth.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const camps = await BloodCamp.find({
      isActive: true,
      date: { $gte: new Date() },
    }).sort({ date: 1 });

    return res.json({ camps });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to fetch blood camps.",
    });
  }
});

router.post("/:id/register", protect, allowRoles("donor"), async (req, res) => {
  try {
    const camp = await BloodCamp.findById(req.params.id);

    if (!camp) {
      return res.status(404).json({ message: "Blood camp not found." });
    }

    const alreadyRegistered = camp.registeredDonors.some(
      (item) => item.donor.toString() === req.user._id.toString()
    );

    if (alreadyRegistered) {
      return res.status(409).json({
        message: "You are already registered for this camp.",
      });
    }

    if (camp.registeredDonors.length >= camp.maxSlots) {
      return res.status(400).json({
        message: "Camp slots are full.",
      });
    }

    camp.registeredDonors.push({
      donor: req.user._id,
      registeredAt: new Date(),
    });

    await camp.save();

    return res.json({
      camp,
      message: "Registered for blood camp successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to register for camp.",
    });
  }
});

export default router;