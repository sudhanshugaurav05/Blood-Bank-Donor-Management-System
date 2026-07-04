import { useEffect, useState } from "react";
import { HelpCircle, Mail, MessageCircle, PhoneCall } from "lucide-react";
import api from "../api/axios.js";

const HelpSupport = () => {
  const [form, setForm] = useState({ subject: "", message: "" });
  const [messages, setMessages] = useState([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadMessages = async () => {
    const { data } = await api.get("/support/my-messages");
    setMessages(data.messages || []);
  };

  useEffect(() => {
    loadMessages().catch(() => setMessages([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    setSubmitting(true);

    try {
      await api.post("/support", form);
      setSuccess("Support message submitted. Our team will review it soon.");
      setForm({ subject: "", message: "" });
      loadMessages();
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not submit support message.",
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
            <HelpCircle size={16} /> Help & Support
          </span>
          <h1>Need help using LifeDrop?</h1>
          <p>
            Submit your issue, question, or feedback. Messages are stored in
            backend database.
          </p>
        </div>
      </div>

      <div className="container form-layout">
        <form className="profile-form glass-card" onSubmit={handleSubmit}>
          {success && <div className="alert success">{success}</div>}
          {error && <div className="alert error">{error}</div>}
          <label>
            Subject
            <input
              value={form.subject}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, subject: e.target.value }))
              }
              required
            />
          </label>
          <label>
            Message
            <textarea
              rows="6"
              value={form.message}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, message: e.target.value }))
              }
              required
            />
          </label>
          <button className="btn btn-primary btn-full" disabled={submitting}>
            {submitting ? "Sending..." : "Send Support Message"}
          </button>
        </form>

        <aside className="side-info glass-card">
          <h3>Contact options</h3>
          <p>
            <PhoneCall size={18} /> Emergency helpline: 108 / local hospital
          </p>
          <p>
            <Mail size={18} /> support@lifedrop.local
          </p>
          <p>
            <MessageCircle size={18} /> Use this form for app related issues
          </p>
          <div className="tip-box">
            Note: For real emergency, always call hospital or official emergency
            service directly.
          </div>
        </aside>
      </div>

      <div className="container section-heading lower-heading">
        <span className="eyebrow">
          <MessageCircle size={16} /> Your Messages
        </span>
        <h2>Support history</h2>
      </div>
      <div className="container support-list">
        {messages.length > 0 ? (
          messages.map((item) => (
            <article className="support-item glass-card" key={item._id}>
              <div>
                <h3>{item.subject}</h3>
                <p>{item.message}</p>
              </div>
              <span>{item.status}</span>
            </article>
          ))
        ) : (
          <div className="empty-state glass-card">No support messages yet.</div>
        )}
      </div>
    </section>
  );
};

export default HelpSupport;
