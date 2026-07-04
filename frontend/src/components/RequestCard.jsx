import { AlertTriangle, Building2, Droplet, MapPin, Phone } from "lucide-react";

const RequestCard = ({ request }) => {
  return (
    <article className="request-card glass-card">
      <div className="request-head">
        <span className={`urgency urgency-${request.urgency?.toLowerCase()}`}>
          {request.urgency}
        </span>
        <strong>
          {request.units} unit{request.units > 1 ? "s" : ""}
        </strong>
      </div>
      <h3>{request.patientName}</h3>
      <div className="donor-meta">
        <span>
          <Droplet size={16} /> {request.bloodGroup}
        </span>
        <span>
          <Building2 size={16} /> {request.hospitalName}
        </span>
        <span>
          <MapPin size={16} /> {request.city}
        </span>
        <span>
          <Phone size={16} /> {request.contactNumber}
        </span>
      </div>
      {request.message && (
        <p className="request-message">
          <AlertTriangle size={16} /> {request.message}
        </p>
      )}
    </article>
  );
};

export default RequestCard;
