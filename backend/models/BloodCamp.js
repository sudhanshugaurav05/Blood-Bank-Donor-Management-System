import mongoose from "mongoose";

const bloodCampSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: Date,
      required: true,
    },

    startTime: {
      type: String,
      default: "",
    },

    endTime: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    organizerName: {
      type: String,
      default: "LifeDrop Blood Bank",
    },

    contactNumber: {
      type: String,
      default: "",
    },

    maxSlots: {
      type: Number,
      default: 50,
    },

    registeredDonors: [
      {
        donor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        registeredAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const BloodCamp = mongoose.model("BloodCamp", bloodCampSchema);

export default BloodCamp;