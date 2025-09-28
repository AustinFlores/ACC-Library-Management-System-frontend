import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { useAuth } from '../context/AuthContext';
import '../styles/StudentDashboard.css'; // For general student dashboard styling
import '../styles/OverdueBooks.css'; // Specific styling for this page

function OverdueBooks() {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [overdueBooks, setOverdueBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Authorization and Data Fetching ---
  useEffect(() => {
    const fetchOverdueBooks = async () => {
      setLoading(true);
      setError(null);

      if (!isLoggedIn || !user || user.role !== 'student' || !user.id) {
        setError('You are not authorized or logged in as a student.');
        setLoading(false);
        if (!isLoggedIn) navigate('/signin', { replace: true });
        else if (user.role !== 'student') navigate('/student/dashboard', { replace: true });
        return;
      }

      try {
        const response = await axios.get(`/api/student/overdue-books?studentId=${user.id}`);
        if (response.data.success !== undefined && !response.data.success) {
          throw new Error(response.data.error || 'Failed to fetch overdue books.');
        }
        setOverdueBooks(response.data.books);
      } catch (err) {
        console.error('Error fetching overdue books:', err);
        setError(err.message || 'An unexpected error occurred while fetching your overdue books.');
      } finally {
        setLoading(false);
      }
    };

    fetchOverdueBooks();
  }, [isLoggedIn, user, navigate]);

  // Display error or loading state
  if (loading) {
    return (
      <div className="student-dashboard-page">
        <Header />
        <div className="student-dashboard-container">
          <p className="loading-message">Loading your overdue books...</p>
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
      <div className="overdue-books-page">
        <div className="overdue-books-container">
          <h1 className="overdue-books-title">Your Overdue Books</h1>
          <p className="overdue-books-description">
            Please return these books as soon as possible to avoid further fines.
          </p>

          {overdueBooks.length === 0 ? (
            <p className="no-overdue-books">You currently have no overdue books.</p>
          ) : (
            <div className="overdue-books-table-wrapper">
            <div className="overdue-books-list">
              <div className="overdue-book-header">
                <div className="header-title">Book Title</div>
                <div className="header-author">Author</div>
                <div className="header-borrow-date">Borrowed Date</div>
                <div className="header-due-date">Due Date</div>
                <div className="header-days-overdue">Days Overdue</div>
  
              </div>
              {overdueBooks.map((book) => { 
                const today = new Date();
                const dueDate = new Date(book.dueDate);
                const diffTime = Math.abs(today - dueDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                // REMOVED: Fine calculation
                
                return (
                  <div key={book.borrowId} className="overdue-book-row">
                    <div className="book-title">{book.title}</div>
                    <div className="book-author">{book.author}</div>
                    <div className="book-borrow-date">{new Date(book.borrowDate).toLocaleDateString()}</div>
                    <div className="book-due-date overdue-date">{new Date(book.dueDate).toLocaleDateString()}</div>
                    <div className="book-days-overdue">{diffDays} days</div>
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

export default OverdueBooks;