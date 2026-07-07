import { useEffect, useState } from "react";
import {
  Award,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  HeartHandshake,
  MapPin,
  Phone,
  ShieldCheck,
  XCircle,
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

  const [matchedRequests, setMatchedRequests] = useState([]);
  const [camps, setCamps] = useState([]);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [loadingCamps, setLoadingCamps] = useState(false);

  const isVerifiedDonor = Boolean(user?.isVerifiedDonor);

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

  useEffect(() => {
    loadFreshUser();
    loadMatchedRequests();
    loadCamps();
  }, []);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const clearAlerts = () => {
    setMessage("");
    setError("");
  };

  const loadFreshUser = async () => {
    try {
      const { data } = await api.get("/auth/me");

      if (data.user) {
        updateLocalUser(data.user);
      }
    } catch (err) {
      console.log("Fresh user fetch error:", err.response?.data || err.message);
    }
  };

  const loadMatchedRequests = async () => {
    setLoadingRequests(true);

    try {
      const { data } = await api.get("/requests/matched-for-me");
      setMatchedRequests(data.requests || []);
    } catch (err) {
      console.log("Matched request error:", err.response?.data || err.message);
    } finally {
      setLoadingRequests(false);
    }
  };

  const loadCamps = async () => {
    setLoadingCamps(true);

    try {
      const { data } = await api.get("/camps");
      setCamps(data.camps || []);
    } catch (err) {
      console.log("Camp fetch error:", err.response?.data || err.message);
    } finally {
      setLoadingCamps(false);
    }
  };

  const getMyResponseStatus = (request) => {
    const myId = String(user?._id || user?.id || "");

    const matched = request.matchedDonors?.find((item) => {
      const donorId = String(item.donor?._id || item.donor || "");
      return donorId === myId;
    });

    return matched?.status || "pending";
  };

  const handleRequestResponse = async (requestId, status) => {
    clearAlerts();

    if (status === "accepted" && !isVerifiedDonor) {
      setError(
        "Admin verification required. You can accept blood requests only after admin verifies your donor profile."
      );
      return;
    }

    try {
      const { data } = await api.patch(`/requests/${requestId}/respond`, {
        status,
      });

      setMessage(data.message || "Response updated successfully.");
      loadMatchedRequests();
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not respond to blood request."
      );
    }
  };

  const handleCampRegister = async (campId) => {
    clearAlerts();

    try {
      const { data } = await api.post(`/camps/${campId}/register`);
      setMessage(data.message || "Registered for blood camp successfully.");
      loadCamps();
    } catch (err) {
      setError(err.response?.data?.message || "Could not register for camp.");
    }
  };

  const isRegisteredForCamp = (camp) => {
    const myId = String(user?._id || user?.id || "");

    return camp.registeredDonors?.some((item) => {
      const donorId = String(item.donor?._id || item.donor || "");
      return donorId === myId;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearAlerts();
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
        "Donor profile updated successfully. Your profile will appear on homepage if available."
      );
    } catch (err) {
      setError(err.response?.data?.message || "Could not update donor profile.");
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
            Keep your information updated, respond to matched blood requests,
            and register for upcoming blood donation camps.
          </p>

          <div className="donor-badge-row">
            {isVerifiedDonor ? (
              <span className="verified-badge">
                <ShieldCheck size={16} /> Verified Donor
              </span>
            ) : (
              <span className="pending-badge">
                <Clock size={16} /> Verification Pending
              </span>
            )}

            {user?.donorBadges?.length > 0 &&
              user.donorBadges.map((badge) => (
                <span className="award-badge" key={badge}>
                  <Award size={16} /> {badge}
                </span>
              ))}
          </div>
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
                    <option key={gender} value={gender}>
                      {gender}
                    </option>
                  )
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

      <div className="container donor-extra-grid">
        <div className="glass-card donor-section-card">
          <div className="section-title compact-title">
            <span className="eyebrow">
              <HeartHandshake size={16} /> Matched Requests
            </span>

            <h2>Blood requests matched with you</h2>

            <p>
              Accept only after admin verification. Patient will receive your
              details by email after acceptance.
            </p>
          </div>

          {loadingRequests ? (
            <div className="empty-state">Loading matched requests...</div>
          ) : matchedRequests.length === 0 ? (
            <div className="empty-state">
              No matched blood requests right now.
            </div>
          ) : (
            <div className="request-list donor-request-list">
              {matchedRequests.map((request) => {
                const myStatus = getMyResponseStatus(request);

                return (
                  <article className="request-card" key={request._id}>
                    <div className="request-top">
                      <span className="blood-badge">{request.bloodGroup}</span>

                      <span className={`status-mini ${myStatus}`}>
                        {myStatus}
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
                      <Phone size={16} /> Patient contact:{" "}
                      {request.contactNumber}
                    </p>

                    {request.message && <p>{request.message}</p>}

                    {myStatus === "pending" ? (
                      <>
                        {!isVerifiedDonor && (
                          <div className="verification-warning">
                            Admin verification required before accepting blood
                            requests.
                          </div>
                        )}

                        <div className="request-actions">
                          <button
                            type="button"
                            className="btn btn-primary"
                            disabled={!isVerifiedDonor}
                            onClick={() =>
                              handleRequestResponse(request._id, "accepted")
                            }
                          >
                            <CheckCircle2 size={17} /> Accept
                          </button>

                          <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() =>
                              handleRequestResponse(request._id, "declined")
                            }
                          >
                            <XCircle size={17} /> Decline
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className={`donor-response-note ${myStatus}`}>
                        {myStatus === "accepted" ? (
                          <>
                            <CheckCircle2 size={17} />
                            You accepted this request. Patient has been notified
                            by email.
                          </>
                        ) : (
                          <>
                            <XCircle size={17} />
                            You declined this request.
                          </>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <div className="glass-card donor-section-card">
          <div className="section-title compact-title">
            <span className="eyebrow">
              <CalendarDays size={16} /> Blood Camps
            </span>

            <h2>Upcoming donation camps</h2>

            <p>
              Register for nearby blood donation camps and help more patients.
            </p>
          </div>

          {loadingCamps ? (
            <div className="empty-state">Loading camps...</div>
          ) : camps.length === 0 ? (
            <div className="empty-state">No upcoming blood camps.</div>
          ) : (
            <div className="camp-list">
              {camps.map((camp) => {
                const registered = isRegisteredForCamp(camp);

                return (
                  <article className="camp-card" key={camp._id}>
                    <h3>{camp.title}</h3>

                    <p>
                      <MapPin size={16} /> {camp.location}, {camp.city}
                    </p>

                    <p>
                      <CalendarDays size={16} />{" "}
                      {new Date(camp.date).toLocaleDateString()}{" "}
                      {camp.startTime && `• ${camp.startTime}`}
                    </p>

                    <p>
                      Slots: {camp.registeredDonors?.length || 0}/
                      {camp.maxSlots || 50}
                    </p>

                    {camp.description && <p>{camp.description}</p>}

                    <button
                      type="button"
                      className={
                        registered ? "btn btn-ghost" : "btn btn-primary"
                      }
                      disabled={registered}
                      onClick={() => handleCampRegister(camp._id)}
                    >
                      {registered ? "Registered" : "Register for Camp"}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Donate;