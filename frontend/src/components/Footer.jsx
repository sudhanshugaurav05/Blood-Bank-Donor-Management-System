import { HeartHandshake } from "lucide-react";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <div className="footer-brand">
            <HeartHandshake size={24} /> LifeDrop
          </div>
          <p>©2026 | LifeDrop by SG CREATION | Connecting donors and patients with speed, trust, and care.</p>
        </div>
        <div className="footer-grid">
          <span>24x7 Blood Support</span>
          <span>Verified Donor Profiles</span>
          <span>Emergency Request Flow</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
