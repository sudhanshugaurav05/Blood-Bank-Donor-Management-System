import express from "express";
import BloodRequest from "../models/BloodRequest.js";
import { protect, allowRoles } from "../middleware/auth.js";
import User from "../models/User.js";
import { sendPatientDonorMatchEmail } from "../utils/sendMail.js";

const router = express.Router();

const escapeRegex = (text) => {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

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

    const normalizedBloodGroup = bloodGroup.trim().toUpperCase();
    const normalizedCity = city.trim();
    const cityRegex = new RegExp(`^${escapeRegex(normalizedCity)}$`, "i");

    const request = await BloodRequest.create({
      patient: req.user._id,
      patientName: req.user.name,
      bloodGroup: normalizedBloodGroup,
      units,
      city: normalizedCity,
      hospitalName,
      urgency,
      contactNumber,
      message,
    });

    const matchingDonors = await User.find({
      role: "donor",
      bloodGroup: normalizedBloodGroup,
      city: cityRegex,
      isAvailable: true,
      $or: [
        { "eligibility.isEligible": true },
        { eligibility: { $exists: false } },
        { "eligibility.isEligible": { $exists: false } },
      ],
    })
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(5);

    console.log("Patient email:", req.user.email);
    console.log("Requested blood group:", normalizedBloodGroup);
    console.log("Requested city:", normalizedCity);
    console.log("Matching donors found:", matchingDonors.length);
    console.log("Email user exists:", Boolean(process.env.EMAIL_USER));
    console.log("Email pass exists:", Boolean(process.env.EMAIL_PASS));

    let emailSent = false;

    if (matchingDonors.length > 0) {
      try {
        await sendPatientDonorMatchEmail({
          patientEmail: req.user.email,
          bloodGroup: normalizedBloodGroup,
          donors: matchingDonors,
        });

        emailSent = true;
      } catch (mailError) {
        console.log("Mail sending failed:", mailError.message);
      }
    }

    return res.status(201).json({
      request,
      matchingDonorsCount: matchingDonors.length,
      emailSent,
      message:
        matchingDonors.length > 0
          ? emailSent
            ? "Blood request created. Matching donor details sent to your email."
            : "Blood request created. Matching donors found, but email could not be sent."
          : "Blood request created. No matching donor found right now.",
    });
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

    if (bloodGroup) {
      filter.bloodGroup = bloodGroup.trim().toUpperCase();
    }

    if (city) {
      filter.city = new RegExp(`^${escapeRegex(city.trim())}$`, "i");
    }

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

    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }

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