import { Link, NavLink, useNavigate } from "react-router-dom";
import { HeartPulse, LogOut, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useAndroidBackClose } from "../hooks/useAndroidBackClose.js";
import { useLanguage } from "../context/LanguageContext.jsx";
import logo from "../assets/logo.svg";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { language, changeLanguage, t } = useLanguage();

  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const closeMenu = () => {
    setOpen(false);
  };

  useAndroidBackClose(open, closeMenu);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/login");
  };

  const toggleLanguage = () => {
    changeLanguage(language === "en" ? "hi" : "en");
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        closeMenu();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const links = [
    { to: "/", label: t.home || "Home" },
    { to: "/why-need", label: language === "en" ? "Why Need" : "क्यों ज़रूरी" },
  ];

  if (user?.role === "admin") {
    links.push({ to: "/admin", label: t.adminPanel || "Admin Panel" });
  }

  if (user?.role === "donor") {
    links.push({ to: "/donate", label: t.donate || "Donate" });
  }

  if (user?.role === "patient") {
    links.push({ to: "/need-blood", label: t.needBlood || "Need Blood" });
  }

  if (user) {
    links.push({
      to: "/help-support",
      label: t.helpSupport || "Help & Support",
    });
  }

  return (
    <>
      {open && <div className="nav-backdrop" onClick={closeMenu} />}

      <header className="navbar-wrap">
        <nav className="navbar container">
          <Link className="brand" to="/" onClick={closeMenu}>
            <img src={logo} alt="LifeDrop Logo" />
            <span>LifeDrop</span>
          </Link>

          <button
            type="button"
            className="menu-btn"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div
            className={`nav-links ${open ? "show" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} onClick={closeMenu}>
                {link.label}
              </NavLink>
            ))}

            <button
              type="button"
              className={`language-switch ${language === "hi" ? "on" : ""}`}
              onClick={toggleLanguage}
              aria-label="Toggle language"
              title="Toggle language"
            >
              <span>{language === "en" ? "EN" : "HI"}</span>
              <i />
            </button>

            {user ? (
              <>
                <NavLink
                  to="/dashboard"
                  className="user-chip"
                  onClick={closeMenu}
                >
                  <HeartPulse size={18} /> {user.name?.split(" ")[0] || "User"}
                </NavLink>

                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleLogout}
                >
                  <LogOut size={17} /> {language === "en" ? "Logout" : "लॉगआउट"}
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" onClick={closeMenu}>
                  {t.login || "Login"}
                </NavLink>

                <Link
                  className="btn btn-primary"
                  to="/register"
                  onClick={closeMenu}
                >
                  {t.register || "Register"}
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>
    </>
  );
};

export default Navbar;