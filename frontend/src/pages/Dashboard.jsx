import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Droplets,
  HeartHandshake,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const Dashboard = () => {
  const { user } = useAuth();

  const [profile, setProfile] = useState(user);
  const [profileCards, setProfileCards] = useState([]);
  const [myRequests, setMyRequests] = useState([]);

  const [adminStats, setAdminStats] = useState({
    donors: 0,
    patients: 0,
    requests: 0,
    camps: 0,
  });

  useEffect(() => {
    setProfile(user);
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [user?.role]);

  const loadDashboardData = async () => {
    try {
      const meRes = await api.get("/auth/me");
      const freshUser = meRes.data?.user || user;

      setProfile(freshUser);

      if (freshUser?.role === "patient") {
        const requestRes = await api.get("/requests/my");
        setMyRequests(requestRes.data?.requests || []);
      }

      if (freshUser?.role === "admin") {
        const [donorRes, patientRes, requestRes, campRes, cardRes] =
          await Promise.all([
            api.get("/admin/donors"),
            api.get("/admin/patients"),
            api.get("/admin/requests"),
            api.get("/admin/camps").catch(() => ({ data: { camps: [] } })),
            api
              .get("/auth/profile-cards")
              .catch(() => ({ data: { cards: [] } })),
          ]);

        const donors = donorRes.data?.donors || [];
        const patients = patientRes.data?.patients || [];

        setAdminStats({
          donors: donors.length,
          patients: patients.length,
          requests: requestRes.data?.requests?.length || 0,
          camps: campRes.data?.camps?.length || 0,
        });

        const cardsFromApi = cardRes.data?.cards || [];

        if (cardsFromApi.length > 0) {
          setProfileCards(cardsFromApi);
        } else {
          setProfileCards([
            ...donors.map((donor) => ({
              _id: donor._id,
              name: donor.name,
              bloodGroup: donor.bloodGroup,
              role: donor.role,
              city: donor.city,
              avatarColor: donor.avatarColor,
              isVerifiedDonor: donor.isVerifiedDonor,
            })),
            ...patients.map((patient) => ({
              _id: patient._id,
              name: patient.name,
              bloodGroup: patient.bloodGroup,
              role: patient.role,
              city: patient.city,
              avatarColor: patient.avatarColor,
              isVerifiedDonor: patient.isVerifiedDonor,
            })),
          ]);
        }
      } else {
        setProfileCards([]);
      }
    } catch (error) {
      console.log(
        "Dashboard load error:",
        error.response?.data || error.message
      );
    }
  };

  const getRoleLabel = () => {
    if (profile?.role === "donor") return "Blood Donor";
    if (profile?.role === "patient") return "Patient / Blood Requester";
    if (profile?.role === "admin") return "System Admin";
    return "User";
  };

  const getCardRoleLabel = (role) => {
    if (role === "donor") return "Donor";
    if (role === "patient") return "Patient";
    if (role === "admin") return "Admin";
    return "User";
  };

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

  const totalDonations = profile?.donationStats?.totalDonations || 0;
  const emergencyDonations = profile?.donationStats?.emergencyDonations || 0;
  const badges = profile?.donorBadges || [];

  return (
    <section className="section light-section">
      <div className="container dashboard-header">
        <div>
          <span className="eyebrow">
            <UserRound size={16} /> Dashboard
          </span>

          <h1>Hello, {profile?.name}</h1>

          <p>
            Your role is <strong>{profile?.role}</strong>. Manage your activity
            from here.
          </p>
        </div>

        <div className="status-pill">
          <BadgeCheck size={18} /> Authenticated User
        </div>
      </div>

      <div className="container profile-grid">
        <article className="profile-card glass-card">
          <div
            className="avatar big"
            style={{ background: profile?.avatarColor || "#ef4444" }}
          >
            {profile?.name?.charAt(0)}
          </div>

          <h2>{profile?.name}</h2>
          <p>{getRoleLabel()}</p>

          <div className="profile-meta">
            <span>
              <Mail size={17} /> {profile?.email}
            </span>

            <span>
              <Phone size={17} /> {profile?.phone}
            </span>

            <span>
              <Droplets size={17} /> {profile?.bloodGroup}
            </span>

            <span>
              <MapPin size={17} /> {profile?.city}
            </span>
          </div>
        </article>

        <article className="profile-card glass-card">
          <h2>Next Action</h2>

          {profile?.role === "donor" && (
            <>
              <p>
                Update your donor availability, accept matched requests and
                register for blood camps.
              </p>

              <Link className="btn btn-primary" to="/donate">
                Go to Donate Page
              </Link>
            </>
          )}

          {profile?.role === "patient" && (
            <>
              <p>
                Create a new blood request and track donor response status from
                your Need Blood page.
              </p>

              <Link className="btn btn-primary" to="/need-blood">
                Go to Need Blood Page
              </Link>
            </>
          )}

          {profile?.role === "admin" && (
            <>
              <p>
                Verify donors, manage patient requests, update request status
                and create blood camps.
              </p>

              <Link className="btn btn-primary" to="/admin">
                Go to Admin Panel
              </Link>
            </>
          )}
        </article>
      </div>

      {profile?.role === "admin" && (
        <div className="container dashboard-extra-grid">
          <article className="glass-card stat-card">
            <Users size={28} />
            <h3>{adminStats.donors}</h3>
            <p>Total Donors</p>
          </article>

          <article className="glass-card stat-card">
            <UserRound size={28} />
            <h3>{adminStats.patients}</h3>
            <p>Total Patients</p>
          </article>

          <article className="glass-card stat-card">
            <Droplets size={28} />
            <h3>{adminStats.requests}</h3>
            <p>Blood Requests</p>
          </article>

          <article className="glass-card stat-card">
            <CheckCircle2 size={28} />
            <h3>{adminStats.camps}</h3>
            <p>Blood Camps</p>
          </article>
        </div>
      )}

      {profile?.role === "admin" && (
        <div className="container dashboard-section-card glass-card">
          <div className="section-title compact-title">
            <span className="eyebrow">
              <Users size={16} /> Admin User Cards
            </span>

            <h2>Registered user cards</h2>

            <p>
              This section is visible only to admin. Donor and patient dashboard
              will not show registered user cards.
            </p>
          </div>

          {profileCards.length > 0 ? (
            <div className="dashboard-user-card-grid">
              {profileCards.map((item) => (
                <article className="dashboard-user-card" key={item._id}>
                  <div className="dashboard-user-top">
                    <div
                      className="avatar"
                      style={{ background: item.avatarColor || "#ef4444" }}
                    >
                      {item.name?.charAt(0)}
                    </div>

                    <div>
                      <h3>{item.name}</h3>
                      <p>{getCardRoleLabel(item.role)}</p>
                    </div>
                  </div>

                  <div className="card-basic-info">
                    <span>
                      <Droplets size={16} /> {item.bloodGroup || "N/A"}
                    </span>

                    <span>
                      <MapPin size={16} /> {item.city || "City not added"}
                    </span>

                    {item.role === "donor" && (
                      <span>
                        <ShieldCheck size={16} />{" "}
                        {item.isVerifiedDonor
                          ? "Verified Donor"
                          : "Verification Pending"}
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              No registered donor or patient found.
            </div>
          )}
        </div>
      )}

      {profile?.role === "donor" && (
        <div className="container dashboard-extra-grid">
          <article className="glass-card stat-card">
            <Trophy size={28} />
            <h3>{totalDonations}</h3>
            <p>Total Donations</p>
          </article>

          <article className="glass-card stat-card">
            <HeartHandshake size={28} />
            <h3>{emergencyDonations}</h3>
            <p>Emergency Donations</p>
          </article>

          <article className="glass-card stat-card">
            <ShieldCheck size={28} />
            <h3>{profile?.isVerifiedDonor ? "Verified" : "Pending"}</h3>
            <p>Donor Verification</p>
          </article>

          <article className="glass-card stat-card">
            <CalendarDays size={28} />
            <h3>
              {profile?.lastDonationDate
                ? new Date(profile.lastDonationDate).toLocaleDateString()
                : "Not Added"}
            </h3>
            <p>Last Donation Date</p>
          </article>
        </div>
      )}

      {profile?.role === "donor" && (
        <div className="container dashboard-section-card glass-card">
          <div className="section-title compact-title">
            <span className="eyebrow">
              <Award size={16} /> Rewards
            </span>

            <h2>Your donor badges</h2>

            <p>
              Badges are updated when admin marks an accepted blood request as
              completed.
            </p>
          </div>

          {badges.length > 0 ? (
            <div className="badge-list">
              {badges.map((badge) => (
                <span className="award-badge" key={badge}>
                  <Award size={16} /> {badge}
                </span>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              No badges yet. Accept and complete a donation request to earn your
              first badge.
            </div>
          )}
        </div>
      )}

      {profile?.role === "patient" && (
        <div className="container dashboard-section-card glass-card">
          <div className="section-title compact-title">
            <span className="eyebrow">
              <Droplets size={16} /> My Requests
            </span>

            <h2>Your blood request timeline</h2>

            <p>Track whether donor is found, contacted, completed or closed.</p>
          </div>

          {myRequests.length > 0 ? (
            <div className="dashboard-request-list">
              {myRequests.slice(0, 5).map((request) => (
                <article className="dashboard-request-card" key={request._id}>
                  <div>
                    <span className="blood-badge">{request.bloodGroup}</span>

                    <h3>{request.hospitalName}</h3>

                    <p>
                      <MapPin size={15} /> {request.city} • {request.units} unit
                    </p>
                  </div>

                  <span
                    className={`request-status-badge ${
                      request.isOpen ? request.status || "pending" : "closed"
                    }`}
                  >
                    {getStatusLabel(request.status, request.isOpen)}
                  </span>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              You have not created any blood request yet.
            </div>
          )}

          <Link className="btn btn-primary" to="/need-blood">
            View All Requests
          </Link>
        </div>
      )}
    </section>
  );
};

export default Dashboard;