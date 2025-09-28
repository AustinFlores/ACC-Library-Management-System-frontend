import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { useAuth } from '../context/AuthContext';
import '../styles/StudentDashboard.css'; // For general student dashboard styling
import '../styles/BorrowedBooks.css'; // Specific styling for this page

function BorrowedBooks() {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Authorization and Data Fetching ---
  useEffect(() => {
    const fetchBorrowedBooks = async () => {
      setLoading(true);
      setError(null);

      if (!isLoggedIn || !user || user.role !== 'student' || !user.id) {
        setError('You are not authorized or logged in as a student.');
        setLoading(false);
        // Optionally redirect if not authorized
        if (!isLoggedIn) navigate('/signin', { replace: true });
        else if (user.role !== 'student') navigate('/student/dashboard', { replace: true });
        return;
      }

      try {
        const response = await axios.get(`/api/student/borrowed-books?studentId=${user.id}`);
        if (response.data.success !== undefined && !response.data.success) {
          throw new Error(response.data.error || 'Failed to fetch borrowed books.');
        }
        setBorrowedBooks(response.data.books);
      } catch (err) {
        console.error('Error fetching borrowed books:', err);
        setError(err.message || 'An unexpected error occurred while fetching your borrowed books.');
      } finally {
        setLoading(false);
      }
    };

    fetchBorrowedBooks();
  }, [isLoggedIn, user, navigate]); // Re-fetch if login status or user data changes

  // Display error or loading state if authorization/data fetching fails
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
          <h1 className="borrowed-books-title">Your Books on Loan</h1>
          <p className="borrowed-books-description">Here are the books you currently have borrowed from the library.</p>

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
                const isOverdue = book.status === 'Borrowed' && new Date(book.dueDate) < new Date();
                const statusClass = isOverdue ? 'overdue' : book.status.toLowerCase();

                return (
                  <div key={book.borrowId} className="borrowed-book-row">
                    <div className="book-title">{book.title}</div>
                    <div className="book-author">{book.author}</div>
                    <div className="book-borrow-date">{new Date(book.borrowDate).toLocaleDateString()}</div>
                    <div className={`book-due-date ${isOverdue ? 'overdue-date' : ''}`}>
                        {new Date(book.dueDate).toLocaleDateString()}
                    </div>
                    <div className={`book-status ${statusClass}`}>{isOverdue ? 'Overdue' : book.status}</div>
         
                  </div>
                );
              })}
            </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default BorrowedBooks;