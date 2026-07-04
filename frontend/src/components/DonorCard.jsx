import { Droplet, MapPin, Phone, UserRoundCheck } from "lucide-react";

const DonorCard = ({ donor }) => {
  return (
    <article className="donor-card glass-card">
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
          <MapPin size={16} /> {donor.city}
        </span>
        <span>
          <Phone size={16} /> {donor.phone}
        </span>
        <span>
          <UserRoundCheck size={16} />{" "}
          {donor.isAvailable ? "Ready to help" : "Unavailable"}
        </span>
      </div>
    </article>
  );
};

export default DonorCard;
