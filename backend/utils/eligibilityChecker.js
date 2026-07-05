const permanentLabels = {
  hivAids: "HIV/AIDS positive",
  hepatitis: "Hepatitis B or Hepatitis C infection",
  cancer: "Cancer active or treated with chemo/radiation",
  chronicHeartDisease: "Chronic heart disease",
  chronicKidneyDisease: "Chronic kidney disease",
  activeTuberculosis: "Active Tuberculosis",
  uncontrolledDiabetes: "Uncontrolled diabetes / insulin dependent",
  epilepsy: "Epilepsy with frequent seizures",
};

const temporaryLabels = {
  feverFluInfection: "Fever, flu, or active infection",
  recentSurgery: "Recent surgery",
  pregnancyBreastfeeding: "Pregnancy or breastfeeding",
  tattooPiercing: "Tattoo or piercing within last 6–12 months",
  recentVaccination: "Recent vaccination",
  antibioticsMedication: "Currently on antibiotics or strong medication",
  lowHemoglobinAnemia: "Low hemoglobin or iron deficiency anemia",
};

const lifestyleLabels = {
  alcoholDrugIntoxication: "Alcohol or drug intoxication",
  highRiskBehavior: "High-risk behavior",
};

const minimumDonationGapDays = {
  wholeBlood: 56,
  platelets: 7,
  plasma: 28,
  doubleRedCells: 112,
};

function getSelectedReasons(obj = {}, labels = {}) {
  return Object.keys(labels)
    .filter((key) => obj[key])
    .map((key) => labels[key]);
}

export function checkDonorEligibility(data) {
  const reasons = [];

  const age = Number(data.age);
  const weight = Number(data.weight);
  const hemoglobin = Number(data.hemoglobin);

  if (!age || age < 18 || age > 65) {
    reasons.push("Age must be between 18 and 65 years.");
  }

  if (!weight || weight < 50) {
    reasons.push("Weight must be at least 50 kg.");
  }

  if (!hemoglobin || hemoglobin < 12.5) {
    reasons.push("Hemoglobin must be at least 12.5 g/dL.");
  }

  const permanentReasons = getSelectedReasons(
    data.permanentRestrictions,
    permanentLabels
  );

  const temporaryReasons = getSelectedReasons(
    data.temporaryRestrictions,
    temporaryLabels
  );

  const lifestyleReasons = getSelectedReasons(
    data.lifestyleRestrictions,
    lifestyleLabels
  );

  reasons.push(...permanentReasons);
  reasons.push(...temporaryReasons);
  reasons.push(...lifestyleReasons);

  const donationType = data.donationType || "wholeBlood";
  const requiredGap = minimumDonationGapDays[donationType] || 56;

  if (data.lastDonationDate) {
    const lastDate = new Date(data.lastDonationDate);
    const today = new Date();

    const diffInDays = Math.floor(
      (today - lastDate) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays < requiredGap) {
      reasons.push(
        `Minimum gap for ${donationType} donation is ${requiredGap} days. Your last donation was ${diffInDays} days ago.`
      );
    }
  }

  return {
    isEligible: reasons.length === 0,
    status: reasons.length === 0 ? "Eligible" : "Not Eligible",
    reasons,
  };
}