import express from "express";
import BloodRequest from "../models/BloodRequest.js";
import { protect, allowRoles } from "../middleware/auth.js";
import {
  sendPatientDonorMatchEmail,
  sendPatientDonorAcceptedEmail,
  sendDonorNewBloodRequestEmail,
  sendDonorResponseConfirmationEmail,
  sendRequestStatusUpdateEmail,
} from "../utils/sendMail.js";
import { findBestMatchingDonors } from "../utils/matchingEngine.js";

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
      status: "pending",
    });

    const matchingDonors = await findBestMatchingDonors({
      bloodGroup: normalizedBloodGroup,
      city: normalizedCity,
      limit: 5,
    });

    if (matchingDonors.length > 0) {
      request.status = "donor_found";

      request.matchedDonors = matchingDonors.map((donor) => ({
        donor: donor._id,
        status: "pending",
        matchedAt: new Date(),
      }));

      await request.save();
    }

    console.log("Patient email:", req.user.email);
    console.log("Requested blood group:", normalizedBloodGroup);
    console.log("Requested city:", normalizedCity);
    console.log("Matching donors found:", matchingDonors.length);
    console.log("Email user exists:", Boolean(process.env.EMAIL_USER));
    console.log("Email pass exists:", Boolean(process.env.EMAIL_PASS));

    let patientEmailSent = false;
    let donorEmailsSent = 0;

    if (matchingDonors.length > 0) {
      try {
        await sendPatientDonorMatchEmail({
          patientEmail: req.user.email,
          bloodGroup: normalizedBloodGroup,
          donors: matchingDonors,
        });

        patientEmailSent = true;
      } catch (mailError) {
        console.log("Patient match mail failed:", mailError.message);
      }

      const donorMailResults = await Promise.allSettled(
        matchingDonors.map((donor) =>
          sendDonorNewBloodRequestEmail({
            donorEmail: donor.email,
            donorName: donor.name,
            request,
            patientName: req.user.name,
          })
        )
      );

      donorEmailsSent = donorMailResults.filter(
        (result) => result.status === "fulfilled"
      ).length;
    }

    return res.status(201).json({
      request,
      matchingDonorsCount: matchingDonors.length,
      emailSent: patientEmailSent,
      patientEmailSent,
      donorEmailsSent,
      message:
        matchingDonors.length > 0
          ? patientEmailSent
            ? "Blood request created. Matching donors found and emails sent."
            : "Blood request created. Matching donors found, but patient email could not be sent."
          : "Blood request created. No matching donor found right now.",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Failed to create blood request." });
  }
});

router.get(
  "/matched-for-me",
  protect,
  allowRoles("donor"),
  async (req, res) => {
    try {
      const requests = await BloodRequest.find({
        isOpen: true,
        "matchedDonors.donor": req.user._id,
      })
        .populate("patient", "name email phone")
        .populate(
          "matchedDonors.donor",
          "name email phone bloodGroup city isVerifiedDonor"
        )
        .sort({ createdAt: -1 });

      return res.json({ requests });
    } catch (error) {
      return res.status(500).json({
        message: error.message || "Failed to fetch matched requests.",
      });
    }
  }
);

router.get("/my", protect, allowRoles("patient"), async (req, res) => {
  try {
    const requests = await BloodRequest.find({
      patient: req.user._id,
    })
      .populate(
        "matchedDonors.donor",
        "name email phone bloodGroup city isVerifiedDonor"
      )
      .sort({ createdAt: -1 });

    return res.json({ requests });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to fetch your blood requests.",
    });
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
      .populate(
        "matchedDonors.donor",
        "name email phone bloodGroup city isVerifiedDonor"
      )
      .sort({ createdAt: -1 })
      .limit(30);

    return res.json({ requests });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Failed to fetch requests." });
  }
});

router.patch(
  "/:id/respond",
  protect,
  allowRoles("donor"),
  async (req, res) => {
    try {
      const { status } = req.body;

      if (!["accepted", "declined"].includes(status)) {
        return res.status(400).json({
          message: "Status must be accepted or declined.",
        });
      }

      if (status === "accepted" && !req.user.isVerifiedDonor) {
        return res.status(403).json({
          message:
            "Admin verification required. You can accept blood requests only after admin verifies your donor profile.",
        });
      }

      const request = await BloodRequest.findById(req.params.id).populate(
        "patient",
        "name email"
      );

      if (!request) {
        return res.status(404).json({ message: "Blood request not found." });
      }

      if (
        !request.isOpen ||
        request.status === "completed" ||
        request.status === "closed"
      ) {
        return res.status(400).json({
          message: "This blood request is already closed or completed.",
        });
      }

      const matchedDonor = request.matchedDonors.find(
        (item) => item.donor.toString() === req.user._id.toString()
      );

      if (!matchedDonor) {
        return res.status(403).json({
          message: "This request is not matched with you.",
        });
      }

      if (matchedDonor.status !== "pending") {
        return res.status(400).json({
          message:
            "You have already responded to this request. Please contact admin for any change.",
        });
      }

      matchedDonor.status = status;
      matchedDonor.respondedAt = new Date();

      if (status === "accepted") {
        request.status = "contacted";
      }

      await request.save();

      if (status === "accepted") {
        try {
          await sendPatientDonorAcceptedEmail({
            patientEmail: request.patient.email,
            bloodGroup: request.bloodGroup,
            donor: req.user,
            request,
          });
        } catch (mailError) {
          console.log("Patient accepted donor email failed:", mailError.message);
        }
      }

      if (status === "declined") {
        try {
          await sendRequestStatusUpdateEmail({
            recipients: [request.patient.email],
            request,
            status: "Donor Declined",
            note: `${req.user.name} declined the blood request.`,
          });
        } catch (mailError) {
          console.log("Patient declined donor email failed:", mailError.message);
        }
      }

      try {
        await sendDonorResponseConfirmationEmail({
          donorEmail: req.user.email,
          donorName: req.user.name,
          request,
          status,
        });
      } catch (mailError) {
        console.log(
          "Donor response confirmation email failed:",
          mailError.message
        );
      }

      return res.json({
        request,
        message:
          status === "accepted"
            ? "Request accepted. Patient has been notified by email."
            : "Request declined successfully. Patient has been notified by email.",
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message || "Failed to respond to request.",
      });
    }
  }
);

router.put("/:id/close", protect, allowRoles("patient"), async (req, res) => {
  try {
    const request = await BloodRequest.findOne({
      _id: req.params.id,
      patient: req.user._id,
    })
      .populate("patient", "name email")
      .populate("matchedDonors.donor", "name email");

    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }

    request.isOpen = false;
    request.status = "closed";

    await request.save();

    const recipientEmails = [
      request.patient?.email,
      ...(request.matchedDonors || []).map((item) => item.donor?.email),
    ].filter(Boolean);

    try {
      await sendRequestStatusUpdateEmail({
        recipients: recipientEmails,
        request,
        status: "closed",
        note: "Blood request was closed by patient.",
      });
    } catch (mailError) {
      console.log("Close request email failed:", mailError.message);
    }

    return res.json({
      request,
      message: "Blood request closed successfully. Email notification sent.",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Failed to close request." });
  }
});

export default router;