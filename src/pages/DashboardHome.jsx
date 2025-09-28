import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/LibrarianDashboard.css';

// Define a polling interval (e.g., every 10 seconds)
const POLLING_INTERVAL_MS = 10000; // 10 seconds

function DashboardHome() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    borrowedBooks: 0,
    activeStudents: 0,
    visitsToday: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [overdueBooks, setOverdueBooks] = useState([]);
  const [pendingBorrowRequests, setPendingBorrowRequests] = useState([]);

  // Consolidate loading/error states for a cleaner UI if desired, or keep separate
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [errorDashboard, setErrorDashboard] = useState(null);
  const URL = "https://acc-library-management-system-backend-1.onrender.com";

  // --- Fetch All Dashboard Data ---
  const fetchDashboardData = async (showLoading = true) => { // Added showLoading param
    if (showLoading) setLoadingDashboard(true);
    setErrorDashboard(null);

    try {
      // Fetch core stats
      const statsRes = await axios.get(`${URL}/api/librarian/stats`);
      if (statsRes.data.success !== undefined && !statsRes.data.success) {
          throw new Error(statsRes.data.error || 'Failed to fetch statistics');
      }
      setStats(statsRes.data);

      // Fetch recent activity
      const activityRes = await axios.get(`${URL}/api/librarian/recent-activity`);
      if (activityRes.data.success !== undefined && !activityRes.data.success) {
          throw new Error(activityRes.data.error || 'Failed to fetch recent activity');
      }
      setRecentActivity(activityRes.data.activity);
      // console.log(activityRes.data.activity); // Keep for debugging if needed

      // Fetch overdue books
      const overdueRes = await axios.get(`${URL}/api/librarian/overdue-books`);
      if (overdueRes.data.success !== undefined && !overdueRes.data.success) {
          throw new Error(overdueRes.data.error || 'Failed to fetch overdue books');
      }
      setOverdueBooks(overdueRes.data.books);

      // Fetch pending borrow requests
      const pendingRes = await axios.get(`${URL}/api/librarian/pending-borrows`);
      if (pendingRes.data.success !== undefined && !pendingRes.data.success) {
          throw new Error(pendingRes.data.error || 'Failed to fetch pending borrow requests');
      }
      setPendingBorrowRequests(pendingRes.data.requests);

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      // Only set error if it's the initial load, or a significant failure
      if (showLoading) setErrorDashboard(err.message || 'An unexpected error occurred while fetching dashboard data.');
    } finally {
      if (showLoading) setLoadingDashboard(false);
    }
  };

  // --- Initial Data Fetch and Polling Setup ---
  useEffect(() => {
    // 1. Initial fetch when component mounts
    fetchDashboardData(true); 

    // 2. Set up polling
    const intervalId = setInterval(() => {
      // Fetch data without showing full loading state again (for smoother UX)
      fetchDashboardData(false); 
    }, POLLING_INTERVAL_MS);

    // 3. Cleanup: Clear interval when component unmounts
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array: runs once on mount, cleans up on unmount


  // --- Handle Borrow Request Actions (Accept/Reject) ---
  const handleBorrowRequestAction = async (requestId, actionType) => {
    if (!window.confirm(`Are you sure you want to ${actionType} this borrow request?`)) {
      return;
    }

    try {
      // Temporarily disable buttons or show a specific action loading state
      setLoadingDashboard(true); // Disable all actions during update
      const response = await axios.post(`${URL}/api/librarian/borrow-requests/update-status`, {
        requestId,
        actionType, // 'Accept' or 'Reject'
      });

      if (response.data.success) {
        alert(response.data.message);
        fetchDashboardData(true); // Re-fetch all data to fully update the dashboard
      } else {
        throw new Error(response.data.message || 'Failed to update request status.');
      }
    } catch (err) {
      console.error(`Error ${actionType}ing borrow request:`, err);
      alert(`Error ${actionType}ing request: ` + (err.response?.data?.error || err.message));
    } finally {
        setLoadingDashboard(false); // Re-enable actions
    }
  };


  if (loadingDashboard) {
    return <div className="dashboard-content"><p className="loading-message">Loading dashboard...</p></div>;
  }

  if (errorDashboard) {
    return <div className="dashboard-content"><p className="error-message">{errorDashboard}</p></div>;
  }

  return (
    <div>
      <h1 className="dashboard-header">Dashboard Overview</h1>

      <div className="stat-cards-container">
        <div className="stat-card">
          <h2>Total Books</h2>
          <p>{stats.totalBooks}</p>
        </div>
        <div className="stat-card">
          <h2>Books on Loan</h2>
          <p>{stats.borrowedBooks}</p>
        </div>
        <div className="stat-card">
          <h2>Active Students</h2>
          <p>{stats.activeStudents}</p>
        </div>
        <div className="stat-card">
          <h2>Visits Today</h2>
          <p>{stats.visitsToday}</p>
        </div>
      </div>

      <div className="dashboard-sections-grid">
        <div className="dashboard-card recent-activity">
          <h2>Recent Borrow Activities</h2>
          {recentActivity.length === 0 ? (
            <p className="no-records">No recent activity.</p>
          ) : (
            <ul>
              {recentActivity.map((activity, index) => (
                <li key={activity.unique_id || index}>
                  {` ${activity.user} borrowed "${activity.item}" `}
                  <span className="activity-date">{new Date(activity.date).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pending Actions */}
        <div className="dashboard-card pending-actions">
          <h2>Pending Actions</h2>
          {overdueBooks.length === 0 && pendingBorrowRequests.length === 0 ? (
            <p className="no-records">No pending actions.</p>
          ) : (
            <>
              {overdueBooks.length > 0 && (
                <div className="pending-section overdue-books">
                  <h3>Overdue Books ({overdueBooks.length})</h3>
                  <ul>
                    {overdueBooks.map(book => (
                      <li key={book.id}>
                        <span className="book-title-small">{book.title}</span> by {book.student} (Due: {book.dueDate})
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {pendingBorrowRequests.length > 0 && (
                <div className="pending-section borrow-requests">
                  <h3>New Borrow Requests ({pendingBorrowRequests.length})</h3>
                  <ul>
                    {pendingBorrowRequests.map(request => (
                      <li key={request.id} className="pending-request-item">
                        <div>
                          {request.student} requests "{request.book}" (On: {request.requestedDate})
                        </div>
                        <div className="request-actions">
                          <button
                            className="btn-action accept-btn"
                            onClick={() => handleBorrowRequestAction(request.id, 'Accept')}
                            disabled={loadingDashboard} // Disable buttons while processing
                          >
                            {loadingDashboard ? '...' : 'Accept'}
                          </button>
                          <button
                            className="btn-action reject-btn"
                            onClick={() => handleBorrowRequestAction(request.id, 'Reject')}
                            disabled={loadingDashboard} // Disable buttons while processing
                          >
                            {loadingDashboard ? '...' : 'Reject'}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;