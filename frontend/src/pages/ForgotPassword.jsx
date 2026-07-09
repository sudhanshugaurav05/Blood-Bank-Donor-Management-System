import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Send } from "lucide-react";
import api from "../api/axios.js";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setSubmitting(true);

    try {
      const { data } = await api.post("/auth/forgot-password", {
        email: email.trim(),
      });

      setMessage(data.message || "Password reset link sent to your email.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not send password reset email."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-section compact-auth">
      <div className="container auth-grid compact-grid">
        <div className="auth-info glass-card">
          <span className="eyebrow">
            <Mail size={16} /> Password Help
          </span>

          <h1>Forgot your password?</h1>

          <p>
            Enter your registered email. LifeDrop will send a password reset
            link to your email.
          </p>
        </div>

        <form className="auth-form glass-card" onSubmit={handleSubmit}>
          <h2>Forgot Password</h2>

          {message && <div className="alert success">{message}</div>}
          {error && <div className="alert error">{error}</div>}

          <label>
            <span className="label-title">
              Registered Email <b className="required-star">*</b>
            </span>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter registered email"
              required
            />
          </label>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={submitting}
          >
            <Send size={18} /> {submitting ? "Sending..." : "Send Reset Link"}
          </button>

          <p className="auth-bottom">
            Remember password? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </section>
  );
};

export default ForgotPassword;