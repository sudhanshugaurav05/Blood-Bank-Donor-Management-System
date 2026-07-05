import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HeartHandshake, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const initialForm = {
  role: "donor",
  name: "",
  email: "",
  password: "",
  phone: "",
  bloodGroup: "O+",
  city: "",
  address: "",
  age: "",
  gender: "Prefer not to say",
  hospitalName: "",
  emergencyContact: "",

  weight: "",
  hemoglobin: "",
  donationType: "wholeBlood",
  lastDonationDate: "",

  permanentRestrictions: {
    hivAids: false,
    hepatitis: false,
    cancer: false,
    chronicHeartDisease: false,
    chronicKidneyDisease: false,
    activeTuberculosis: false,
    uncontrolledDiabetes: false,
    epilepsy: false,
  },

  temporaryRestrictions: {
    feverFluInfection: false,
    recentSurgery: false,
    pregnancyBreastfeeding: false,
    tattooPiercing: false,
    recentVaccination: false,
    antibioticsMedication: false,
    lowHemoglobinAnemia: false,
  },

  lifestyleRestrictions: {
    alcoholDrugIntoxication: false,
    highRiskBehavior: false,
  },
};

const Register = () => {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [eligibilityReasons, setEligibilityReasons] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleHealthCheck = (group, key) => {
    setForm((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [key]: !prev[group][key],
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setEligibilityReasons([]);
    setSubmitting(true);

    try {
      const payload = {
        ...form,
        age: form.age ? Number(form.age) : undefined,
        weight: form.weight ? Number(form.weight) : undefined,
        hemoglobin: form.hemoglobin ? Number(form.hemoglobin) : undefined,
        lastDonationDate: form.lastDonationDate || undefined,
      };

      if (form.role === "patient") {
        delete payload.weight;
        delete payload.hemoglobin;
        delete payload.donationType;
        delete payload.lastDonationDate;
        delete payload.permanentRestrictions;
        delete payload.temporaryRestrictions;
        delete payload.lifestyleRestrictions;
      }

      const user = await register(payload);

      navigate(user.role === "donor" ? "/donate" : "/need-blood");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );

      if (err.response?.data?.eligibility?.reasons) {
        setEligibilityReasons(err.response.data.eligibility.reasons);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-section">
      <div className="container auth-grid">
        <div className="auth-info glass-card">
          <span className="eyebrow">
            <ShieldCheck size={16} /> Secure Registration
          </span>

          <h1>Create your LifeDrop account</h1>

          <p>
            Register as a donor to help patients, or register as a patient to
            request blood quickly. Donor registration includes a health
            eligibility check for safe blood donation.
          </p>

          <div className="auth-points">
            <span>
              <HeartHandshake size={18} /> Donor profile visible after approval
            </span>
            <span>
              <HeartHandshake size={18} /> Patient can create blood requests
            </span>
            <span>
              <HeartHandshake size={18} /> Health-based donor eligibility check
            </span>
          </div>
        </div>

        <form className="auth-form glass-card" onSubmit={handleSubmit}>
          <h2>Register</h2>

          {error && <div className="alert error">{error}</div>}

          {eligibilityReasons.length > 0 && (
            <div className="alert error">
              <strong>Reason:</strong>
              <ul className="eligibility-reason-list">
                {eligibilityReasons.map((reason, index) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="role-switch">
            <button
              type="button"
              className={form.role === "donor" ? "active" : ""}
              onClick={() => updateField("role", "donor")}
            >
              Donor
            </button>

            <button
              type="button"
              className={form.role === "patient" ? "active" : ""}
              onClick={() => updateField("role", "patient")}
            >
              Patient
            </button>
          </div>

          <div className="form-grid two">
            <label>
              Full Name
              <input
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
              />
            </label>

            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                required
                minLength={6}
              />
            </label>

            <label>
              Phone
              <input
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                required
              />
            </label>

            <label>
              Blood Group
              <select
                value={form.bloodGroup}
                onChange={(e) => updateField("bloodGroup", e.target.value)}
                required
              >
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                  (group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  )
                )}
              </select>
            </label>

            <label>
              City
              <input
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                required
              />
            </label>
          </div>

          {form.role === "donor" ? (
            <>
              <div className="form-grid two">
                <label>
                  Age
                  <input
                    type="number"
                    value={form.age}
                    onChange={(e) => updateField("age", e.target.value)}
                    min="18"
                    max="65"
                    required
                  />
                </label>

                <label>
                  Gender
                  <select
                    value={form.gender}
                    onChange={(e) => updateField("gender", e.target.value)}
                  >
                    {["Male", "Female", "Other", "Prefer not to say"].map(
                      (gender) => (
                        <option key={gender} value={gender}>
                          {gender}
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label>
                  Weight kg
                  <input
                    type="number"
                    value={form.weight}
                    onChange={(e) => updateField("weight", e.target.value)}
                    min="1"
                    required
                  />
                </label>

                <label>
                  Hemoglobin g/dL
                  <input
                    type="number"
                    step="0.1"
                    value={form.hemoglobin}
                    onChange={(e) => updateField("hemoglobin", e.target.value)}
                    min="1"
                    required
                  />
                </label>

                <label>
                  Donation Type
                  <select
                    value={form.donationType}
                    onChange={(e) =>
                      updateField("donationType", e.target.value)
                    }
                  >
                    <option value="wholeBlood">Whole Blood</option>
                    <option value="platelets">Platelets</option>
                    <option value="plasma">Plasma</option>
                    <option value="doubleRedCells">Double Red Cells</option>
                  </select>
                </label>

                <label>
                  Last Donation Date
                  <input
                    type="date"
                    value={form.lastDonationDate}
                    onChange={(e) =>
                      updateField("lastDonationDate", e.target.value)
                    }
                  />
                </label>

                <label className="full">
                  Address
                  <input
                    value={form.address}
                    onChange={(e) => updateField("address", e.target.value)}
                  />
                </label>
              </div>

              <div className="health-check-card">
                <h3>Donor Eligibility Check</h3>
                <p>
                  Select only if you have any of the following health or
                  lifestyle conditions.
                </p>

                <h4>Permanent Restrictions</h4>

                {[
                  ["hivAids", "HIV/AIDS positive"],
                  ["hepatitis", "Hepatitis B or Hepatitis C infection"],
                  ["cancer", "Cancer active or treated with chemo/radiation"],
                  ["chronicHeartDisease", "Chronic heart disease"],
                  ["chronicKidneyDisease", "Chronic kidney disease"],
                  ["activeTuberculosis", "Active Tuberculosis"],
                  ["uncontrolledDiabetes", "Uncontrolled diabetes / insulin dependent"],
                  ["epilepsy", "Epilepsy with frequent seizures"],
                ].map(([key, label]) => (
                  <label className="checkbox-line" key={key}>
                    <input
                      type="checkbox"
                      checked={form.permanentRestrictions[key]}
                      onChange={() =>
                        handleHealthCheck("permanentRestrictions", key)
                      }
                    />
                    {label}
                  </label>
                ))}

                <h4>Temporary Restrictions</h4>

                {[
                  ["feverFluInfection", "Fever, flu, or active infection"],
                  ["recentSurgery", "Recent surgery"],
                  ["pregnancyBreastfeeding", "Pregnancy or breastfeeding"],
                  ["tattooPiercing", "Tattoo or piercing within last 6–12 months"],
                  ["recentVaccination", "Recent vaccination"],
                  [
                    "antibioticsMedication",
                    "Currently on antibiotics or strong medication",
                  ],
                  [
                    "lowHemoglobinAnemia",
                    "Low hemoglobin or iron deficiency anemia",
                  ],
                ].map(([key, label]) => (
                  <label className="checkbox-line" key={key}>
                    <input
                      type="checkbox"
                      checked={form.temporaryRestrictions[key]}
                      onChange={() =>
                        handleHealthCheck("temporaryRestrictions", key)
                      }
                    />
                    {label}
                  </label>
                ))}

                <h4>Lifestyle Restrictions</h4>

                {[
                  ["alcoholDrugIntoxication", "Alcohol or drug intoxication"],
                  ["highRiskBehavior", "High-risk behavior"],
                ].map(([key, label]) => (
                  <label className="checkbox-line" key={key}>
                    <input
                      type="checkbox"
                      checked={form.lifestyleRestrictions[key]}
                      onChange={() =>
                        handleHealthCheck("lifestyleRestrictions", key)
                      }
                    />
                    {label}
                  </label>
                ))}
              </div>
            </>
          ) : (
            <div className="form-grid two">
              <label>
                Hospital Name
                <input
                  value={form.hospitalName}
                  onChange={(e) => updateField("hospitalName", e.target.value)}
                />
              </label>

              <label>
                Emergency Contact
                <input
                  value={form.emergencyContact}
                  onChange={(e) =>
                    updateField("emergencyContact", e.target.value)
                  }
                />
              </label>
            </div>
          )}

          <button className="btn btn-primary btn-full" disabled={submitting}>
            {submitting ? "Checking eligibility..." : "Create Account"}
          </button>

          <p className="auth-bottom">
            Already registered? <Link to="/login">Login here</Link>
          </p>
        </form>
      </div>
    </section>
  );
};

export default Register;