import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/LibrarianDashboard.css';
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

function Sidebar() {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();
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

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-container">
        <NavLink className="header-logo-link" to="/">
          <img src="/images/acc_logo.png" alt="Logo" className="logo" />
          <span className="school-name">ASIAN COMPUTER COLLEGE</span>
        </NavLink>

        <nav className="sidebar-nav">
          <NavLink to="/librarian/dashboard" end>Dashboard</NavLink>
          <NavLink to="/browse-books">Manage Books</NavLink>
          <NavLink to="/librarian/manage-students">Manage Students</NavLink>
          <NavLink to="/librarian/view-bookings">View Bookings</NavLink>
          <NavLink to="/librarian/return-book">Return Book</NavLink>
          <NavLink to="/librarian/create-announcement">Create Announcement</NavLink>
        </nav>

        <div className="profile-container" ref={dropdownRef}>
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
                  <li onClick={() => navigate("/signin")}>Sign in</li>
                  <li onClick={() => navigate("/signup")}>Sign up</li>
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
