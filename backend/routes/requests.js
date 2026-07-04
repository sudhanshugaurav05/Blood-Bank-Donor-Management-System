import express from "express";
import BloodRequest from "../models/BloodRequest.js";
import { protect, allowRoles } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, allowRoles("patient"), async (req, res) => {
  try {
    const {
      bloodGroup,
      units,
      city,
      hospitalName,
      urgency,
      contactNumber,
      message,
    } = req.body;

    if (!bloodGroup || !units || !city || !hospitalName || !contactNumber) {
      return res
        .status(400)
        .json({ message: "Please fill required request fields." });
    }

    const request = await BloodRequest.create({
      patient: req.user._id,
      patientName: req.user.name,
      bloodGroup,
      units,
      city,
      hospitalName,
      urgency,
      contactNumber,
      message,
    });

    return res.status(201).json({ request });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Failed to create blood request." });
  }
});

router.get("/", protect, async (req, res) => {
  try {
    const { bloodGroup, city } = req.query;
    const filter = { isOpen: true };
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (city) filter.city = new RegExp(city, "i");

    const requests = await BloodRequest.find(filter)
      .sort({ createdAt: -1 })
      .limit(30);
    return res.json({ requests });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Failed to fetch requests." });
  }
});

router.put("/:id/close", protect, allowRoles("patient"), async (req, res) => {
  try {
    const request = await BloodRequest.findOne({
      _id: req.params.id,
      patient: req.user._id,
    });
    if (!request)
      return res.status(404).json({ message: "Request not found." });

    request.isOpen = false;
    await request.save();
    return res.json({ request });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Failed to close request." });
  }
});

export default router;
