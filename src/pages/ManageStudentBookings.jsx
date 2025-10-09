import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { useAuth } from '../context/AuthContext';
import '../styles/StudentDashboard.css'; // For general student dashboard styling
import '../styles/ManageStudentBookings.css'; // Specific styling for this page

function ManageStudentBookings() {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const URL = "https://acc-library-management-system-backend-1.onrender.com";

  // --- Authorization and Data Fetching ---
  useEffect(() => {
    const fetchStudentBookings = async () => {
      setLoading(true);
      setError(null);

      if (!isLoggedIn || !user || user.role !== 'student' || !user.id || !user.email) {
        setError('You are not authorized or logged in as a student.');
        setLoading(false);
        if (!isLoggedIn) navigate('/signin', { replace: true });
        else if (user.role !== 'student') navigate('/student/dashboard', { replace: true });
        return;
      }

      try {
        // NEW API Endpoint: /api/student/bookings
        const response = await axios.get(`${URL}/api/student/bookings?studentEmail=${user.email}`);
        if (response.data.success !== undefined && !response.data.success) {
          throw new Error(response.data.error || 'Failed to fetch your bookings.');
        }
        setBookings(response.data.bookings);
      } catch (err) {
        console.error('Error fetching student bookings:', err);
        setError(err.message || 'An unexpected error occurred while fetching your bookings.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentBookings();
  }, [isLoggedIn, user, navigate]);

  // --- Booking Actions (e.g., Cancel Booking) ---
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      // Assuming a backend endpoint POST /api/bookings/cancel
      const response = await axios.post(`${URL}/api/bookings/cancel`, { bookingId });
      if (response.data.success) {
        setBookings(prevBookings => prevBookings.filter(b => b.id !== bookingId)); // Remove from list
        alert('Booking cancelled successfully!');
      } else {
        throw new Error(response.data.message || 'Failed to cancel booking.');
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert('Error cancelling booking: ' + (err.response?.data?.error || err.message));
    }
  };

  // Display error or loading state
  if (loading) {
    return (
      <div className="student-dashboard-page">
        <Header />
        <div className="student-dashboard-container">
          <p className="loading-message">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-dashboard-page">
        <Header />
        <div className="student-dashboard-container">
          <p className="error-message">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="manage-student-bookings-page">
        <div className="manage-student-bookings-container">
          <h1 className="manage-student-bookings-title">Your Active Appointments</h1>
          <p className="manage-student-bookings-description">
            Here are your upcoming and pending library visit schedules.
          </p>

          {bookings.length === 0 ? (
            <p className="no-bookings">You currently have no active appointments.</p>
          ) : (
            <div className="student-bookings-list">
              <div className="student-booking-header">
                <div className="header-date">Date</div>
                <div className="header-time">Time Slot</div>
                <div className="header-purpose">Purpose</div>
                <div className="header-status">Status</div>
                <div className="header-actions">Actions</div>
              </div>
              {bookings.map((booking) => (
                <div key={booking.id} className="student-booking-row">
                  <div className="booking-date">{new Date(booking.date).toLocaleDateString()}</div>
                  <div className="booking-time">{booking.timeSlot}</div>
                  <div className="booking-purpose">{booking.purpose}</div>
                  <div className={`booking-status ${booking.status}`}>
                    {booking.status}
                  </div>
                  <div className="booking-actions">
                    {booking.status === 'pending' && (
                      <button className="btn-action cancel-booking-btn" onClick={() => handleCancelBooking(booking.id)}>
                        Cancel
                      </button>
                    )}
                    {booking.status === 'confirmed' && (
                      <button className="btn-action view-details-btn" onClick={() => alert(`View details for booking ${booking.id}`)}>
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ManageStudentBookings;