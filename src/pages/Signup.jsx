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
  const [qrImage, setQrImage] = useState(''); // QR code image (data:, http(s):, or blob:)
  const [lastGeneratedId, setLastGeneratedId] = useState(''); // for filename
  const URL = "https://acc-library-management-system-backend-1.onrender.com";

  const handleSignup = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setQrImage('');

    try {
      const res = await axios.post(`${URL}
https://acc-library-management-system-frontend.onrender.com/signup`, formData);
      console.log(res.data);

      if (res.data.success) {
        setSuccessMessage('Signup successful! You can now sign in.');

        const qrRes = await axios.get(`${URL}/generate-qr?id=${formData.id}`);
        if (qrRes.data?.success && qrRes.data?.qrImage) {
          let img = qrRes.data.qrImage;

          // Normalize: if it's raw base64 (no scheme), prefix to form a data URL
          if (typeof img === 'string') {
            const lower = img.slice(0, 10).toLowerCase();
            const isData = lower.startsWith('data:');
            const isHttp = lower.startsWith('http');
            const isBlob = lower.startsWith('blob:');

            if (!isData && !isHttp && !isBlob) {
              img = `data:image/png;base64,${img}`;
            }
          }

          setQrImage(img);
          setLastGeneratedId(formData.id || 'account');
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

  const downloadQr = async () => {
    try {
      if (!qrImage) return;
      const fileName = `qr-${lastGeneratedId || 'account'}.png`;

      // If data URL or blob URL, use anchor download directly
      if (qrImage.startsWith('data:') || qrImage.startsWith('blob:')) {
        const a = document.createElement('a');
        a.href = qrImage;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        return;
      }

      // Otherwise, fetch the image (supports cross-origin if server allows CORS), then create blob URL
      const res = await fetch(qrImage, { mode: 'cors' });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to download QR:', e);
      alert('Failed to download QR code.');
    }
  };

  return (
    <>
      <Header />
      <div className="signup-page">
        <div className="signup-container">
          <form className="signup-form" onSubmit={handleSignup}>
            <h1 className="signup-title">Signup Page</h1>
          <p className="signup-description">Create your account to borrow, reserve, and explore books anytime.</p>
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

            <button type="submit" className="btn-primary" id="signup-btn">Signup</button>
            <p className="signin-text">
              Already have an account? <a href="/signin" className="signin-link">Sign in</a>
            </p>
          </form>
          <div className="generated-qr-area">

          {successMessage && (
            <p className={`signup-message ${successMessage.includes('successful') ? 'success' : 'error'}`}>
              {successMessage}
            </p>
          )}

          {qrImage && (
            <div className="qr-section">
              <h3 className="qr-title">Your QR Code:</h3>
              <img src={qrImage} alt="QR Code" className="qr-image" />
              <p>This will serve as your digital library card.</p>
              <div className="qr-actions">
                <button type="button" className="btn-secondary qr-download-btn" onClick={downloadQr}>
                  Download QR
                </button>
              </div>
            </div>
          )}

          </div>
        </div>
      </div>
    </>
  );
}

export default Signup;
