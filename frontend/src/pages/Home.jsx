import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Droplets,
  HandHeart,
  Search,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import api from "../api/axios.js";
import DonorCard from "../components/DonorCard.jsx";
import RequestCard from "../components/RequestCard.jsx";
import heroImage from "../assets/hero-blood.svg";
import { useAuth } from "../context/AuthContext.jsx";

const bloodGroups = ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const Home = () => {
  const { user } = useAuth();

  const [donors, setDonors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [filters, setFilters] = useState({ bloodGroup: "", city: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showAuthPopup, setShowAuthPopup] = useState(false);

  const isLoggedIn = Boolean(user);

  const closeAuthPopup = () => {
    // localStorage.setItem("lifedropAuthPopupSeen", "true");
    setShowAuthPopup(false);
  };

  const loadData = async () => {
    if (!isLoggedIn) return;

    setLoading(true);
    setError("");

    try {
      const query = new URLSearchParams();

      if (filters.bloodGroup) query.set("bloodGroup", filters.bloodGroup);
      if (filters.city) query.set("city", filters.city);

      const [donorRes, requestRes] = await Promise.all([
        api.get(`/donors?${query.toString()}`),
        api.get("/requests"),
      ]);

      setDonors(donorRes.data.donors || []);
      setRequests(requestRes.data.requests || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load data. Please login again or check backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    } else {
      setDonors([]);
      setRequests([]);

      const popupSeen = localStorage.getItem("lifedropAuthPopupSeen");

      if (!popupSeen) {
        setShowAuthPopup(true);
      }
    }
  }, [isLoggedIn]);

  const stats = useMemo(() => {
    if (!isLoggedIn) {
      return [
        {
          icon: <Users />,
          value: "Locked",
          label: "Login to view donors",
        },
        {
          icon: <Droplets />,
          value: "Locked",
          label: "Login to view requests",
        },
        {
          icon: <Activity />,
          value: "24x7",
          label: "Emergency Support",
        },
      ];
    }

    return [
      { icon: <Users />, value: donors.length, label: "Available Donors" },
      { icon: <Droplets />, value: requests.length, label: "Open Requests" },
      { icon: <Activity />, value: "24x7", label: "Emergency Support" },
    ];
  }, [isLoggedIn, donors.length, requests.length]);

  return (
    <>
      {showAuthPopup && !isLoggedIn && (
        <div className="auth-popup-overlay">
          <div className="auth-popup-card glass-card">
            <button className="auth-popup-close" onClick={closeAuthPopup}>
              <X size={20} />
            </button>

            <span className="eyebrow">
              <ShieldCheck size={16} /> Login Required
            </span>

            <h2>Register or login to access blood donor data</h2>

            <p>
              To protect donor and patient information, you need to create an
              account or login before viewing donor counts, blood requests and
              available donor details.
            </p>

            <div className="auth-popup-actions">
              <Link to="/register" className="btn btn-primary">
                Register Now
              </Link>

              <Link to="/login" className="btn btn-soft">
                Login
              </Link>
            </div>

            <button className="popup-text-btn" onClick={closeAuthPopup}>
              Continue browsing without data
            </button>
          </div>
        </div>
      )}

      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-content">
            <span className="eyebrow">
              <ShieldCheck size={16} /> Trusted Blood Network
            </span>

            <h1>Donate blood today. Save someone’s tomorrow.</h1>

            <p>
              LifeDrop helps patients find available blood donors quickly.
              Donors and patients can register, login, communicate, and manage
              emergency blood support in one clean platform.
            </p>

            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-large">
                Join as Donor / Patient <ArrowRight size={18} />
              </Link>

              <Link to="/why-need" className="btn btn-soft btn-large">
                Why blood donation?
              </Link>
            </div>
          </div>

          <div className="hero-visual glass-card">
            <img src={heroImage} alt="Blood donation illustration" />

            <div className="floating-card card-one">
              <HandHeart size={20} /> One donation can help save lives
            </div>

            <div className="floating-card card-two">
              <Droplets size={20} /> O-, AB+, B+ donors active
            </div>
          </div>
        </div>
      </section>

      <section className="section stats-section">
        <div className="container stats-grid">
          {stats.map((item) => (
            <div className="stat-card glass-card" key={item.label}>
              <span>{item.icon}</span>
              <strong>{item.value}</strong>
              <p>{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container section-heading split-heading">
          <div>
            <span className="eyebrow">
              <Search size={16} /> Find Donors
            </span>

            <h2>Registered donors shown on homepage</h2>

            <p>
              Login is required to view available donors and filter donor data.
            </p>
          </div>

          {isLoggedIn && (
            <div className="filter-card glass-card">
              <select
                value={filters.bloodGroup}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    bloodGroup: e.target.value,
                  }))
                }
              >
                {bloodGroups.map((group) => (
                  <option key={group || "all"} value={group}>
                    {group || "All Blood Groups"}
                  </option>
                ))}
              </select>

              <input
                value={filters.city}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, city: e.target.value }))
                }
                placeholder="Search city"
              />

              <button className="btn btn-primary" onClick={loadData}>
                Search
              </button>
            </div>
          )}
        </div>

        <div className="container">
          {!isLoggedIn ? (
            <div className="empty-state glass-card locked-state">
              <h3>Donor information is protected</h3>
              <p>
                Please register or login to view available donors, donor count,
                city, phone number and blood group details.
              </p>

              <div className="locked-actions">
                <Link to="/register" className="btn btn-primary">
                  Register
                </Link>

                <Link to="/login" className="btn btn-soft">
                  Login
                </Link>
              </div>
            </div>
          ) : (
            <>
              {error && <div className="alert error">{error}</div>}

              {loading ? (
                <div className="loader-card">Loading donors...</div>
              ) : donors.length > 0 ? (
                <div className="cards-grid">
                  {donors.map((donor) => (
                    <DonorCard key={donor._id} donor={donor} />
                  ))}
                </div>
              ) : (
                <div className="empty-state glass-card">
                  No donor found. Register as a donor to display your profile
                  here.
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="section light-section">
        <div className="container section-heading">
          <span className="eyebrow">
            <Activity size={16} /> Live Help Board
          </span>

          <h2>Recent blood requests</h2>

          <p>Login is required to view patient blood requests.</p>
        </div>

        <div className="container cards-grid">
          {!isLoggedIn ? (
            <div className="empty-state glass-card locked-state">
              <h3>Blood requests are hidden</h3>

              <p>
                Please login or register to view recent blood requests and
                emergency patient requirements.
              </p>

              <div className="locked-actions">
                <Link to="/register" className="btn btn-primary">
                  Register
                </Link>

                <Link to="/login" className="btn btn-soft">
                  Login
                </Link>
              </div>
            </div>
          ) : requests.length > 0 ? (
            requests
              .slice(0, 3)
              .map((request) => (
                <RequestCard key={request._id} request={request} />
              ))
          ) : (
            <div className="empty-state glass-card">
              No open blood request yet.
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Home;