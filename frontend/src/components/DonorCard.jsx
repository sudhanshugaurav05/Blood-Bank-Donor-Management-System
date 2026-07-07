import {
  Droplet,
  Lock,
  MapPin,
  Phone,
  UserRoundCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const DonorCard = ({ donor }) => {
  const { user } = useAuth();

  const loggedInUserId = String(user?._id || user?.id || "");
  const donorId = String(donor?._id || donor?.id || "");

  const isMyCard = loggedInUserId && donorId && loggedInUserId === donorId;

  return (
    <article
      className={`donor-card glass-card ${isMyCard ? "my-donor-card" : ""}`}
    >
      <div className="donor-top">
        <div
          className="avatar"
          style={{ background: donor.avatarColor || "#ef4444" }}
        >
          {donor.name?.charAt(0)}
        </div>

        <div>
          <h3>{donor.name}</h3>
          <p>{donor.role === "donor" ? "Available donor" : "Member"}</p>
        </div>
      </div>

      <div className="donor-meta">
        <span>
          <Droplet size={16} /> {donor.bloodGroup}
        </span>

        <span>
          <UserRoundCheck size={16} />{" "}
          {donor.isAvailable ? "Ready to donate" : "Unavailable"}
        </span>

        {isMyCard ? (
          <>
            <span>
              <MapPin size={16} /> {donor.city}
            </span>

            <span>
              <Phone size={16} /> {donor.phone}
            </span>
          </>
        ) : (
          <span className="private-card-note">
            <Lock size={16} /> Full details hidden
          </span>
        )}
      </div>
    </article>
  );
};

export default DonorCard;