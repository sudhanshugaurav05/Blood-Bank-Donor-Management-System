import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["donor", "patient", "admin"],
      required: true,
    },

    username: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    bloodGroup: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    age: {
      type: Number,
      min: 1,
      max: 120,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "Prefer not to say"],
      default: "Prefer not to say",
    },

    weight: {
      type: Number,
      min: 1,
    },

    hemoglobin: {
      type: Number,
      min: 1,
    },

    donationType: {
      type: String,
      enum: ["wholeBlood", "platelets", "plasma", "doubleRedCells"],
      default: "wholeBlood",
    },

    permanentRestrictions: {
      hivAids: { type: Boolean, default: false },
      hepatitis: { type: Boolean, default: false },
      cancer: { type: Boolean, default: false },
      chronicHeartDisease: { type: Boolean, default: false },
      chronicKidneyDisease: { type: Boolean, default: false },
      activeTuberculosis: { type: Boolean, default: false },
      uncontrolledDiabetes: { type: Boolean, default: false },
      epilepsy: { type: Boolean, default: false },
    },

    temporaryRestrictions: {
      feverFluInfection: { type: Boolean, default: false },
      recentSurgery: { type: Boolean, default: false },
      pregnancyBreastfeeding: { type: Boolean, default: false },
      tattooPiercing: { type: Boolean, default: false },
      recentVaccination: { type: Boolean, default: false },
      antibioticsMedication: { type: Boolean, default: false },
      lowHemoglobinAnemia: { type: Boolean, default: false },
    },

    lifestyleRestrictions: {
      alcoholDrugIntoxication: { type: Boolean, default: false },
      highRiskBehavior: { type: Boolean, default: false },
    },

    eligibility: {
      isEligible: { type: Boolean, default: true },
      status: { type: String, default: "Eligible" },
      reasons: [{ type: String }],
    },

    isVerifiedDonor: {
      type: Boolean,
      default: false,
    },

    verificationNote: {
      type: String,
      default: "",
    },

    privacySettings: {
      showPhoneToPatients: {
        type: Boolean,
        default: true,
      },
    },

    donorBadges: {
      type: [String],
      default: [],
    },

    donationStats: {
      totalDonations: {
        type: Number,
        default: 0,
      },
      emergencyDonations: {
        type: Number,
        default: 0,
      },
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    lastDonationDate: {
      type: Date,
    },

    hospitalName: {
      type: String,
      trim: true,
      default: "",
    },

    emergencyContact: {
      type: String,
      trim: true,
      default: "",
    },

    avatarColor: {
      type: String,
      default: "#ef4444",
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function matchPassword(
  enteredPassword,
) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model("User", userSchema);

export default User;
