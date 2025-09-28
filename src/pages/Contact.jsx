import React, { useState } from "react";
import Header from "./Header";
import "../styles/Contact.css"; // We will create this CSS file next

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    const URL = "https://acc-library-management-system-backend-1.onrender.com";
    event.preventDefault();
    try {
      const res = await fetch(`${URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        // Try to get a meaningful error message from the server
        const errorData = await res.json();
        throw new Error(errorData.error || "Server responded with an error");
      }
      
      alert(`Thank you for your message, ${formData.name}!\nWe will get back to you shortly.`);
      setFormData({ name: "", email: "", subject: "", message: "" });

    } catch (e) {
      alert(`Submission failed: ${e.message}`);
    }
  }

  return (
    <>
      <Header />
      <div className="contact-page-container">
        <div className="contact-header">
          <h1>Contact Us</h1>
          <p>We'd love to hear from you. Whether you have a question about our collection, services, or anything else, our team is ready to answer all your questions.</p>
        </div>

        <div className="contact-content-wrapper">
          {/* Left Side: Contact Information */}
          <div className="contact-info">
            <h2>Get in Touch</h2>
            <p>
              Feel free to reach out through any of the methods below, or use the form to send us a direct message.
            </p>
            <ul>
              <li>
                <strong>Address:</strong> Mayapa, Calamba, Laguna
              </li>
              <li>
                <strong>Phone:</strong> (049) 545-1256
              </li>
              <li>
                <strong>Email:</strong> administrator@asianos.edu.ph
              </li>
            </ul>
            <h3>Operating Hours</h3>
            <ul>
                <li><strong>Monday–Friday:</strong> 9:00 AM – 5:00 PM</li>
                <li><strong>Saturday:</strong> 10:00 AM – 4:00 PM</li>
                <li><strong>Sunday:</strong> Closed</li>
            </ul>
          </div>

          {/* Right Side: Contact Form */}
          <form className="contact-form" onSubmit={handleSubmit}>
            <h2>Send a Message</h2>
            <label>
              Full Name
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Email Address
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Subject
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Message
              <textarea
                name="message"
                rows="6"
                value={formData.message}
                onChange={handleChange}
                required
              />
            </label>
            <button type="submit" className="submit-button">Send Message</button>
          </form>
        </div>
      </div>
    </>
  );
}

export default Contact;