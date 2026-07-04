import { Link, NavLink, useNavigate } from "react-router-dom";
import { HeartPulse, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import logo from "../assets/logo.svg";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/login");
  };

  const links = [
    { to: "/", label: "Home" },
    { to: "/why-need", label: "Why Need" },
  ];

  if (user?.role === "admin")
    links.push({ to: "/admin", label: "Admin Panel" });
  if (user?.role === "donor") links.push({ to: "/donate", label: "Donate" });
  if (user?.role === "patient")
    links.push({ to: "/need-blood", label: "Need Blood" });
  if (user) links.push({ to: "/help-support", label: "Help & Support" });

  return (
    <header className="navbar-wrap">
      <nav className="navbar container">
        <Link className="brand" to="/" onClick={() => setOpen(false)}>
          <img src={logo} alt="LifeDrop Logo" />
          <span>LifeDrop</span>
        </Link>

        <button
          className="menu-btn"
          onClick={() => setOpen((value) => !value)}
          aria-label="Open menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`nav-links ${open ? "show" : ""}`}>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={() => setOpen(false)}>
              {link.label}
            </NavLink>
          ))}

          {user ? (
            <>
              <NavLink
                to="/dashboard"
                className="user-chip"
                onClick={() => setOpen(false)}
              >
                <HeartPulse size={18} /> {user.name.split(" ")[0]}
              </NavLink>
              <button className="btn btn-ghost" onClick={handleLogout}>
                <LogOut size={17} /> Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={() => setOpen(false)}>
                Login
              </NavLink>
              <Link
                className="btn btn-primary"
                to="/register"
                onClick={() => setOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
