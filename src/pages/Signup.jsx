import React, { useState } from 'react';
import axios from 'axios';
import Header from './Header';
import '../styles/Signup.css';

function Signup() {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    course: '',
    year_level: 0,
    password: ''
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [qrImage, setQrImage] = useState(''); // State to hold QR code image

  const handleSignup = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setQrImage('');

    try {
      const res = await axios.post('http://localhost:3000/signup', formData);
      console.log(res.data);

      if (res.data.success) {
        setSuccessMessage('Signup successful! Generating QR code...');
        const qrRes = await axios.get(`http://localhost:5000/generate-qr?id=${formData.id}`);
        if (qrRes.data.success) {
          setQrImage(qrRes.data.qrImage);
        }
        setFormData({
          id: '',
          name: '',
          email: '',
          course: '',
          year_level: '',
          password: ''
        });
      } else {
        setSuccessMessage(res.data.message || 'Signup failed.');
      }
    } catch (err) {
      console.error(err);
      setSuccessMessage('Error connecting to the server.');
    }
  };

  return (
    <>
    <Header />
    <div className="signup-page">
      <div className="signup-container">
        <h1 className="signup-title">Signup Page</h1>
        <p className="signup-description">This is the registration page where users can create a new account.</p>

        {successMessage && (
          <p className={`signup-message ${successMessage.includes('successful') ? 'success' : 'error'}`}>
            {successMessage}
          </p>
        )}

        {qrImage && (
          <div className="qr-section">
            <h3 className="qr-title">Your QR Code:</h3>
            <img src={qrImage} alt="QR Code" className="qr-image" />
          </div>
        )}

        <form className="signup-form" onSubmit={handleSignup}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="studentId" className="form-label">Student ID:</label>
              <input
                type="text"
                id="studentId"
                name="id"
                className="form-input"
                value={formData.id}
                required
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="name" className="form-label">Full Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                value={formData.name}
                required
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                value={formData.email}
                required
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="course" className="form-label">Course:</label>
              <input
                type="text"
                id="course"
                name="course"
                className="form-input"
                value={formData.course}
                required
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="year_level" className="form-label">Year Level:</label>
              <select
                id="year_level"
                name="year_level"
                className="form-input"
                value={formData.year_level}
                required
                onChange={(e) => setFormData({ ...formData, year_level: e.target.value })}
              >
                <option value="">Select Year Level</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-input"
                value={formData.password}
                required
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" id='signup-btn'>Signup</button>
          <p className="signin-text">
            Already have an account? <a href="/signin" className="signin-link">Sign in</a>
          </p>
        </form>
      </div>
    </div>
    </>
  );
}

export default Signup;
