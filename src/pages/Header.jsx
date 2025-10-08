import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Header.css";
import { useAuth } from "../context/AuthContext";

function Header() {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleVisitLibraryClick = () => {
    navigate(isLoggedIn ? "/visit-library" : "/signin");
    closeMenu();
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    closeMenu();
    navigate("/");
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link className="header-logo-link" to="/" onClick={closeMenu}>
          <img src="/images/acc_logo.png" alt="Logo" className="logo" />
          <span className="school-name">ASIAN COMPUTER COLLEGE</span>
        </Link>

        <button className="hamburger" aria-label="Toggle Menu" onClick={toggleMenu}>
          ☰
        </button>


        <div className={`menu-wrapper ${menuOpen ? "show" : ""}`}>
          <nav className="nav-items">
            <Link to="/" className="nav-item" onClick={closeMenu}>Home</Link>
            <Link to="/browse-books" className="nav-item" onClick={closeMenu}>Browse Books</Link>
            <Link to="/contact" className="nav-item" onClick={closeMenu}>Contact</Link>
            <Link to="/faqs" className="nav-item" onClick={closeMenu}>FAQs</Link>
          </nav>

          <div className="profile-container" ref={dropdownRef}>
            <button className="btn-primary" id="visit-library-btn" onClick={handleVisitLibraryClick}>
              Visit Library
            </button>

            {isLoggedIn ? (
              <div className="profile" onClick={toggleDropdown}>
                <img
                  src="/images/guest-icon.png"
                  alt="Profile"
                  className={`profile-icon ${dropdownOpen ? "profile-active" : ""}`}
                />
                {dropdownOpen && (
                  <ul className="dropdown-menu">
                    <li className="welcome-text">Welcome, {user.name}</li>
                    <li onClick={handleLogout}>Logout</li>
                  </ul>
                )}
              </div>
            ) : (
              <div className="profile" onClick={toggleDropdown}>
                <img
                  src="/images/guest-icon.png"
                  alt="Guest"
                  className={`profile-icon ${dropdownOpen ? "profile-active" : ""} guest`}
                />
                {dropdownOpen && (
                  <ul className="dropdown-menu">
                    <li>You are accessing the library as Guest</li>
                    <li onClick={() => { navigate("/signin"); closeMenu(); }}>Sign in</li>
                    <li onClick={() => { navigate("/signup"); closeMenu(); }}>Sign up</li>
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
