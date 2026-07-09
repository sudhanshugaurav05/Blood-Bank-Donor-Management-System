import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      const payload = {
        email: form.email.trim(),
        password: form.password,
      };

      await login(payload);

      localStorage.removeItem("lifedropAuthPopupSeen");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Login failed. Please check your details."
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
            <LockKeyhole size={16} /> Welcome Back
          </span>

          <h1>Login to continue helping lives</h1>

          <p>
            After login, you will go to your dashboard where you can see your
            profile, blood group, activity, and next actions.
          </p>
        </div>

        <form className="auth-form glass-card" onSubmit={handleSubmit}>
          <h2>Login</h2>

          {error && <div className="alert error">{error}</div>}

          <label>
            <span className="label-title">
              Email or Username <b className="required-star">*</b>
            </span>

            <input
              type="text"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="Enter email or admin username"
              autoComplete="username"
              required
            />
          </label>

          <label>
            <span className="label-title">
              Password <b className="required-star">*</b>
            </span>

            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="password-eye"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <div className="forgot-row">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={submitting}
          >
            <LogIn size={18} /> {submitting ? "Logging in..." : "Login"}
          </button>

          <p className="auth-bottom">
            New user? <Link to="/register">Create account</Link>
          </p>
        </form>
      </div>
    </section>
  );
};

export default Login;