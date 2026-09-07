import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "https://digital-notice-board-tcg8.onrender.com/api";

function App() {
  // =========================
  // STATE
  // =========================

  const [notices, setNotices] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Search / filter / sort
  const [searchTerm, setSearchTerm] = useState("");
  const [audienceFilter, setAudienceFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [showLogin, setShowLogin] = useState(
    !localStorage.getItem("token")
  );

  const [showCreate, setShowCreate] = useState(false);

  // Login
  const [email, setEmail] = useState("javad@example.com");
  const [password, setPassword] = useState("password123");

  // Notice form
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetRole, setTargetRole] = useState("all");
  const [expiryDate, setExpiryDate] = useState("");
  const [file, setFile] = useState(null);

  // Edit
  const [editingId, setEditingId] = useState(null);

  // Messages
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Logged-in user
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");

    return savedUser ? JSON.parse(savedUser) : null;
  });

  // =========================
  // GET NOTICES
  // =========================

  const fetchNotices = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      const response = await axios.get(`${API_URL}/notices`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotices(response.data.notices || []);
    } catch (err) {
      console.error("Error fetching notices:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setUser(null);
        setIsLoggedIn(false);
        setShowLogin(true);
      }
    }
  };

  // =========================
  // GET NOTIFICATIONS
  // =========================

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      const response = await axios.get(
        `${API_URL}/notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error(
        "Error fetching notifications:",
        error
      );
    }
  };

  // =========================
  // LOAD DATA WHEN ALREADY LOGGED IN
  // =========================

  useEffect(() => {
    if (localStorage.getItem("token")) {
      fetchNotices();
      fetchNotifications();
    }
  }, []);

  // =========================
  // MARK NOTIFICATION AS READ
  // =========================

  const markNotificationAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      await axios.put(
        `${API_URL}/notifications/${id}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      const response = await axios.post(
        `${API_URL}/auth/login`,
        {
          email,
          password,
        }
      );

      const token = response.data.token;
      const loggedInUser = response.data.user;

      localStorage.setItem("token", token);
      localStorage.setItem(
        "user",
        JSON.stringify(loggedInUser)
      );

      setUser(loggedInUser);
      setIsLoggedIn(true);
      setShowLogin(false);

      setMessage("Login successful!");

      fetchNotices();
      fetchNotifications();
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed"
      );
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setIsLoggedIn(false);
    setShowLogin(true);

    setShowCreate(false);
    setEditingId(null);

    setMessage("Logged out successfully.");
    setError("");
  };

  // =========================
  // CREATE / UPDATE NOTICE
  // =========================

  const handleCreateNotice = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login again.");
        return;
      }

      // =========================
      // FORM DATA
      // =========================

      const formData = new FormData();

      formData.append("title", title);
      formData.append("content", content);
      formData.append("targetRole", targetRole);
      formData.append(
        "expiryDate",
        expiryDate || ""
      );

      // Add file only if selected
      if (file) {
        formData.append("file", file);
      }

      // =========================
      // UPDATE NOTICE
      // =========================

      if (editingId) {
        await axios.put(
          `${API_URL}/notices/${editingId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setMessage("Notice updated successfully!");
      }

      // =========================
      // CREATE NOTICE
      // =========================

      else {
        await axios.post(
          `${API_URL}/notices`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setMessage("Notice created successfully!");
      }

      // =========================
      // CLEAR FORM
      // =========================

      setTitle("");
      setContent("");
      setTargetRole("all");
      setExpiryDate("");
      setFile(null);
      setEditingId(null);
      setShowCreate(false);

      // Refresh notices and notifications
      fetchNotices();
      fetchNotifications();

    } catch (err) {
      console.error("Notice error:", err);

      setError(
        err.response?.data?.message ||
        "Failed to save notice"
      );
    }
  };

  // =========================
  // EDIT NOTICE
  // =========================

  const handleEdit = (notice) => {
    setEditingId(notice._id);

    setTitle(notice.title);
    setContent(notice.content);
    setTargetRole(notice.targetRole);

    // Load existing expiry date
    setExpiryDate(
      notice.expiryDate
        ? new Date(notice.expiryDate)
          .toISOString()
          .split("T")[0]
        : ""
    );

    // Reset file
    setFile(null);

    setMessage("");
    setError("");

    setShowCreate(true);
  };

  // =========================
  // DELETE NOTICE
  // =========================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this notice?"
    );

    if (!confirmed) {
      return;
    }

    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `${API_URL}/notices/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Notice deleted successfully!");

      fetchNotices();

    } catch (err) {
      console.error(
        "Delete notice error:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Failed to delete notice"
      );
    }
  };

  // =========================
  // CLOSE FORM
  // =========================

  const handleCloseForm = () => {
    setShowCreate(false);

    setEditingId(null);

    setTitle("");
    setContent("");
    setTargetRole("all");
    setExpiryDate("");
    setFile(null);

    setMessage("");
    setError("");
  };

  // =========================
  // FILTER AND SORT NOTICES
  // =========================

  const filteredNotices = [...notices]
    .filter((notice) => {
      const search = searchTerm.trim().toLowerCase();

      const matchesSearch =
        !search ||
        notice.title.toLowerCase().includes(search) ||
        notice.content.toLowerCase().includes(search);

      const matchesAudience =
        audienceFilter === "all" ||
        notice.targetRole === audienceFilter;

      return matchesSearch && matchesAudience;
    })
    .sort((a, b) => {
      if (sortOrder === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }

      if (sortOrder === "expiring") {
        const aDate = a.expiryDate
          ? new Date(a.expiryDate).getTime()
          : Number.MAX_SAFE_INTEGER;
        const bDate = b.expiryDate
          ? new Date(b.expiryDate).getTime()
          : Number.MAX_SAFE_INTEGER;

        return aDate - bDate;
      }

      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  // =========================
  // LOGIN PAGE
  // =========================

  if (showLogin) {
    return (
      <div className="login-page">

        <div className="login-card">

          <div className="login-icon">
            🔐
          </div>

          <h1>
            Digital Notice Board
          </h1>

          <p>
            Login to your account
          </p>

          <form onSubmit={handleLogin}>

            <label>
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Enter your email"
              required
            />

            <label>
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter your password"
              required
            />

            <button type="submit">
              Login
            </button>

          </form>

          {message && (
            <div className="success-message">
              {message}
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

        </div>

      </div>
    );
  }

  // =========================
  // DASHBOARD
  // =========================

  return (
    <div className="app">

      {/* =========================
          HEADER
      ========================= */}

      <header className="header">

        <div>

          <h1>
            📢 Digital Notice Board
          </h1>

          <p>
            Stay updated with the latest
            announcements
          </p>

        </div>

        <button
          onClick={handleLogout}
          className="logout-btn"
        >
          Logout
        </button>

      </header>

      {/* =========================
          MAIN
      ========================= */}

      <main className="main">

        {/* =========================
            TITLE
        ========================= */}
        {/* NOTIFICATIONS */}
        {notifications.length > 0 && (
          <div className="notification-box">
            <h2>🔔 Notifications</h2>

            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`notification ${notification.isRead ? "read" : "unread"
                  }`}
              >
                <p>{notification.message}</p>

                {!notification.isRead && (
                  <>
                    <span className="unread-text">New</span>
                    <button
                      onClick={() =>
                        markNotificationAsRead(notification._id)
                      }
                    >
                      Mark as read
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="title-row">

          <h2>
            Latest Notices
          </h2>

          {user?.role === "admin" && (
            <button
              onClick={() => {
                setEditingId(null);

                setTitle("");
                setContent("");
                setTargetRole("all");
                setExpiryDate("");
                setFile(null);

                setMessage("");
                setError("");

                setShowCreate(true);
              }}
              className="create-btn"
            >
              + Create Notice
            </button>
          )}

        </div>

        {/* =========================
            SUCCESS MESSAGE
        ========================= */}

        {message && (
          <div className="success-banner">
            {message}
          </div>
        )}

        {/* =========================
            ERROR MESSAGE
        ========================= */}

        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        {/* =========================
            CREATE / EDIT FORM
        ========================= */}

        {showCreate &&
          user?.role === "admin" && (

            <div className="create-card">

              <div className="create-header">

                <h2>
                  {editingId
                    ? "Edit Notice"
                    : "Create New Notice"}
                </h2>

                <button
                  onClick={handleCloseForm}
                  className="close-btn"
                >
                  Close
                </button>

              </div>

              <form
                onSubmit={handleCreateNotice}
              >

                {/* TITLE */}

                <label>
                  Notice Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  placeholder="Enter notice title"
                  required
                />

                {/* CONTENT */}

                <label>
                  Notice Content
                </label>

                <textarea
                  value={content}
                  onChange={(e) =>
                    setContent(e.target.value)
                  }
                  placeholder="Enter notice content"
                  required
                />

                {/* TARGET AUDIENCE */}

                <label>
                  Target Audience
                </label>

                <select
                  value={targetRole}
                  onChange={(e) =>
                    setTargetRole(
                      e.target.value
                    )
                  }
                >

                  <option value="all">
                    Everyone
                  </option>

                  <option value="admin">
                    Admins
                  </option>

                  <option value="staff">
                    Staff
                  </option>

                  <option value="student">
                    Students
                  </option>

                </select>

                {/* EXPIRY DATE */}

                <label>
                  Expiry Date
                </label>

                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) =>
                    setExpiryDate(
                      e.target.value
                    )
                  }
                />

                {/* ATTACHMENT */}

                <label>
                  Attachment
                </label>

                <input
                  type="file"
                  onChange={(e) =>
                    setFile(
                      e.target.files[0]
                    )
                  }
                />

                {/* SUBMIT */}

                <button
                  type="submit"
                  className="publish-btn"
                >
                  {editingId
                    ? "Update Notice"
                    : "Publish Notice"}
                </button>

              </form>

            </div>
          )}

        {/* =========================
            SEARCH / FILTER / SORT
        ========================= */}

        <div className="notice-filters">
          <div>
            <label>Search Notices</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or content..."
            />
          </div>

          <div>
            <label>Audience</label>
            <select
              value={audienceFilter}
              onChange={(e) => setAudienceFilter(e.target.value)}
            >
              <option value="all">All Audiences</option>
              <option value="admin">Admins</option>
              <option value="staff">Staff</option>
              <option value="student">Students</option>
            </select>
          </div>

          <div>
            <label>Sort By</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="expiring">Expiring Soon</option>
            </select>
          </div>
        </div>

        {/* =========================
            NOTICE LIST
        ========================= */}

        {filteredNotices.length === 0 ? (

          <div className="empty-card">

            <div className="empty-icon">
              📬
            </div>

            <h2>
              {notices.length === 0
                ? "No Notices Available"
                : "No Matching Notices"}
            </h2>

            <p>
              {notices.length === 0
                ? "There are currently no announcements to display."
                : "Try changing your search or filters."}
            </p>

          </div>

        ) : (

          <div className="notice-grid">

            {filteredNotices.map((notice) => (

              <div
                className="notice-card"
                key={notice._id}
              >

                <h2>
                  {notice.title}
                </h2>

                <p>
                  {notice.content}
                </p>

                {/* EXPIRY DATE */}

                {notice.expiryDate && (
                  <p className="expiry-text">
                    Expires:{" "}
                    {new Date(
                      notice.expiryDate
                    ).toLocaleDateString()}
                  </p>
                )}

                {/* FILE */}

                {notice.filePath && (
                  <p>
                    📎{" "}
                    <a
                      href={`https://digital-notice-board-tcg8.onrender.com${notice.filePath}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View Attachment
                    </a>
                  </p>
                )}

                <div className="notice-footer">

                  <span>
                    For: {notice.targetRole}
                  </span>

                  {/* ADMIN BUTTONS */}

                  {user?.role === "admin" && (

                    <div>

                      <button
                        onClick={() =>
                          handleEdit(notice)
                        }
                        className="edit-btn"
                      >
                        ✏️ Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(
                            notice._id
                          )
                        }
                        className="delete-btn"
                      >
                        🗑️ Delete
                      </button>

                    </div>

                  )}

                </div>

              </div>

            ))}

          </div>

        )}

      </main>

    </div>
  );
}

export default App;