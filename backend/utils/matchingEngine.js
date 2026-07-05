import User from "../models/User.js";

const escapeRegex = (text) => {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const findBestMatchingDonors = async ({ bloodGroup, city, limit = 5 }) => {
  const normalizedBloodGroup = bloodGroup.trim().toUpperCase();
  const normalizedCity = city.trim();

  const cityRegex = new RegExp(`^${escapeRegex(normalizedCity)}$`, "i");

  const donors = await User.find({
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
    .sort({
      isVerifiedDonor: -1,
      createdAt: -1,
    })
    .limit(limit);

  return donors;
};