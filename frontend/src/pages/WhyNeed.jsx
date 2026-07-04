import {
  Activity,
  Clock,
  Droplets,
  HeartPulse,
  Shield,
  UsersRound,
} from "lucide-react";
import bloodCells from "../assets/blood-cells.svg";

const reasons = [
  {
    icon: <HeartPulse />,
    title: "Emergency care",
    text: "Accident, surgery, childbirth, and critical care patients may need blood urgently.",
  },
  {
    icon: <UsersRound />,
    title: "Community support",
    text: "A donor network helps local people get support faster during difficult moments.",
  },
  {
    icon: <Clock />,
    title: "Time sensitive",
    text: "Finding the correct blood group quickly can reduce delays in treatment.",
  },
  {
    icon: <Shield />,
    title: "Safe coordination",
    text: "This project organizes donor and patient details in a simple and accessible way.",
  },
];

const WhyNeed = () => {
  return (
    <section className="section page-hero light-section">
      <div className="container why-grid">
        <div>
          <span className="eyebrow">
            <Droplets size={16} /> Why Need Blood?
          </span>
          <h1>Blood donation is a small action with life-changing power.</h1>
          <p>
            Patients may require blood during surgeries, emergencies, severe
            anemia, cancer treatment, pregnancy-related complications, and
            trauma cases. A digital donor system helps connect the right donor
            with the right patient at the right time.
          </p>
          
        </div>
        <div className="why-visual glass-card">
          <img src={bloodCells} alt="Blood cells illustration" />
        </div>
      </div>

      <div className="container reason-grid">
        {reasons.map((reason) => (
          <article className="reason-card glass-card" key={reason.title}>
            <span>{reason.icon}</span>
            <h3>{reason.title}</h3>
            <p>{reason.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default WhyNeed;
