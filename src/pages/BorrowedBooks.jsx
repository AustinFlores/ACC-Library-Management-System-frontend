import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { useAuth } from '../context/AuthContext';
import '../styles/StudentDashboard.css';
import '../styles/BorrowedBooks.css';

function BorrowedBooks() {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const URL = "https://acc-library-management-system-backend-1.onrender.com";

  useEffect(() => {
    const fetchData = async () => {
      if (!isLoggedIn || !user || user.role !== 'student' || !user.id) {
        setError('You are not authorized or logged in as a student.');
        setLoading(false);
        if (!isLoggedIn) navigate('/signin', { replace: true });
        else if (user.role !== 'student') navigate('/student/dashboard', { replace: true });
        return;
      }

      try {
        setLoading(true);
        const [borrowedRes, requestRes] = await Promise.all([
          axios.get(`${URL}/api/student/borrowed-books?studentId=${user.id}`),
          axios.get(`${URL}/api/borrow/request?studentId=${user.id}`)
        ]);

        if (!borrowedRes.data.success) throw new Error(borrowedRes.data.error);
        if (!requestRes.data.success) throw new Error(requestRes.data.error);

        setBorrowedBooks(borrowedRes.data.books);
        setBorrowRequests(requestRes.data.requests);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isLoggedIn, user, navigate]);

  if (loading) {
    return (
      <div className="student-dashboard-page">
        <Header />
        <div className="student-dashboard-container">
          <p className="loading-message">Loading your borrowed books...</p>
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
      <div className="borrowed-books-page">
        <div className="borrowed-books-container">
          {/* Borrowed Books Section */}
          <h1 className="borrowed-books-title">Your Books on Loan</h1>
          <p className="borrowed-books-description">
            Here are the books you currently have borrowed from the library.
          </p>

          {borrowedBooks.length === 0 ? (
            <p className="no-borrowed-books">You currently have no books on loan.</p>
          ) : (
            <div className="borrowed-books-table-wrapper">
              <div className="borrowed-books-list">
                <div className="borrowed-book-header">
                  <div className="header-title">Book Title</div>
                  <div className="header-author">Author</div>
                  <div className="header-borrow-date">Borrowed Date</div>
                  <div className="header-due-date">Due Date</div>
                  <div className="header-status">Status</div>
                </div>

                {borrowedBooks.map((book) => {
                  const isOverdue =
                    book.status === 'Borrowed' && new Date(book.dueDate) < new Date();
                  const statusClass = isOverdue ? 'overdue' : book.status.toLowerCase();

                  return (
                    <div key={book.borrowId} className="borrowed-book-row">
                      <div className="book-title">{book.title}</div>
                      <div className="book-author">{book.author}</div>
                      <div className="book-borrow-date">
                        {new Date(book.borrowDate).toLocaleDateString()}
                      </div>
                      <div className={`book-due-date ${isOverdue ? 'overdue-date' : ''}`}>
                        {new Date(book.dueDate).toLocaleDateString()}
                      </div>
                      <div className={`book-status ${statusClass}`}>
                        {isOverdue ? 'Overdue' : book.status}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Borrow Requests Section */}
          <h2 className="borrow-requests-title">Your Borrow Requests</h2>
          <p className="borrowed-books-description">
            Below are your recent book borrow requests.
          </p>

          {borrowRequests.length === 0 ? (
            <p className="no-borrowed-books">You have no pending or processed requests.</p>
          ) : (
            <div className="borrow-requests-table-wrapper">
              <div className="borrow-requests-list">
                <div className="borrowed-book-header">
                  <div className="header-title">Book Title</div>
                  <div className="header-author">Author</div>
                  <div className="header-date">Pickup Date</div>
                  <div className="header-time">Pickup Time</div>
                  <div className="header-status">Request Status</div>
                  <div className="header-requested-at">Requested At</div>
                </div>

                {borrowRequests.map((req) => (
                  <div key={req.id} className="borrowed-book-row">
                    <div className="book-title">{req.title}</div>
                    <div className="book-author">{req.author}</div>
                    <div className="book-borrow-date">
                      {req.pickup_date
                        ? new Date(req.pickup_date).toLocaleDateString()
                        : '—'}
                    </div>
                    <div className="book-due-date">{req.pickup_time || '—'}</div>
                    <div className={`book-status ${req.request_status.toLowerCase()}`}>
                      {req.request_status}
                    </div>
                    <div className="book-borrow-date">
                      {new Date(req.requested_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default BorrowedBooks;
