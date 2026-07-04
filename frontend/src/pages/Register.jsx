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
};

const Register = () => {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const payload = { ...form, age: form.age ? Number(form.age) : undefined };
      const user = await register(payload);
      navigate(user.role === "donor" ? "/donate" : "/need-blood");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
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
            request blood quickly. After login you will be redirected to your
            role-based page.
          </p>
          <div className="auth-points">
            <span>
              <HeartHandshake size={18} /> Donor profile visible on homepage
            </span>
            <span>
              <HeartHandshake size={18} /> Patient can create blood requests
            </span>
            <span>
              <HeartHandshake size={18} /> JWT based secure login
            </span>
          </div>
        </div>

        <form className="auth-form glass-card" onSubmit={handleSubmit}>
          <h2>Register</h2>
          {error && <div className="alert error">{error}</div>}

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
          </div>

          {form.role === "donor" ? (
            <div className="form-grid two">
              <label>
                Age
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => updateField("age", e.target.value)}
                  min="18"
                  max="65"
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
              <label className="full">
                Address
                <input
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                />
              </label>
            </div>
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
            {submitting ? "Creating account..." : "Create Account"}
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
