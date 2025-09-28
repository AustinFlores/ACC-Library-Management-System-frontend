import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/CreateAnnouncement.css";

function CreateAnnouncement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // --- Fetch announcements ---
  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get("/api/announcements");
      if (res.data.success) {
        setAnnouncements(res.data.announcements);
      }
    } catch (err) {
      console.error("Error fetching announcements:", err);
      setStatus({ type: "error", text: "Failed to load announcements." });
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // --- Create or Update announcement ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      setStatus({ type: "error", text: "Both title and message are required." });
      return;
    }

    try {
      if (editingId) {
        // Update announcement
        const res = await axios.put(`/api/announcements/${editingId}`, {
          title,
          message,
        });

        if (res.data.success) {
          setStatus({ type: "success", text: "Announcement updated successfully." });
          fetchAnnouncements(); // refresh list
          resetForm();
        } else {
          setStatus({ type: "error", text: res.data.message || "Failed to update announcement." });
        }
      } else {
        // Create new announcement
        const res = await axios.post("/api/announcements", { title, message });

        if (res.data.success) {
          setStatus({ type: "success", text: "Announcement created successfully." });
          if (res.data.announcement) {
            setAnnouncements((prev) => [res.data.announcement, ...prev]);
          } else {
            fetchAnnouncements();
          }
          resetForm();
        } else {
          setStatus({ type: "error", text: res.data.message || "Failed to create announcement." });
        }
      }
    } catch (err) {
      console.error("Error saving announcement:", err);
      setStatus({ type: "error", text: "An error occurred while saving the announcement." });
    }
  };

  // --- Reset form ---
  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setMessage("");
  };

  // --- Edit handler ---
  const handleEdit = (announcement) => {
    setEditingId(announcement.id);
    setTitle(announcement.title);
    setMessage(announcement.message);
    setStatus(null);
  };

  // --- Delete handler ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;

    try {
      const res = await axios.delete(`/api/announcements/${id}`);
      if (res.data.success) {
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
        setStatus({ type: "success", text: "Announcement deleted successfully." });
        if (editingId === id) resetForm(); // reset if editing deleted one
      } else {
        setStatus({ type: "error", text: res.data.message || "Failed to delete announcement." });
      }
    } catch (err) {
      console.error("Error deleting announcement:", err);
      setStatus({ type: "error", text: "An error occurred while deleting the announcement." });
    }
  };

  if (!user || (user.role !== "librarian" && user.role !== "admin")) {
    return <p>You are not authorized to manage announcements.</p>;
  }

  return (
    <div className="admin-page-content">
      <h1 className="dashboard-header">
        {editingId ? "Edit Announcement" : "Create Announcement"}
      </h1>

      {/* --- Announcement Form --- */}
      <form className="announcement-form" onSubmit={handleSubmit}>
        <label>
          Title:
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter announcement title"
          />
        </label>
        <label>
          Message:
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter announcement message"
          ></textarea>
        </label>
        <div className="form-actions">
          <button type="submit" className="btn-submit">
            {editingId ? "Update" : "Create"}
          </button>
          {editingId && (
            <button type="button" className="btn-cancel" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {status && <p className={`status ${status.type}`}>{status.text}</p>}

      {/* --- Announcements List --- */}
      <div className="announcements-list">
        <h2>Existing Announcements</h2>
        {announcements.length === 0 ? (
          <p>No announcements yet.</p>
        ) : (
          <ul>
            {announcements.map((a) => (
              <li key={a.id} className="announcement-item">
                <h3>{a.title}</h3>
                <p>{a.message}</p>
                <small>
                  Posted on: {new Date(a.created_at).toLocaleString()}
                </small>
                <div className="announcement-actions">
                  <button onClick={() => handleEdit(a)} className="btn-edit">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(a.id)} className="btn-delete">
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default CreateAnnouncement;
