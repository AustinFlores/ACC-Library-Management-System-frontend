import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/AdminDashboard.css';
import Sidebar from './Sidebar';


function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const URL = "https://acc-library-management-system-backend-1.onrender.com";

  // Setting initial tab to 'students' to match the new image.
  // If you always want 'librarians' to be active on load, keep it as 'librarians'.
  const [activeTab, setActiveTab] = useState('students'); 

  // --- STUDENTS STATE --- (unchanged)
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentsError, setStudentsError] = useState(null);

  // --- LIBRARIANS STATE --- (unchanged)
  const [librarians, setLibrarians] = useState([]);
  const [librariansLoading, setLibrariansLoading] = useState(true);
  const [librariansError, setLibrariansError] = useState(null);
  const [newLibrarian, setNewLibrarian] = useState({ name: '', email: '', password: '' });

  // --- Authorization Check --- (unchanged)
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      alert('You are not authorized to access this page.');
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // --- FETCH STUDENTS --- (unchanged)
  useEffect(() => {
    const fetchStudents = async () => {
      setStudentsLoading(true);
      setStudentsError(null);
      try {
        const res = await axios.get(`${URL}/api/students`);
        if (res.data.success) {
          setStudents(res.data.students);
        } else {
          throw new Error(res.data.message || 'Failed to fetch students.');
        }
      } catch (err) {
        console.error('Error fetching students:', err);
        setStudentsError(err.message || 'Error fetching students.');
      } finally {
        setStudentsLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // --- FETCH LIBRARIANS --- (unchanged)
  useEffect(() => {
    const fetchLibrarians = async () => {
      setLibrariansLoading(true);
      setLibrariansError(null);
      try {
        const res = await axios.get(`${URL}/api/librarians`);
        if (res.data.success) {
          setLibrarians(res.data.librarians);
        } else {
          throw new Error(res.data.message || 'Failed to fetch librarians.');
        }
      } catch (err) {
        console.error('Error fetching librarians:', err);
        setLibrariansError(err.message || 'Error fetching librarians.');
      } finally {
        setLibrariansLoading(false);
      }
    };
    fetchLibrarians();
  }, []);

  // --- STUDENT ACTIONS --- (unchanged)
  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm(`Are you sure you want to delete student ${studentId}?`)) return;
    try {
      const res = await axios.delete(`${URL}/api/students/${studentId}`);
      if (res.data.success) {
        setStudents(prev => prev.filter(s => s.id !== studentId));
        alert(`Student ${studentId} deleted successfully.`);
      } else {
        throw new Error(res.data.message || 'Failed to delete student.');
      }
    } catch (err) {
      console.error('Error deleting student:', err);
      alert('Error deleting student: ' + (err.response?.data?.error || err.message));
    }
  };

  // --- LIBRARIAN ACTIONS --- (unchanged)
  const handleNewLibrarianChange = (e) => {
    const { name, value } = e.target;
    setNewLibrarian(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateLibrarian = async (e) => {
    e.preventDefault();
    const { name, email, password } = newLibrarian;
    if (!name || !email || !password) {
      alert('Please fill all fields to create a librarian.');
      return;
    }
    try {
      const res = await axios.post(`${URL}/api/librarians`, { name, email, password });
      if (res.data.success) {
        setLibrarians(prev => [...prev, res.data.librarian]);
        setNewLibrarian({ name: '', email: '', password: '' });
        alert('Librarian created successfully.');
      } else {
        throw new Error(res.data.message || 'Failed to create librarian.');
      }
    } catch (err) {
      console.error('Error creating librarian:', err);
      alert('Error creating librarian: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteLibrarian = async (librarianId) => {
    if (!window.confirm(`Are you sure you want to delete librarian ${librarianId}?`)) return;
    try {
      const res = await axios.delete(`${URL}/api/librarians/${librarianId}`);
      if (res.data.success) {
        setLibrarians(prev => prev.filter(l => l.id !== librarianId));
        alert('Librarian deleted successfully.');
      } else {
        throw new Error(res.data.message || 'Failed to delete librarian.');
      }
    } catch (err) {
      console.error('Error deleting librarian:', err);
      alert('Error deleting librarian: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    
    <div className="admin-dashboard-container">
      <div className="admin-dashboard-content">
      <h1 className="dashboard-header">Admin Dashboard</h1>
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
      <div className="tab-buttons">
        <button onClick={() => setActiveTab('students')} className={activeTab === 'students' ? 'active' : ''}>
          Manage Students
        </button>
        <button onClick={() => setActiveTab('librarians')} className={activeTab === 'librarians' ? 'active' : ''}>
          Manage Librarians
        </button>
      </div>

      {/* --- STUDENTS TAB --- (unchanged from previous grid solution) */}
      {activeTab === 'students' && (
        <div className="tab-content">
          <h2>Manage Students</h2>
          {studentsLoading ? (
            <p>Loading students...</p>
          ) : studentsError ? (
            <p className="error-message">{studentsError}</p>
          ) : (
            <div className="data-grid-container">
              <div className="student-grid-wrapper"> {/* Specific wrapper for student grid */}
                <div className="grid-header-row">
                  <div className="grid-cell grid-header-cell">ID</div>
                  <div className="grid-cell grid-header-cell">Name</div>
                  <div className="grid-cell grid-header-cell">Email</div>
                  <div className="grid-cell grid-header-cell">Course</div>
                  <div className="grid-cell grid-header-cell">Year Level</div>
                  <div className="grid-cell grid-header-cell">Actions</div>
                </div>
                {students.length === 0 ? (
                  <div className="grid-data-row no-records-row">
                    <div className="grid-cell grid-colspan-6">No student records found.</div>
                  </div>
                ) : (
                  students.map(student => (
                    <div className="grid-data-row" key={student.id}>
                      <div className="grid-cell">{student.id}</div>
                      <div className="grid-cell">{student.name}</div>
                      <div className="grid-cell">{student.email}</div>
                      <div className="grid-cell">{student.course}</div>
                      <div className="grid-cell">{student.year_level}</div>
                      <div className="grid-cell">
                        <button
                          className="delete-button"
                          onClick={() => handleDeleteStudent(student.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- LIBRARIANS TAB --- (MODIFIED TO BE A VERTICAL GRID) */}
      {activeTab === 'librarians' && (
        <div className="tab-content">
          <h2>Create New Librarian</h2>
          <form onSubmit={handleCreateLibrarian} className="create-librarian-form">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={newLibrarian.name}
              onChange={handleNewLibrarianChange}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={newLibrarian.email}
              onChange={handleNewLibrarianChange}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={newLibrarian.password}
              onChange={handleNewLibrarianChange}
            />
            <button type="submit" className="create-librarian-button">Create Librarian</button>
          </form>

          <h2>Existing Librarians</h2>
          {librariansLoading ? (
            <p>Loading librarians...</p>
          ) : librariansError ? (
            <p className="error-message">{librariansError}</p>
          ) : (
            <div className="data-grid-container">
              <div className="librarian-grid-wrapper"> {/* NOW A VERTICAL GRID WRAPPER */}
                <div className="grid-header-row">
                  <div className="grid-cell grid-header-cell">ID</div>
                  <div className="grid-cell grid-header-cell">Name</div>
                  <div className="grid-cell grid-header-cell">Email</div>
                  <div className="grid-cell grid-header-cell">Actions</div>
                </div>
                {librarians.length === 0 ? (
                  <div className="grid-data-row no-records-row">
                    <div className="grid-cell grid-colspan-4">No librarian accounts found.</div>
                  </div>
                ) : (
                  librarians.map(lib => (
                    <div className="grid-data-row" key={lib.id}>
                      <div className="grid-cell">{lib.id}</div>
                      <div className="grid-cell">{lib.name}</div>
                      <div className="grid-cell">{lib.email}</div>
                      <div className="grid-cell">
                        <button
                          className="delete-button"
                          onClick={() => handleDeleteLibrarian(lib.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
    </div>
  );
}

export default AdminDashboard;