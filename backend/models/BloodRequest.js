import mongoose from "mongoose";

const bloodRequestSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["pending", "donor_found", "contacted", "completed", "closed"],
      default: "pending",
    },

    isHospitalVerified: {
      type: Boolean,
      default: false,
    },

    matchedDonors: [
      {
        donor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        status: {
          type: String,
          enum: ["pending", "accepted", "declined"],
          default: "pending",
        },
        matchedAt: {
          type: Date,
          default: Date.now,
        },
        respondedAt: {
          type: Date,
        },
      },
    ],

    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patientName: {
      type: String,
      required: true,
      trim: true,
    },
    bloodGroup: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    units: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    hospitalName: {
      type: String,
      required: true,
      trim: true,
    },
    urgency: {
      type: String,
      enum: ["Normal", "Urgent", "Critical"],
      default: "Normal",
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      maxlength: 500,
      default: "",
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const BloodRequest = mongoose.model("BloodRequest", bloodRequestSchema);
export default BloodRequest;
