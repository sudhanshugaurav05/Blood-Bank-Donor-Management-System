import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <section className="section center-section">
      <div className="empty-state glass-card">
        <h1>404</h1>
        <p>Page not found.</p>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    </section>
  );
};

export default NotFound;
