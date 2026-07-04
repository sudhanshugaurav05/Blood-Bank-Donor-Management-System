import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  HeartHandshake,
  MapPin,
  Phone,
} from "lucide-react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const Donate = () => {
  const { user, updateLocalUser } = useAuth();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    bloodGroup: "O+",
    city: "",
    address: "",
    age: "",
    gender: "Prefer not to say",
    isAvailable: true,
    lastDonationDate: "",
    emergencyContact: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        phone: user.phone || "",
        bloodGroup: user.bloodGroup || "O+",
        city: user.city || "",
        address: user.address || "",
        age: user.age || "",
        gender: user.gender || "Prefer not to say",
        isAvailable: Boolean(user.isAvailable),
        lastDonationDate: user.lastDonationDate
          ? user.lastDonationDate.slice(0, 10)
          : "",
        emergencyContact: user.emergencyContact || "",
      });
    }
  }, [user]);

  const updateField = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setSubmitting(true);

    try {
      const payload = {
        ...form,
        age: form.age ? Number(form.age) : undefined,
        lastDonationDate: form.lastDonationDate || undefined,
      };
      const { data } = await api.put("/donors/profile/update", payload);
      updateLocalUser(data.user);
      setMessage(
        "Donor profile updated successfully. Your profile will appear on homepage if available.",
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not update donor profile.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section light-section">
      <div className="container dashboard-header">
        <div>
          <span className="eyebrow">
            <HeartHandshake size={16} /> Donation Page
          </span>
          <h1>Manage your donor profile</h1>
          <p>
            Keep your information updated so patients can contact you when they
            need blood.
          </p>
        </div>
        <div className="status-pill">
          <CheckCircle2 size={18} />{" "}
          {form.isAvailable ? "Visible on Homepage" : "Hidden from Homepage"}
        </div>
      </div>

      <div className="container form-layout">
        <form className="profile-form glass-card" onSubmit={handleSubmit}>
          {message && <div className="alert success">{message}</div>}
          {error && <div className="alert error">{error}</div>}

          <div className="form-grid two">
            <label>
              Name
              <input
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
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
                    <option key={group}>{group}</option>
                  ),
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
            <label>
              Age
              <input
                type="number"
                min="18"
                max="65"
                value={form.age}
                onChange={(e) => updateField("age", e.target.value)}
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
                    <option key={gender}>{gender}</option>
                  ),
                )}
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
            <label>
              Emergency Contact
              <input
                value={form.emergencyContact}
                onChange={(e) =>
                  updateField("emergencyContact", e.target.value)
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

          <label className="toggle-row">
            <input
              type="checkbox"
              checked={form.isAvailable}
              onChange={(e) => updateField("isAvailable", e.target.checked)}
            />
            <span>
              Available for blood donation and show my profile on homepage
            </span>
          </label>

          <button className="btn btn-primary btn-full" disabled={submitting}>
            {submitting ? "Saving..." : "Save Donor Profile"}
          </button>
        </form>

        <aside className="side-info glass-card">
          <h3>Before you donate</h3>
          <p>
            <CalendarDays size={18} /> Keep last donation date updated.
          </p>
          <p>
            <Phone size={18} /> Keep phone number active for emergency contact.
          </p>
          <p>
            <MapPin size={18} /> Mention correct city to help nearby patients.
          </p>
          <div className="tip-box">
            Tip: If you are temporarily unavailable, turn off availability.
          </div>
        </aside>
      </div>
    </section>
  );
};

export default Donate;
