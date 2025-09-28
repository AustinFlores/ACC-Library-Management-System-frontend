import React, { useState, useEffect } from 'react';
import Header from './Header';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/StudentDashboard.css';

function StudentDashboard() {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    booksOnLoan: 0,
    overdueBooks: 0,
    activeBookings: 0,
  });
  const [announcements, setAnnouncements] = useState([]); 
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Fetch announcements separately ---
  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get('/api/announcements');
      if (res.data.success) {
        setAnnouncements(res.data.announcements);
      }
    } catch (err) {
      console.error("Error fetching announcements:", err);
    }
  };

  // --- Initial dashboard fetch ---
  useEffect(() => {
    const fetchStudentDashboardData = async () => {
      setLoading(true);
      setError(null);

      if (!isLoggedIn || !user || user.role !== 'student' || !user.id) {
        setError('You are not authorized or logged in as a student.');
        setLoading(false);
        if (!isLoggedIn) navigate('/signin', { replace: true });
        else if (user.role !== 'student') navigate('/', { replace: true });
        return;
      }

      try {
        // Fetch stats
        const statsResponse = await axios.get(`/api/student/dashboard-stats?studentId=${user.id}`);
        if (statsResponse.data.success !== undefined && !statsResponse.data.success) {
          throw new Error(statsResponse.data.error || 'Failed to fetch student statistics');
        }
        setStats(statsResponse.data);

        // Fetch recommendations
        const recResponse = await axios.get(`/api/student/recommendations?studentId=${user.id}`);
        if (recResponse.data.success !== undefined && !recResponse.data.success) {
          throw new Error(recResponse.data.error || 'Failed to fetch book recommendations');
        }
        setRecommendedBooks(recResponse.data.books);

        // Fetch announcements once at load
        await fetchAnnouncements();
      } catch (err) {
        console.error("Error fetching student dashboard data:", err);
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDashboardData();
  }, [isLoggedIn, user, navigate]);

  // --- Poll announcements every 5s ---
  useEffect(() => {
    const interval = setInterval(fetchAnnouncements, 5000);
    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  if (loading) {
    return (
      <div className="student-dashboard-page">
        <Header />
        <div className="student-dashboard-container">
          <p className="loading-message">Loading your dashboard...</p>
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
    <div className="student-dashboard-page">
      <Header />
      <div className="student-dashboard-container">
        <h1 className="student-dashboard-welcome">Welcome, {user ? user.name : 'Student'}!</h1>
        <p className="student-dashboard-subtitle">Your Library at a Glance</p>

        <div className="student-stats-grid">
          <div className="stat-card">
            <h2>Books on Loan</h2>
            <p>{stats.booksOnLoan}</p>
            <Link to="/student/borrowed-books" className="view-details-link">View Details</Link>
          </div>
          <div className="stat-card">
            <h2>Overdue Books</h2>
            <p className={stats.overdueBooks > 0 ? 'overdue' : ''}>{stats.overdueBooks}</p>
            <Link to="/student/overdue-books" className="view-details-link">View Details</Link>
          </div>
          <div className="stat-card">
            <h2>Active Bookings</h2>
            <p>{stats.activeBookings}</p>
            <Link to="/student/manage-bookings" className="view-details-link">Manage Bookings</Link>
          </div>
        </div>
        
        <div className="student-announcements-recommendations-container">
          <div className="student-announcements dashboard-card">
            <h2>Library Announcements</h2>
            <ul className="announcement-list">
              {announcements.length === 0 ? (
                <li>No recent announcements.</li>
              ) : (
                announcements.map(ann => (
                  <li key={ann.id}>
                    {ann.message}{" "}
                    <span className="announcement-date">
                      ({new Date(ann.created_at).toLocaleDateString()})
                    </span>
                  </li>
                ))
              )}
            </ul>
            <Link to="/announcements" className="view-details-link">
              View All Announcements
            </Link>
          </div>

          <div className="student-recommendations dashboard-card">
            <h2>Suggested Books</h2>
            <div className="recommended-books-grid">
              {recommendedBooks.length === 0 ? (
                <p className="no-records">No recommendations yet. Borrow some books!</p>
              ) : (
                recommendedBooks.map(book => (
                  <div key={book.id} className="recommended-book-card">
                    <p><strong>{book.title}</strong></p>
                    <p className="book-author-small">{book.author}</p>
                    <Link 
                      to="/borrow-request" 
                      state={{ book: { id: book.id, title: book.title, author: book.author, isbn: book.isbn, category: book.category } }}
                      className="btn-action borrow-recommendation-btn"
                    >
                      Borrow Now
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
