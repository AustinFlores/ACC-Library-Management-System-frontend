import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/LibrarianDashboard.css';
import '../styles/ManageStudents.css';

function ManageStudents() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const URL = "https://acc-library-management-system-backend-1.onrender.com";

  // --- Authorization Check ---
  useEffect(() => {
    if (!user || (user.role !== 'librarian')) {
      setError('You are not authorized to access this page.');
      setTimeout(() => navigate('/librarian/dashboard', { replace: true }), 3000);
    }
  }, [user, navigate]);

  // --- Fetch Students ---
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${URL}/api/students`);
        if (response.data.success) {
          setStudents(response.data.students);
        } else {
          throw new Error(response.data.message || 'Failed to fetch students.');
        }
      } catch (err) {
        console.error('Error fetching students:', err);
        setError(err.message || 'An error occurred while fetching students.');
      } finally {
        setLoading(false);
      }
    };

    if (user && (user.role === 'librarian')) {
      fetchStudents();
    }
  }, [user]);

  // --- Delete Student ---
  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm(`Are you sure you want to delete student ${studentId}?`)) return;

    try {
      const response = await axios.delete(`${URL}/api/students/${studentId}`);
      if (response.data.success) {
        setStudents(prevStudents =>
          prevStudents.filter(student => student.id !== studentId)
        );
        alert(`✅ Student ${studentId} deleted successfully.`);
      } else {
        throw new Error(response.data.message || 'Failed to delete student.');
      }
    } catch (err) {
      console.error('Error deleting student:', err);
      alert('❌ Error deleting student: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) {
    return <div className="librarian-page-content"><p className="loading-message">Loading students...</p></div>;
  }

  if (error) {
    return <div className="librarian-page-content"><p className="error-message">{error}</p></div>;
  }

  return (
    <div className="librarian-page-content">
      <h1 className="dashboard-header">Manage Students</h1>
      <p className="page-description">View and manage registered student accounts.</p>

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
                <td colSpan="6" className="no-records-found">No student records found.</td>
              </tr>
            ) : (
              students.map(student => (
                <tr key={student.id}>
                  <td>{student.id}</td>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.course}</td>
                  <td>{student.year_level}</td>
                  <td className="table-actions-cell">
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
    </div>
  );
}

export default ManageStudents;
