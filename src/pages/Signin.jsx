import { Html5Qrcode } from "html5-qrcode";
import '../styles/Signin.css';
import React, { useEffect, useRef, useState } from "react";
import Header from './Header';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from "axios";

function Signin() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [showLibrarianLogin, setShowLibrarianLogin] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const { login } = useAuth();
  const navigate = useNavigate();
  const scannerRef = useRef(null);

  // This function handles the logic after successful authentication from ANY method
  const handleLoginSuccess = async (userData) => {
    await stopScanner();
    login(userData);
    // CRITICAL: Check the role and navigate accordingly
    if (userData.role === 'librarian') {
      navigate('/librarian/dashboard');
    } else {
      navigate('/student/dashboard');
    }
  };

  const activeStreamRef = useRef(null);
  const stopScanner = async () => {
  try {
    if (scannerRef.current && scannerRef.current.isScanning) {
      await scannerRef.current.stop();
    }
  } catch (err) {
    console.warn("Scanner stop failed:", err);
  }

  // Force stop stream tracks if still alive
  if (activeStreamRef.current) {
    activeStreamRef.current.getTracks().forEach(track => track.stop());
    activeStreamRef.current = null;
  }
};

  // --- QR SCANNER LOGIC ---
  useEffect(() => {
  let scanner;

  if (!showLibrarianLogin) {
    scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    const qrCodeSuccessCallback = async (decodedText) => {
      if (isVerifying) return;
      setIsVerifying(true);
      setError(null);

      try {
        if (scanner && scanner.isScanning) await scanner.stop();
        const studentId = decodedText;
        if (!studentId) throw new Error("Invalid QR code: Missing student ID.");
        const URL = "https://acc-library-management-system-backend-1.onrender.com";
        const response = await fetch(`${URL}/verify?id=${studentId}`);
        const data = await response.json();

        if (data.success) {
          setTimeout(() => handleLoginSuccess(data.user), 100);
        } else {
          throw new Error(data.message || "Verification failed.");
        }
      } catch (err) {
        setError(err.message);
        setIsVerifying(false);
      }
    };

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    scanner.start({ facingMode: "environment" }, config, qrCodeSuccessCallback).then(() => {
    // Grab the video element created by html5-qrcode
    const videoElem = document.querySelector("#reader video");

    if (videoElem && videoElem.srcObject) {
      activeStreamRef.current = videoElem.srcObject;
    }
  })
      .catch(err => setError("Could not start camera. Please grant permissions."));
  }

  return () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop()
        .catch(err => console.warn("Scanner stop failed:", err));
    }
  };
}, [showLibrarianLogin]);


  // --- LIBRARIAN FORM LOGIC ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLibrarianSubmit = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setError(null);

    try {
      const URL = "https://acc-library-management-system-backend-1.onrender.com";
      const response = await axios.post(`${URL}/signin`, {
      email: formData.email,
      password: formData.password
    });
      const data = await response.data;

      if (data.success) {
        handleLoginSuccess(data);
      } else {
        throw new Error(data.message || "Login failed.");
      }
    } catch (err) {
      setError(err.message);
      setIsVerifying(false);
    }
  };

  // --- RENDER LOGIC ---
  const getStatusMessage = () => {
    if (error) return <label className="scan-result error">{error}</label>;
    if (isVerifying) return <label className="scan-result info">Authenticating...</label>;
    if (showLibrarianLogin) return <label>Librarian Login</label>;
    return <label>Scan your QR code to Sign in</label>;
  };

  return (
    <>
      <Header />
      <div className="signin-container">
        <div className="signin-content">
          <div className="status-message">{getStatusMessage()}</div>

          {showLibrarianLogin ? (
            <form className="librarian-form" onSubmit={handleLibrarianSubmit}>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <button type="submit" className="btn-primary" disabled={isVerifying}>
                {isVerifying ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <div id="reader" style={{ display: isVerifying ? 'none' : 'block' }}></div>
          )}
        </div>

        <div className="signin-text-container">
          {showLibrarianLogin ? (
            <p>
              Are you a student?{' '}
              <span className="link" onClick={() => { setShowLibrarianLogin(false); setError(null); }}>
                Scan QR Code
              </span>
            </p>
          ) : (
            <>
              <p>
                Are you a librarian/admin?{' '}
                <span className="link" onClick={() => { 
                  stopScanner();
                  setShowLibrarianLogin(true); setError(null); }}>
                  Login with password
                </span>
              </p>
            </>
          )}
          <p className='signup-text signin-page'>No account yet? <a href="/signup" className='signup-link link'>Signup now</a></p>
        </div>
      </div>
    </>
  );
}

export default Signin;