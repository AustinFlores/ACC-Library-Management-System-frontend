// client/src/pages/BorrowRequest.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useLocation to get state
import axios from 'axios'; // For future API call to submit the request
import Header from './Header'; // Assuming you want the header here too
import '../styles/BorrowRequest.css'; // Create this CSS file for styling

function BorrowRequest() {
  const location = useLocation();
  const navigate = useNavigate();
  const { book } = location.state || {}; // Get book data from navigation state

  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [submissionMessage, setSubmissionMessage] = useState('');

  // Redirect if no book data is found (e.g., user navigated directly)
  useEffect(() => {
    if (!book) {
      navigate('/browsebooks'); // Redirect back if no book selected
    }
  }, [book, navigate]);

  if (!book) {
    return null; // Or a loading spinner, while redirecting
  }

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setSubmissionMessage(''); // Clear previous messages

    if (!pickupDate || !pickupTime) {
      setSubmissionMessage('Please select both a date and time.');
      return;
    }

    // You would typically send this data to your backend
    try {
      // *** IMPORTANT: You need to create a new API endpoint on your server
      // (e.g., in server/routes/books.js or a new borrow.js)
      // to handle this request and save it to your database.
      // For now, this is a placeholder:
      const response = await axios.post('http://localhost:5000/api/borrow/request', {
        bookId: book.id,
        bookTitle: book.title, // Include more book info for clarity
        studentId: 'CURRENT_STUDENT_ID', // You'll need to get the actual logged-in student ID
        pickupDate,
        pickupTime,
      });

      if (response.data.success) {
        setSubmissionMessage('Borrow request submitted successfully! You will receive a confirmation.');
        // Optionally clear form or redirect after success
        // setTimeout(() => navigate('/browsebooks'), 3000);
      } else {
        setSubmissionMessage(`Failed to submit request: ${response.data.message || 'Server error'}`);
      }

    } catch (error) {
      console.error('Error submitting borrow request:', error);
      setSubmissionMessage('An error occurred while submitting your request.');
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
          {/* Add more book details if needed */}

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

          {submissionMessage && <p className="submission-message">{submissionMessage}</p>}
        </div>
      </div>
    </div>
  );
}

export default BorrowRequest;