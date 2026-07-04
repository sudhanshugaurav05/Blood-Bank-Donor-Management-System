import express from "express";
import User from "../models/User.js";
import { protect, allowRoles } from "../middleware/auth.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { bloodGroup, city } = req.query;

    const filter = {
      role: "donor",
      isAvailable: true,
    };

    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (city) filter.city = new RegExp(city, "i");

    const donors = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(30);

    return res.json({ donors });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Failed to fetch donors." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const donor = await User.findOne({
      _id: req.params.id,
      role: "donor",
    }).select("-password");
    if (!donor) return res.status(404).json({ message: "Donor not found." });
    return res.json({ donor });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Failed to fetch donor." });
  }
});

router.put(
  "/profile/update",
  protect,
  allowRoles("donor"),
  async (req, res) => {
    try {
      const allowedFields = [
        "name",
        "phone",
        "bloodGroup",
        "city",
        "address",
        "age",
        "gender",
        "isAvailable",
        "lastDonationDate",
        "emergencyContact",
      ];

      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) req.user[field] = req.body[field];
      });

      const updatedUser = await req.user.save();
      return res.json({ user: updatedUser });
    } catch (error) {
      return res
        .status(500)
        .json({ message: error.message || "Failed to update donor profile." });
    }
  },
);

export default router;
