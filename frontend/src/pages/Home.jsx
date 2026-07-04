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
} from "lucide-react";
import api from "../api/axios.js";
import DonorCard from "../components/DonorCard.jsx";
import RequestCard from "../components/RequestCard.jsx";
import heroImage from "../assets/hero-blood.svg";

const bloodGroups = ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const Home = () => {
  const [donors, setDonors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [filters, setFilters] = useState({ bloodGroup: "", city: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
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
          "Unable to load data. Please start backend server.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = useMemo(
    () => [
      { icon: <Users />, value: donors.length, label: "Available Donors" },
      { icon: <Droplets />, value: requests.length, label: "Open Requests" },
      { icon: <Activity />, value: "24x7", label: "Emergency Support" },
    ],
    [donors.length, requests.length],
  );

  return (
    <>
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
              Any donor who registers and keeps availability active will appear
              here for patients.
            </p>
          </div>
          <div className="filter-card glass-card">
            <select
              value={filters.bloodGroup}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, bloodGroup: e.target.value }))
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
        </div>

        <div className="container">
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
              No donor found. Register as a donor to display your profile here.
            </div>
          )}
        </div>
      </section>

      <section className="section light-section">
        <div className="container section-heading">
          <span className="eyebrow">
            <Activity size={16} /> Live Help Board
          </span>
          <h2>Recent blood requests</h2>
          <p>Patients can post urgent blood requirements after login.</p>
        </div>
        <div className="container cards-grid">
          {requests.length > 0 ? (
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
