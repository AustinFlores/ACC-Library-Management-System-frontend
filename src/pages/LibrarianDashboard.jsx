import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import '../styles/LibrarianDashboard.css';

function LibrarianDashboard() {
  return (
    <>
      <div className="dashboard-container">
        <Sidebar />
        <main className="dashboard-content">
          <div className="dashboard-content-wrapper">
            <Outlet /> {/* Child routes will render here */}
          </div>
        </main>
      </div>
    </>
  );
}

export default LibrarianDashboard;