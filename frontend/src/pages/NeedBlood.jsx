import { useEffect, useState } from "react";
import { AlertCircle, Building2, Droplets, Handshake } from "lucide-react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import RequestCard from "../components/RequestCard.jsx";

const NeedBlood = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    bloodGroup: "O+",
    units: 1,
    city: "",
    hospitalName: "",
    urgency: "Urgent",
    contactNumber: "",
    message: "",
  });
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        bloodGroup: user.bloodGroup || prev.bloodGroup,
        city: user.city || "",
        hospitalName: user.hospitalName || "",
        contactNumber: user.phone || "",
      }));
    }
  }, [user]);

  const loadRequests = async () => {
    const { data } = await api.get("/requests");
    setRequests(data.requests || []);
  };

  useEffect(() => {
    loadRequests().catch(() => setRequests([]));
  }, []);

  const updateField = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setSubmitting(true);

    try {
      await api.post("/requests", { ...form, units: Number(form.units) });
      setMessage(
        "Blood request submitted successfully. Donors can now see your requirement.",
      );
      setForm((prev) => ({ ...prev, units: 1, message: "" }));
      loadRequests();
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not submit blood request.",
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
            <Droplets size={16} /> Need Blood
          </span>
          <h1>Create an emergency blood request</h1>
          <p>
            Patients can post blood group, hospital, city, units, and contact
            details.
          </p>
        </div>
        <div className="status-pill critical-pill">
          <AlertCircle size={18} /> Patient Request Panel
        </div>
      </div>

      <div className="container form-layout">
        <form className="profile-form glass-card" onSubmit={handleSubmit}>
          {message && <div className="alert success">{message}</div>}
          {error && <div className="alert error">{error}</div>}

          <div className="form-grid two">
            <label>
              Required Blood Group
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
              Units Required
              <input
                type="number"
                min="1"
                max="10"
                value={form.units}
                onChange={(e) => updateField("units", e.target.value)}
                required
              />
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
              Hospital Name
              <input
                value={form.hospitalName}
                onChange={(e) => updateField("hospitalName", e.target.value)}
                required
              />
            </label>
            <label>
              Urgency
              <select
                value={form.urgency}
                onChange={(e) => updateField("urgency", e.target.value)}
              >
                {["Normal", "Urgent", "Critical"].map((urgency) => (
                  <option key={urgency}>{urgency}</option>
                ))}
              </select>
            </label>
            <label>
              Contact Number
              <input
                value={form.contactNumber}
                onChange={(e) => updateField("contactNumber", e.target.value)}
                required
              />
            </label>
            <label className="full">
              Message
              <textarea
                rows="4"
                value={form.message}
                onChange={(e) => updateField("message", e.target.value)}
                placeholder="Example: Need blood before surgery tomorrow morning."
              />
            </label>
          </div>

          <button className="btn btn-primary btn-full" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Blood Request"}
          </button>
        </form>

        <aside className="side-info glass-card">
          <h3>How communication works</h3>
          <p>
            <Building2 size={18} /> Patient posts hospital and contact
            information.
          </p>
          <p>
            <Handshake size={18} /> Donors check homepage/request board and
            contact patient.
          </p>
          <p>
            <Droplets size={18} /> Blood group and city filters make search
            faster.
          </p>
          <div className="tip-box">
            For mini project viva: explain this as a patient-to-donor
            communication flow.
          </div>
        </aside>
      </div>

      <div className="container section-heading lower-heading">
        <span className="eyebrow">
          <AlertCircle size={16} /> Open Requests
        </span>
        <h2>Active patient requirements</h2>
      </div>
      <div className="container cards-grid">
        {requests.length > 0 ? (
          requests.map((request) => (
            <RequestCard key={request._id} request={request} />
          ))
        ) : (
          <div className="empty-state glass-card">No requests available.</div>
        )}
      </div>
    </section>
  );
};

export default NeedBlood;
