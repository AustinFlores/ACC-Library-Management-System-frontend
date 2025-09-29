import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/AdminDashboard.css';


function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const URL = "https://acc-library-management-system-backend-1.onrender.com";

  const [activeTab, setActiveTab] = useState('students'); // 'students' or 'librarians'

  // --- STUDENTS STATE ---
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentsError, setStudentsError] = useState(null);

  // --- LIBRARIANS STATE ---
  const [librarians, setLibrarians] = useState([]);
  const [librariansLoading, setLibrariansLoading] = useState(true);
  const [librariansError, setLibrariansError] = useState(null);
  const [newLibrarian, setNewLibrarian] = useState({ name: '', email: '', password: '' });

  // --- Authorization Check ---
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      alert('You are not authorized to access this page.');
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // --- FETCH STUDENTS ---
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

  // --- FETCH LIBRARIANS ---
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

  // --- STUDENT ACTIONS ---
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

  // --- LIBRARIAN ACTIONS ---
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
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="tab-buttons">
        <button onClick={() => setActiveTab('students')} className={activeTab === 'students' ? 'active' : ''}>
          Manage Students
        </button>
        <button onClick={() => setActiveTab('librarians')} className={activeTab === 'librarians' ? 'active' : ''}>
          Manage Librarians
        </button>
      </div>

      {/* --- STUDENTS TAB --- */}
      {activeTab === 'students' && (
        <div className="tab-content">
          {studentsLoading ? (
            <p>Loading students...</p>
          ) : studentsError ? (
            <p className="error-message">{studentsError}</p>
          ) : (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Course</th>
                    <th>Year Level</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan="6">No student records found.</td>
                    </tr>
                  ) : (
                    students.map(student => (
                      <tr key={student.id}>
                        <td>{student.id}</td>
                        <td>{student.name}</td>
                        <td>{student.email}</td>
                        <td>{student.course}</td>
                        <td>{student.year_level}</td>
                        <td>
                          <button
                            className="delete-button"
                            onClick={() => handleDeleteStudent(student.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --- LIBRARIANS TAB --- */}
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
            <button type="submit" className="btn-primary">Create Librarian</button>
          </form>

          <h2>Existing Librarians</h2>
          {librariansLoading ? (
            <p>Loading librarians...</p>
          ) : librariansError ? (
            <p className="error-message">{librariansError}</p>
          ) : (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {librarians.length === 0 ? (
                    <tr>
                      <td colSpan="4">No librarian accounts found.</td>
                    </tr>
                  ) : (
                    librarians.map(lib => (
                      <tr key={lib.id}>
                        <td>{lib.id}</td>
                        <td>{lib.name}</td>
                        <td>{lib.email}</td>
                        <td>
                          <button
                            className="delete-button"
                            onClick={() => handleDeleteLibrarian(lib.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
