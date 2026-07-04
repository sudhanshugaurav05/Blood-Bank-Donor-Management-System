import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LockKeyhole, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const user = await login(form);
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "donor") {
        navigate("/donate");
      } else {
        navigate("/need-blood");
      }
      navigate(user.role === "donor" ? "/donate" : "/need-blood");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your details.",
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
            After login, donors can update availability and patients can post
            blood requests.
          </p>
        </div>

        <form className="auth-form glass-card" onSubmit={handleSubmit}>
          <h2>Login</h2>
          {error && <div className="alert error">{error}</div>}
          <label>
            Email
            <input
              type="text"
              value={form.email}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, email: e.target.value }))
              }
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, password: e.target.value }))
              }
              required
            />
          </label>
          <button className="btn btn-primary btn-full" disabled={submitting}>
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
