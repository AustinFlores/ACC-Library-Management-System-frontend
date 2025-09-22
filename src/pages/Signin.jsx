import { Html5Qrcode } from "html5-qrcode";
import '../styles/Signin.css';
import React, { useEffect, useRef, useState } from "react";
import Header from './Header';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Signin() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Use a ref to hold a persistent reference to the scanner instance.
  const scannerRef = useRef(null);

  // This useEffect will run ONLY ONCE when the component mounts.
  useEffect(() => {
    // Instantiate the scanner and store it in the ref
    scannerRef.current = new Html5Qrcode("reader");
    const scanner = scannerRef.current;

    const qrCodeSuccessCallback = async (decodedText) => {
      // Prevent multiple scans while one is being processed
      if (isVerifying) return;

      setIsVerifying(true);
      setError(null);

      try {
        // Stop the scanner immediately upon successful scan
        if (scanner && scanner.isScanning) {
          await scanner.stop();
        }

        const url = new URL(decodedText);
        const studentId = url.searchParams.get("id");
        if (!studentId) throw new Error("Invalid QR code: Missing student ID.");

        const response = await fetch(`/verify?id=${studentId}`);
        const data = await response.json();

        if (data.success) {
          // A tiny delay allows the camera to fully release before navigation
          setTimeout(() => {
            login(data.user);
            navigate('/');
          }, 100);
        } else {
          throw new Error(data.message || "Verification failed.");
        }
      } catch (err) {
        setError(err.message);
        setIsVerifying(false);
        // Important: We do not restart the scanner automatically.
        // Let the user decide to refresh or navigate away.
      }
    };

    const qrCodeErrorCallback = (errorMessage) => {
      // Can be ignored for cleaner UI
    };

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    
    // Start the scanner
    scanner.start({ facingMode: "environment" }, config, qrCodeSuccessCallback, qrCodeErrorCallback)
      .catch(err => {
        setError("Could not start camera. Please grant permissions.");
      });

    // ** THE CRITICAL CLEANUP FUNCTION **
    // This function is guaranteed to run when the component unmounts.
    return () => {
      // Check if the ref has a scanner instance and if it's still scanning.
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(err => {
          // This error can be safely ignored, as we are leaving the page.
          console.warn("Error stopping scanner during cleanup:", err);
        });
      }
    };
  }, []); // The empty dependency array [] ensures this effect runs ONLY ONCE.

  const getStatusMessage = () => {
    if (error) return <label className="scan-result error">{error}</label>;
    if (isVerifying) return <label className="scan-result info">Verifying QR code...</label>;
    return <label>Scan your QR code to Sign in</label>;
  };

  return (
    <>
      <Header />
      <div className="signin-container">
        <div className="signin-content">
          <div className="status-message">{getStatusMessage()}</div>
          <div id="reader" style={{ display: isVerifying ? 'none' : 'block' }}></div>
        </div>
        <div className="signin-text-container">
          <p>Lost access to your QR code? <a href="/requestqr" className='requestQR link'>Request your QR code</a></p>
          <p className='signup-text'>No account yet? <a href="/signup" className='signup-link link'>Signup now</a></p>
        </div>
      </div>
    </>
  );
}

export default Signin;