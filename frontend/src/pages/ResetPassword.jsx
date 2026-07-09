import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import api from "../api/axios.js";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Password and confirm password do not match.");
      return;
    }

    setSubmitting(true);

    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, {
        password: form.password,
      });

      setMessage(data.message || "Password reset successfully.");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Password reset failed. Link may be expired."
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
            <LockKeyhole size={16} /> Reset Password
          </span>

          <h1>Create a new password</h1>

          <p>
            Enter your new password. After successful reset, login again with
            your new password.
          </p>
        </div>

        <form className="auth-form glass-card" onSubmit={handleSubmit}>
          <h2>Reset Password</h2>

          {message && <div className="alert success">{message}</div>}
          {error && <div className="alert error">{error}</div>}

          <label>
            <span className="label-title">
              New Password <b className="required-star">*</b>
            </span>

            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                placeholder="Enter new password"
                required
              />

              <button
                type="button"
                className="password-eye"
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <label>
            <span className="label-title">
              Confirm Password <b className="required-star">*</b>
            </span>

            <div className="password-field">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(e) =>
                  updateField("confirmPassword", e.target.value)
                }
                placeholder="Confirm new password"
                required
              />

              <button
                type="button"
                className="password-eye"
                onClick={() =>
                  setShowConfirmPassword((value) => !value)
                }
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </label>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={submitting}
          >
            {submitting ? "Resetting..." : "Reset Password"}
          </button>

          <p className="auth-bottom">
            Back to <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </section>
  );
};

export default ResetPassword;