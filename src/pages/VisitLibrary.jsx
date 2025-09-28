import React, { useState } from "react";
import Header from "./Header";
import "../styles/VisitLibrary.css";
import { useAuth } from "../context/AuthContext";

function VisitLibrary() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    date: "",
    timeSlot: "",
    purpose: "",
    notes: ""
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    const URL = "https://acc-library-management-system-backend-1.onrender.com";
  event.preventDefault();
  try {
    const res = await fetch(`${URL}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    alert(`Booking submitted! Reference: ${data.id || "pending"}`);
    setFormData({ name: user.name, email: user.email, date:"", timeSlot:"", purpose:"", notes:"" });
  } catch (e) {
    alert(`Submission failed: ${e.message}`);
  }
}

  return (
    <>
    <Header />
    <div className="visit-container">
      
      <h1 className="visit-title">Plan Your Visit</h1>
      <p className="visit-intro">
        To ensure a safe and comfortable experience for all patrons, please book
        your visit in advance using the form below.
      </p>

      <div className="info-section">
        <h3>Before You Visit</h3>
        <ul>
          <li>Address: 123 Main Street, Springfield</li>
          <li>Opening Hours: Mon–Fri 9am–6pm, Sat 10am–4pm</li>
          <li>Maximum visit duration: 2 hours</li>
          <li>Bring your library ID</li>
          <li>No food or drinks allowed in reading areas</li>
        </ul>
      </div>

      <form className="booking-form" onSubmit={handleSubmit}>

        <label>
          Date of Visit
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Time Slot
          <select
            name="timeSlot"
            value={formData.timeSlot}
            onChange={handleChange}
            required
          >
            <option value="">Select a time slot</option>
            <option value="9-11am">9:00–11:00 AM</option>
            <option value="11am-1pm">11:00 AM–1:00 PM</option>
            <option value="1-3pm">1:00–3:00 PM</option>
            <option value="3-5pm">3:00–5:00 PM</option>
          </select>
        </label>

        <label>
          Purpose of Visit
          <select
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            required
          >
            <option value="">Select purpose</option>
            <option value="Reading/Studying">Reading / Studying</option>
            <option value="Research">Research</option>
            <option value="Other">Other</option>
          </select>
        </label>

        <label>
          Additional Notes
          <textarea
            name="notes"
            rows="4"
            value={formData.notes}
            onChange={handleChange}
          />
        </label>

        <button type="submit" className="submit-btn">Book Visit</button>
      </form>
    </div>
    </>
  );
}

export default VisitLibrary;
