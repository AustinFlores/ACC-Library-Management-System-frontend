import React, { useEffect } from 'react';
import '../styles/SuccessNotification.css';

function SuccessNotification({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // auto-close after 3 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="success-notification">
      <div className="success-content">
        <span className="checkmark">✔</span>
        <p>{message}</p>
      </div>
    </div>
  );
}

export default SuccessNotification;
