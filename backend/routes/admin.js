import express from "express";
import User from "../models/User.js";
import BloodRequest from "../models/BloodRequest.js";
import SupportMessage from "../models/SupportMessage.js";
import BloodCamp from "../models/BloodCamp.js";
import { protect, allowRoles } from "../middleware/auth.js";
import {
  sendPatientDonorAcceptedEmail,
  sendDonorResponseConfirmationEmail,
  sendRequestStatusUpdateEmail,
  sendVerificationStatusEmail,
} from "../utils/sendMail.js";

const router = express.Router();

router.use(protect);
router.use(allowRoles("admin"));

const addBadge = (donor, badge) => {
  if (!donor.donorBadges) {
    donor.donorBadges = [];
  }

  if (!donor.donorBadges.includes(badge)) {
    donor.donorBadges.push(badge);
  }
};

const getRequestRecipientEmails = (request) => {
  return [
    request.patient?.email,
    ...(request.matchedDonors || []).map((item) => item.donor?.email),
  ].filter(Boolean);
};

const getMatchedDonorEmails = (request) => {
  return (request.matchedDonors || [])
    .map((item) => item.donor?.email)
    .filter(Boolean);
};

const updateDonorRewardAfterCompletedRequest = async (request) => {
  const acceptedDonorIds =
    request.matchedDonors
      ?.filter((item) => item.status === "accepted")
      .map((item) => item.donor?._id || item.donor) || [];

  if (acceptedDonorIds.length === 0) {
    return;
  }

  const donationDate = request.completedAt || new Date();

  for (const donorId of acceptedDonorIds) {
    const donor = await User.findOne({
      _id: donorId,
      role: "donor",
    });

    if (!donor) continue;

    if (!donor.donationStats) {
      donor.donationStats = {
        totalDonations: 0,
        emergencyDonations: 0,
      };
    }

    donor.donationStats.totalDonations =
      Number(donor.donationStats.totalDonations || 0) + 1;

    donor.lastDonationDate = donationDate;

    if (request.urgency === "Critical" || request.urgency === "Urgent") {
      donor.donationStats.emergencyDonations =
        Number(donor.donationStats.emergencyDonations || 0) + 1;

      addBadge(donor, "Emergency Helper");
    }

    if (donor.donationStats.totalDonations >= 1) {
      addBadge(donor, "First Donation Hero");
    }

    if (donor.donationStats.totalDonations >= 3) {
      addBadge(donor, "Life Saver");
    }

    if (donor.donationStats.totalDonations >= 5) {
      addBadge(donor, "5 Donations Club");
    }

    await donor.save();
  }
};

router.get("/donors", async (req, res) => {
  try {
    const donors = await User.find({ role: "donor" })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.json({ donors });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to fetch donors.",
    });
  }
});

router.get("/patients", async (req, res) => {
  try {
    const patients = await User.find({ role: "patient" })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.json({ patients });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to fetch patients.",
    });
  }
});

router.get("/requests", async (req, res) => {
  try {
    const requests = await BloodRequest.find()
      .populate("patient", "name email phone")
      .populate(
        "matchedDonors.donor",
        "name email phone bloodGroup city isVerifiedDonor"
      )
      .sort({ createdAt: -1 });

    return res.json({ requests });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to fetch requests.",
    });
  }
});

router.get("/queries", async (req, res) => {
  try {
    const queries = await SupportMessage.find().sort({ createdAt: -1 });
    return res.json({ queries });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to fetch queries.",
    });
  }
});

router.post("/users", async (req, res) => {
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
    } = req.body;

    if (!["donor", "patient"].includes(role)) {
      return res
        .status(400)
        .json({ message: "Admin can add only donor or patient." });
    }

    if (!name || !email || !password || !phone || !bloodGroup || !city) {
      return res.status(400).json({ message: "Please fill required fields." });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

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

    return res.status(201).json({ user: user.toSafeObject() });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to add user.",
    });
  }
});

router.put("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.role === "admin") {
      return res
        .status(403)
        .json({ message: "Admin account cannot be edited here." });
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

    return res.json({ user: user.toSafeObject() });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to update user.",
    });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.role === "admin") {
      return res
        .status(403)
        .json({ message: "Admin account cannot be deleted." });
    }

    await user.deleteOne();

    return res.json({ message: "User deleted successfully." });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to delete user.",
    });
  }
});

router.put("/requests/:id", async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id)
      .populate("patient", "name email")
      .populate("matchedDonors.donor", "name email");

    if (!request) {
      return res.status(404).json({ message: "Blood request not found." });
    }

    let statusChanged = false;

    if (req.body.isOpen !== undefined) {
      request.isOpen = req.body.isOpen;

      if (req.body.isOpen === false) {
        request.status = "closed";
        statusChanged = true;
      }

      if (req.body.isOpen === true && request.status === "closed") {
        request.status = "pending";
        statusChanged = true;
      }
    }

    if (req.body.urgency) {
      request.urgency = req.body.urgency;
    }

    await request.save();

    if (statusChanged) {
      const recipientEmails = getRequestRecipientEmails(request);

      try {
        await sendRequestStatusUpdateEmail({
          recipients: recipientEmails,
          request,
          status: request.status,
          note: "Blood request status updated by LifeDrop admin.",
        });
      } catch (mailError) {
        console.log("Admin request update email failed:", mailError.message);
      }
    }

    return res.json({ request });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to update request.",
    });
  }
});

router.delete("/requests/:id", async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Blood request not found." });
    }

    await request.deleteOne();

    return res.json({ message: "Blood request deleted successfully." });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to delete request.",
    });
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

    return res.json({ query });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to update query.",
    });
  }
});

router.delete("/queries/:id", async (req, res) => {
  try {
    const query = await SupportMessage.findById(req.params.id);

    if (!query) {
      return res.status(404).json({ message: "Query not found." });
    }

    await query.deleteOne();

    return res.json({ message: "Query deleted successfully." });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to delete query.",
    });
  }
});

router.patch("/donors/:id/verify", async (req, res) => {
  try {
    const { isVerifiedDonor, verificationNote } = req.body;

    const donor = await User.findOne({
      _id: req.params.id,
      role: "donor",
    });

    if (!donor) {
      return res.status(404).json({ message: "Donor not found." });
    }

    donor.isVerifiedDonor = Boolean(isVerifiedDonor);
    donor.verificationNote = verificationNote || "";

    if (donor.isVerifiedDonor) {
      addBadge(donor, "Verified Donor");
    }

    await donor.save();

    try {
      await sendVerificationStatusEmail({
        recipientEmail: donor.email,
        recipientName: donor.name,
        verificationType: "Donor Profile",
        isVerified: donor.isVerifiedDonor,
        note: donor.isVerifiedDonor
          ? "Your donor profile has been verified. You can now accept matched blood requests."
          : "Your donor verification has been removed by LifeDrop admin.",
      });
    } catch (mailError) {
      console.log("Donor verification email failed:", mailError.message);
    }

    return res.json({
      donor: donor.toSafeObject(),
      message: donor.isVerifiedDonor
        ? "Donor verified successfully. Email sent to donor."
        : "Donor verification removed. Email sent to donor.",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to update donor verification.",
    });
  }
});

router.patch("/requests/:id/verify-hospital", async (req, res) => {
  try {
    const { isHospitalVerified } = req.body;

    const request = await BloodRequest.findById(req.params.id)
      .populate("patient", "name email")
      .populate("matchedDonors.donor", "name email");

    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }

    request.isHospitalVerified = Boolean(isHospitalVerified);

    await request.save();

    try {
      await sendVerificationStatusEmail({
        recipientEmail: request.patient?.email,
        recipientName: request.patient?.name,
        verificationType: "Hospital Request",
        isVerified: request.isHospitalVerified,
        note: request.isHospitalVerified
          ? "Your hospital blood request has been verified by LifeDrop admin."
          : "Your hospital request verification has been removed by LifeDrop admin.",
      });
    } catch (mailError) {
      console.log("Hospital direct verification email failed:", mailError.message);
    }

    const donorEmails = getMatchedDonorEmails(request);

    if (donorEmails.length > 0) {
      try {
        await sendRequestStatusUpdateEmail({
          recipients: donorEmails,
          request,
          status: request.status,
          note: request.isHospitalVerified
            ? "Hospital request has been verified by LifeDrop admin."
            : "Hospital verification has been removed by LifeDrop admin.",
        });
      } catch (mailError) {
        console.log(
          "Hospital verification donor email failed:",
          mailError.message
        );
      }
    }

    return res.json({
      request,
      message: request.isHospitalVerified
        ? "Hospital request verified. Email sent to patient and matched donors."
        : "Hospital verification removed. Email sent to patient and matched donors.",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to verify hospital request.",
    });
  }
});

router.patch("/requests/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatus = [
      "pending",
      "donor_found",
      "contacted",
      "completed",
      "closed",
    ];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid request status." });
    }

    const request = await BloodRequest.findById(req.params.id)
      .populate("patient", "name email")
      .populate("matchedDonors.donor", "name email phone bloodGroup city");

    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }

    request.status = status;

    if (status === "closed" || status === "completed") {
      request.isOpen = false;
    }

    if (status !== "closed" && status !== "completed") {
      request.isOpen = true;
    }

    if (status === "completed" && !request.rewardProcessed) {
      request.completedAt = new Date();

      await updateDonorRewardAfterCompletedRequest(request);

      request.rewardProcessed = true;
    }

    await request.save();

    const recipientEmails = getRequestRecipientEmails(request);

    try {
      await sendRequestStatusUpdateEmail({
        recipients: recipientEmails,
        request,
        status,
        note:
          status === "completed"
            ? "Blood request has been completed. Donor rewards have been updated."
            : "Blood request status updated by LifeDrop admin.",
      });
    } catch (mailError) {
      console.log("Admin status update email failed:", mailError.message);
    }

    return res.json({
      request,
      message:
        status === "completed"
          ? "Request completed. Donor rewards updated and email notification sent."
          : "Request status updated and email notification sent.",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to update request status.",
    });
  }
});

router.patch(
  "/requests/:requestId/donor-response/:donorId",
  async (req, res) => {
    try {
      const { status } = req.body;

      if (!["pending", "accepted", "declined"].includes(status)) {
        return res.status(400).json({
          message: "Status must be pending, accepted or declined.",
        });
      }

      const request = await BloodRequest.findById(req.params.requestId)
        .populate("patient", "name email")
        .populate(
          "matchedDonors.donor",
          "name email phone bloodGroup city isVerifiedDonor privacySettings"
        );

      if (!request) {
        return res.status(404).json({ message: "Blood request not found." });
      }

      if (request.status === "completed" || request.status === "closed") {
        return res.status(400).json({
          message:
            "Cannot change donor response after request is completed or closed.",
        });
      }

      const matchedDonor = request.matchedDonors.find((item) => {
        const donorId = String(item.donor?._id || item.donor);
        return donorId === String(req.params.donorId);
      });

      if (!matchedDonor) {
        return res.status(404).json({
          message: "This donor is not matched with this request.",
        });
      }

      const previousStatus = matchedDonor.status;
      const donor = matchedDonor.donor;

      matchedDonor.status = status;
      matchedDonor.respondedAt = status === "pending" ? undefined : new Date();

      if (status === "accepted") {
        request.status = "contacted";
        request.isOpen = true;
      }

      if (status === "declined" || status === "pending") {
        const hasAcceptedDonor = request.matchedDonors.some(
          (item) => item.status === "accepted"
        );

        if (!hasAcceptedDonor) {
          request.status =
            request.matchedDonors.length > 0 ? "donor_found" : "pending";
          request.isOpen = true;
        }
      }

      await request.save();

      if (status === "accepted" && previousStatus !== "accepted") {
        try {
          await sendPatientDonorAcceptedEmail({
            patientEmail: request.patient.email,
            bloodGroup: request.bloodGroup,
            donor,
            request,
          });
        } catch (mailError) {
          console.log("Admin donor accepted email failed:", mailError.message);
        }
      }

      if (status === "declined") {
        try {
          await sendRequestStatusUpdateEmail({
            recipients: [request.patient.email],
            request,
            status: "Donor Declined",
            note: `${
              donor?.name || "Matched donor"
            } was marked as declined by LifeDrop admin.`,
          });
        } catch (mailError) {
          console.log("Admin donor declined email failed:", mailError.message);
        }
      }

      if (status === "pending") {
        try {
          await sendRequestStatusUpdateEmail({
            recipients: [request.patient.email],
            request,
            status: "Donor Response Reset",
            note: `${
              donor?.name || "Matched donor"
            } response was reset by LifeDrop admin.`,
          });
        } catch (mailError) {
          console.log("Admin donor reset email failed:", mailError.message);
        }
      }

      try {
        await sendDonorResponseConfirmationEmail({
          donorEmail: donor?.email,
          donorName: donor?.name,
          request,
          status:
            status === "pending"
              ? "pending by admin reset"
              : `${status} by admin`,
        });
      } catch (mailError) {
        console.log("Admin donor confirmation email failed:", mailError.message);
      }

      return res.json({
        request,
        message:
          status === "accepted"
            ? "Donor response updated to accepted. Patient and donor have been notified by email."
            : `Donor response updated to ${status}. Patient and donor have been notified by email.`,
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message || "Failed to update donor response.",
      });
    }
  }
);

router.post("/camps", async (req, res) => {
  try {
    const {
      title,
      location,
      city,
      date,
      startTime,
      endTime,
      description,
      organizerName,
      contactNumber,
      maxSlots,
    } = req.body;

    if (!title || !location || !city || !date) {
      return res.status(400).json({
        message: "Title, location, city and date are required.",
      });
    }

    const camp = await BloodCamp.create({
      title,
      location,
      city,
      date,
      startTime,
      endTime,
      description,
      organizerName,
      contactNumber,
      maxSlots,
    });

    return res.status(201).json({
      camp,
      message: "Blood camp created successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to create blood camp.",
    });
  }
});

router.get("/camps", async (req, res) => {
  try {
    const camps = await BloodCamp.find()
      .populate("registeredDonors.donor", "name email phone bloodGroup city")
      .sort({ date: 1 });

    return res.json({ camps });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to fetch blood camps.",
    });
  }
});

router.put("/camps/:id", async (req, res) => {
  try {
    const camp = await BloodCamp.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!camp) {
      return res.status(404).json({ message: "Blood camp not found." });
    }

    return res.json({
      camp,
      message: "Blood camp updated successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to update blood camp.",
    });
  }
});

router.delete("/camps/:id", async (req, res) => {
  try {
    const camp = await BloodCamp.findByIdAndDelete(req.params.id);

    if (!camp) {
      return res.status(404).json({ message: "Blood camp not found." });
    }

    return res.json({ message: "Blood camp deleted successfully." });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to delete blood camp.",
    });
  }
});

export default router;