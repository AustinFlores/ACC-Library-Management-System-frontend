import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/LibrarianDashboard.css'; // Shared dashboard styles

function ViewBookings() {
  const { user } = useAuth(); // For authorization check
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Authorization Check ---
  useEffect(() => {
    if (!user || user.role !== 'librarian' && user.role !== 'admin') {
      setError('You are not authorized to access this page.');
      setTimeout(() => navigate('/librarian/dashboard', { replace: true }), 3000); // Redirect unauthorized
    }
  }, [user, navigate]);

  // --- Fetch Bookings ---
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        // Assume you have an API endpoint like /api/bookings
        const response = await axios.get('/api/bookings'); 
        if (response.data.success) {
          setBookings(response.data.bookings);
        } else {
          throw new Error(response.data.message || 'Failed to fetch bookings.');
        }
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError(err.message || 'An error occurred while fetching bookings.');
      } finally {
        setLoading(false);
      }
    };

    if (user && (user.role === 'librarian' || user.role === 'admin')) { // Only fetch if authorized
      fetchBookings();
    }
  }, [user]); // Refetch if user changes

  // --- Booking Actions ---
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    if (!window.confirm(`Are you sure you want to mark booking ${bookingId} as ${newStatus}?`)) return;
    try {
      // Assume API endpoint POST /api/bookings/update-status
      const response = await axios.post('/api/bookings/update-status', {
        bookingId,
        newStatus,
      });
      if (response.data.success) {
        setBookings(prevBookings =>
          prevBookings.map(booking =>
            booking.id === bookingId ? { ...booking, request_status: newStatus } : booking
          )
        );
        alert(`Booking ${bookingId} status updated to ${newStatus}.`);
      } else {
        throw new Error(response.data.message || 'Failed to update booking status.');
      }
    } catch (err) {
      console.error('Error updating booking status:', err);
      alert('Error updating booking status: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) {
    return <div className="admin-page-content"><p className="loading-message">Loading bookings...</p></div>;
  }

  if (error) {
    return <div className="admin-page-content"><p className="error-message">{error}</p></div>;
  }

  console.log(bookings.map(booking => booking.date));

  return (
    <div className="admin-page-content">
      <h1 className="dashboard-header">View Bookings</h1>
      <p className="page-description">Review and manage scheduled library visits.</p>

      <div className="data-table-container">
        <table className="data-table bookings-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Student Name</th>
              <th>Email</th>
              <th>Date</th>
              <th>Time Slot</th>
              <th>Purpose</th>
              <th>Status</th>
              <th>Requested At</th>
     
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-records-found">No booking records found.</td>
              </tr>
            ) : (
              bookings.map(booking => (
                <tr key={booking.id}>
                  <td>{booking.id}</td>
                  <td>{booking.name}</td> {/* Assuming 'name' is part of booking data */}
                  <td>{booking.email}</td>
                  <td>{new Date(booking.date).toLocaleDateString()}</td>
                  <td>{booking.timeSlot}</td>
                  <td>{booking.purpose}</td>
                  <td>{booking.status}</td>
                  <td>{new Date(booking.createdAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ViewBookings;