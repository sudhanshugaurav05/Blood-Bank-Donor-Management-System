import { useEffect, useState } from "react";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  Droplets,
  Handshake,
  Mail,
  MapPin,
  ShieldCheck,
  XCircle,
} from "lucide-react";
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
  const [myRequests, setMyRequests] = useState([]);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingMyRequests, setLoadingMyRequests] = useState(false);

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
    try {
      const { data } = await api.get("/requests");
      setRequests(data.requests || []);
    } catch {
      setRequests([]);
    }
  };

  const loadMyRequests = async () => {
    setLoadingMyRequests(true);

    try {
      const { data } = await api.get("/requests/my");
      setMyRequests(data.requests || []);
    } catch (err) {
      console.log("My requests error:", err.response?.data || err.message);
      setMyRequests([]);
    } finally {
      setLoadingMyRequests(false);
    }
  };

  useEffect(() => {
    loadRequests();
    loadMyRequests();
  }, []);

  const updateField = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const getStatusLabel = (status, isOpen) => {
    if (!isOpen) return "Closed";

    const labels = {
      pending: "Pending",
      donor_found: "Donor Found",
      contacted: "Donor Contacted",
      completed: "Completed",
      closed: "Closed",
    };

    return labels[status] || "Pending";
  };

  const getStatusClass = (status, isOpen) => {
    if (!isOpen) return "closed";
    return status || "pending";
  };

  const getAcceptedDonors = (request) => {
    return (
      request.matchedDonors?.filter((item) => item.status === "accepted") || []
    );
  };

  const handleCloseRequest = async (requestId) => {
    const confirmClose = window.confirm("Close this blood request?");
    if (!confirmClose) return;

    setMessage("");
    setError("");

    try {
      const { data } = await api.put(`/requests/${requestId}/close`);
      setMessage(data.message || "Blood request closed successfully.");
      loadRequests();
      loadMyRequests();
    } catch (err) {
      setError(err.response?.data?.message || "Could not close request.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setSubmitting(true);

    try {
      const { data } = await api.post("/requests", {
        ...form,
        units: Number(form.units),
      });

      setMessage(
        data.message ||
          "Blood request submitted successfully. Donors can now see your requirement."
      );

      setForm((prev) => ({ ...prev, units: 1, message: "" }));

      loadRequests();
      loadMyRequests();
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit blood request.");
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
            details. Matching donors can accept your request and you will be
            notified.
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
                    <option key={group} value={group}>
                      {group}
                    </option>
                  )
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
                  <option key={urgency} value={urgency}>
                    {urgency}
                  </option>
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
            <Handshake size={18} /> Eligible donors from same city and blood
            group are matched.
          </p>

          <p>
            <Mail size={18} /> When donor accepts, patient gets donor details by
            email.
          </p>

          <div className="tip-box">
            This is a SafeMatch flow: blood group + city + donor eligibility +
            donor permission.
          </div>
        </aside>
      </div>

      <div className="container section-heading lower-heading">
        <span className="eyebrow">
          <Clock size={16} /> My Requests
        </span>

        <h2>Track your blood requests</h2>
      </div>

      <div className="container patient-request-list">
        {loadingMyRequests ? (
          <div className="empty-state glass-card">Loading your requests...</div>
        ) : myRequests.length > 0 ? (
          myRequests.map((request) => {
            const acceptedDonors = getAcceptedDonors(request);

            return (
              <article className="glass-card patient-request-card" key={request._id}>
                <div className="patient-request-top">
                  <span className="blood-badge">{request.bloodGroup}</span>

                  <span
                    className={`request-status-badge ${getStatusClass(
                      request.status,
                      request.isOpen
                    )}`}
                  >
                    {getStatusLabel(request.status, request.isOpen)}
                  </span>
                </div>

                <h3>{request.hospitalName}</h3>

                <p>
                  <MapPin size={16} /> {request.city}
                </p>

                <p>
                  <Building2 size={16} /> Units required: {request.units}
                </p>

                <p>
                  <AlertCircle size={16} /> Urgency: {request.urgency}
                </p>

                {request.isHospitalVerified ? (
                  <span className="verified-badge small-status">
                    <ShieldCheck size={15} /> Hospital Verified
                  </span>
                ) : (
                  <span className="pending-badge small-status">
                    <Clock size={15} /> Hospital Verification Pending
                  </span>
                )}

                <div className="matched-info-box">
                  <h4>Matched Donors</h4>

                  {request.matchedDonors?.length > 0 ? (
                    request.matchedDonors.map((item, index) => (
                      <div className="matched-donor-row" key={index}>
                        <div>
                          <strong>
                            {item.donor?.name || "Matched Donor"}
                          </strong>

                          <span>
                            {item.donor?.bloodGroup || request.bloodGroup} •{" "}
                            {item.donor?.city || request.city}
                          </span>
                        </div>

                        <span className={`status-mini ${item.status || "pending"}`}>
                          {item.status || "pending"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p>No matching donor found yet.</p>
                  )}
                </div>

                {acceptedDonors.length > 0 && (
                  <div className="accepted-donor-box">
                    <CheckCircle2 size={18} />
                    Donor accepted your request. Check your email for donor
                    contact details.
                  </div>
                )}

                {request.isOpen && (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => handleCloseRequest(request._id)}
                  >
                    <XCircle size={17} /> Close Request
                  </button>
                )}
              </article>
            );
          })
        ) : (
          <div className="empty-state glass-card">
            You have not created any blood request yet.
          </div>
        )}
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