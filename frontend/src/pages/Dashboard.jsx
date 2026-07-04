import { Link } from "react-router-dom";
import {
  BadgeCheck,
  Droplets,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <section className="section light-section">
      <div className="container dashboard-header">
        <div>
          <span className="eyebrow">
            <UserRound size={16} /> Dashboard
          </span>
          <h1>Hello, {user?.name}</h1>
          <p>
            Your role is <strong>{user?.role}</strong>. Manage your activity
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
            style={{ background: user?.avatarColor || "#ef4444" }}
          >
            {user?.name?.charAt(0)}
          </div>
          <h2>{user?.name}</h2>
          <p>
            {user?.role === "donor"
              ? "Blood Donor"
              : "Patient / Blood Requester"}
          </p>
          <div className="profile-meta">
            <span>
              <Mail size={17} /> {user?.email}
            </span>
            <span>
              <Phone size={17} /> {user?.phone}
            </span>
            <span>
              <Droplets size={17} /> {user?.bloodGroup}
            </span>
            <span>
              <MapPin size={17} /> {user?.city}
            </span>
          </div>
        </article>

        <article className="profile-card glass-card">
          <h2>Next Action</h2>
          {user?.role === "donor" ? (
            <>
              <p>
                Update your donor availability so patients can see you on
                homepage.
              </p>
              <Link className="btn btn-primary" to="/donate">
                Go to Donate Page
              </Link>
            </>
          ) : (
            <>
              <p>
                Create a new blood request and communicate with available
                donors.
              </p>
              <Link className="btn btn-primary" to="/need-blood">
                Go to Need Blood Page
              </Link>
            </>
          )}
        </article>
      </div>
    </section>
  );
};

export default Dashboard;
