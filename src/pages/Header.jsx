import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom"; // Use Link for better navigation
import '../styles/Header.css';
import { useAuth } from '../context/AuthContext'; // 1. Import the custom hook

function Header() {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth(); // 2. Get global state from context
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

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
    navigate(isLoggedIn ? '/visit-library' : '/signin');
  };

  const handleLogout = () => {
    logout(); // 3. Use the logout function from context
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link className="header-logo-link" to="/">
          <img src="/images/acc_logo.png" alt="Logo" className="logo" />
          <span className="school-name">ASIAN COMPUTER COLLEGE</span>
        </Link>

        <div className="nav-items">
          <Link to="/" className="home nav-item">Home</Link>
          <Link to="/browse-books" className="browse-books-link nav-item">Browse Books</Link>
          <Link to="/contact" className="contact nav-item">Contact</Link>
          <Link to="/faqs" className="faqs nav-item">FAQs</Link>
        </div>

        <div className="profile-container" ref={dropdownRef}>
          <button className="btn-primary" id="visit-library-btn" onClick={handleVisitLibraryClick}>Visit Library</button>
          
          {isLoggedIn ? (
            <div className="profile" onClick={toggleDropdown}>
              <img src="/images/guest-icon.png" alt="Profile" className={`profile-icon ${dropdownOpen ? "profile-active" : ""}`} />
              {dropdownOpen && (
                <ul className="dropdown-menu">
                  {/* 4. Display the actual user's name from the context! */}
                  <li className="welcome-text">Welcome, {user.name}</li>
                  <li onClick={handleLogout}>Logout</li>
                </ul>
              )}
            </div>
          ) : (
            <div className="profile" onClick={toggleDropdown}>
              <img src="/images/guest-icon.png" alt="Guest" className={`profile-icon ${dropdownOpen ? "profile-active" : ""} guest`} />
              {dropdownOpen && (
                <ul className="dropdown-menu">
                  <li>You are accessing the library as Guest</li>
                  <li onClick={() => navigate("/signin")}>Sign in</li>
                  <li onClick={() => navigate("/signup")}>Sign up</li>
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;