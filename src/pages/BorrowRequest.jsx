// client/src/pages/BorrowRequest.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import { useAuth } from '../context/AuthContext'; // Import useAuth to get student details
import '../styles/BorrowRequest.css';

function BorrowRequest() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const { book } = location.state || {};

  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  // Redirect if no book data is found or user is not logged in as a student
  useEffect(() => {
    if (!book) {
      setSubmissionMessage('No book selected for borrowing.');
      setMessageType('error');
      setTimeout(() => navigate('/browse-books', { replace: true }), 2000);
      return;
    }
    if (!isLoggedIn) {
      setSubmissionMessage('You must be logged in to borrow books.');
      setMessageType('error');
      setTimeout(() => navigate('/signin', { replace: true }), 2000);
      return;
    }
    if (user && user.role !== 'student') {
        setSubmissionMessage('Only students can borrow books.');
        setMessageType('error');
        setTimeout(() => navigate('/student/dashboard', { replace: true }), 2000);
        return;
    }
  }, [book, isLoggedIn, user, navigate]); // Added isLoggedIn and user to dependencies

  // If initial checks fail, display message and prevent rendering the form
  if (!book || !isLoggedIn || !user || user.role !== 'student') {
    return (
      <>
        <Header />
        <div className="borrow-request-page">
          <div className="borrow-request-container">
             <h2 className="borrow-request-title">Access Denied</h2>
             <p className={`submission-message ${messageType}`}>{submissionMessage}</p>
          </div>
        </div>
      </>
    );
  }

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setSubmissionMessage('');
    setMessageType('');

    if (!pickupDate || !pickupTime) {
      setSubmissionMessage('Please select both a date and time.');
      setMessageType('error');
      return;
    }
    
    if (!user.id) {
        setSubmissionMessage('Your student ID is missing. Cannot submit request.');
        setMessageType('error');
        return;
    }

    try {
      const response = await axios.post('/api/borrow/request', {
        bookId: book.id,
        studentId: user.id,
        pickupDate,
        pickupTime,
      });

      if (response.data.success) {
        setSubmissionMessage('Borrow request submitted successfully! You will receive a confirmation shortly.');
        setMessageType('success');
        setPickupDate('');
        setPickupTime('');
        setTimeout(() => navigate('/student/dashboard', { replace: true }), 3000);
      } else {
        setSubmissionMessage(`Failed to submit request: ${response.data.message || 'Server error'}`);
        setMessageType('error');
      }

    } catch (error) {
      console.error('Error submitting borrow request:', error);
      setSubmissionMessage('An error occurred while submitting your request. Please try again.');
      setMessageType('error');
    }
  };

  return (
    <div>
      <Header />
      <div className="borrow-request-page">
        <div className="borrow-request-container">
          <h2 className="borrow-request-title">Request to Borrow: {book.title}</h2>
          <p className="book-details">**Author:** {book.author}</p>
          <p className="book-details">**Category:** {book.category}</p>
          <p className="book-details">**ISBN:** {book.isbn}</p>

          <form onSubmit={handleSubmitRequest} className="borrow-form">
            <label htmlFor="pickupDate">Preferred Pickup Date:</label>
            <input
              type="date"
              id="pickupDate"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              required
            />

            <label htmlFor="pickupTime">Preferred Pickup Time:</label>
            <input
              type="time"
              id="pickupTime"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              required
            />

            <button type="submit" className="submit-borrow-btn">Submit Borrow Request</button>
          </form>

          {submissionMessage && <p className={`submission-message ${messageType}`}>{submissionMessage}</p>}
        </div>
      </div>
    </div>
  );
}

export default BorrowRequest;