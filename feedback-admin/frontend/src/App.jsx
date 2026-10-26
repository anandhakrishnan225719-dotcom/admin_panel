import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Link,
  useNavigate,
  useParams,
  useLocation
} from "react-router-dom";
import axios from "axios";
import "./App.css";

const API = "http://localhost:5000/api/feedback";

function Sidebar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      <button
        className="mobile-menu"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
      >
        ☰
      </button>

      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <Link to="/" className="brand">
          <div className="brand-icon">F</div>
          <div>
            <strong>Feedora</strong>
            <span>FEEDBACK SYSTEM</span>
          </div>
        </Link>

        <div className="nav-heading">WORKSPACE</div>

        <nav className="side-nav">
          <NavLink to="/" end className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }>
            <span className="nav-icon">▦</span>
            Dashboard
          </NavLink>

          <NavLink to="/feedback" className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }>
            <span className="nav-icon">▤</span>
            All Feedback
          </NavLink>

          <NavLink to="/add" className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }>
            <span className="nav-icon">＋</span>
            Add Feedback
          </NavLink>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <div className="help-icon">?</div>
            <strong>Feedback Portal</strong>
            <p>Manage course feedback in one place.</p>
          </div>

          <div className="profile">
            <div className="avatar">A</div>
            <div className="profile-info">
              <strong>Administrator</strong>
              <span>System Admin</span>
            </div>
            <span className="profile-menu">•••</span>
          </div>
        </div>
      </aside>
    </>
  );
}

function Header({ title, subtitle, action }) {
  return (
    <header className="page-header">
      <div>
        <div className="breadcrumb">Workspace / {title}</div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action}
    </header>
  );
}

function Dashboard() {
  const [feedback, setFeedback] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFeedback = async () => {
    try {
      setError("");
      const response = await axios.get(API);
      setFeedback(response.data);
    } catch {
      setError("Unable to load feedback. Check that the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  const deleteFeedback = async (id) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) {
      return;
    }

    try {
      await axios.delete(`${API}/${id}`);
      setFeedback((old) => old.filter((item) => item._id !== id));
    } catch {
      alert("Failed to delete feedback.");
    }
  };

  const averageRating = feedback.length
    ? (
        feedback.reduce((sum, item) => sum + Number(item.rating), 0) /
        feedback.length
      ).toFixed(1)
    : "0.0";

  const excellentCount = feedback.filter(
    (item) => Number(item.rating) >= 4
  ).length;

  const coursesCount = new Set(
    feedback.map((item) => item.courseName.trim().toLowerCase())
  ).size;

  const filteredFeedback = feedback.filter((item) =>
    `${item.courseId} ${item.courseName} ${item.comments}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main className="main-content">
      <Header
        title="Dashboard"
        subtitle="Monitor course feedback and review student experiences."
        action={
          <Link to="/add" className="button button-primary">
            <span>＋</span> Add Feedback
          </Link>
        }
      />

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={loadFeedback}>Retry</button>
        </div>
      )}

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-top">
            <span>Total Feedback</span>
            <div className="stat-icon blue-icon">▤</div>
          </div>
          <div className="stat-value">{feedback.length}</div>
          <div className="stat-caption">Total submissions received</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Average Rating</span>
            <div className="stat-icon gold-icon">★</div>
          </div>
          <div className="stat-value">
            {averageRating}
            <span className="out-of"> / 5</span>
          </div>
          <div className="stat-caption">Average course satisfaction</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Courses Reviewed</span>
            <div className="stat-icon purple-icon">▣</div>
          </div>
          <div className="stat-value">{coursesCount}</div>
          <div className="stat-caption">Unique courses with feedback</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Positive Ratings</span>
            <div className="stat-icon green-icon">↗</div>
          </div>
          <div className="stat-value">{excellentCount}</div>
          <div className="stat-caption">Ratings of 4 stars or higher</div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Course Feedback</h2>
            <p>Review and manage all submitted feedback.</p>
          </div>
          <Link to="/feedback" className="text-link">
            View all →
          </Link>
        </div>

        <div className="table-toolbar">
          <div className="search-box">
            <span>⌕</span>
            <input
              type="search"
              placeholder="Search courses or comments..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <span className="result-count">
            {filteredFeedback.length} records
          </span>
        </div>

        <FeedbackTable
          feedback={filteredFeedback}
          loading={loading}
          onDelete={deleteFeedback}
        />
      </section>

      <footer className="page-footer">
        <span>Feedora Feedback Management System</span>
        <span>Dashboard · Course Insights</span>
      </footer>
    </main>
  );
}

function FeedbackTable({ feedback, loading, onDelete }) {
  if (loading) {
    return <div className="table-message">Loading feedback...</div>;
  }

  return (
    <div className="table-scroll">
      <table className="feedback-table">
        <thead>
          <tr>
            <th>COURSE ID</th>
            <th>COURSE NAME</th>
            <th>DURATION</th>
            <th>RATING</th>
            <th>COMMENTS</th>
            <th>ACTIONS</th>
          </tr>
        </thead>

        <tbody>
          {feedback.map((item) => (
            <tr key={item._id}>
              <td>
                <span className="course-id">{item.courseId}</span>
              </td>
              <td>
                <div className="course-name">{item.courseName}</div>
              </td>
              <td>{item.courseDuration || "3 Months"}</td>
              <td>
                <div className="rating-stars">
                  {"★".repeat(Number(item.rating))}
                  {"☆".repeat(5 - Number(item.rating))}
                </div>
                <span className="rating-number">
                  {item.rating}.0 / 5
                </span>
              </td>
              <td className="comment-cell">{item.comments}</td>
              <td>
                <div className="action-buttons">
                  <Link
                    className="icon-button edit-action"
                    to={`/update/${item._id}`}
                    title="Update feedback"
                    aria-label="Update feedback"
                  >
                    ✎
                  </Link>
                  <button
                    className="icon-button delete-action"
                    onClick={() => onDelete(item._id)}
                    title="Delete feedback"
                    aria-label="Delete feedback"
                  >
                    ×
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {feedback.length === 0 && (
            <tr>
              <td colSpan="6" className="empty-state">
                <div className="empty-icon">▤</div>
                <strong>No feedback found</strong>
                <p>Try another search or add your first feedback entry.</p>
                <Link to="/add" className="button button-primary">
                  Add Feedback
                </Link>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function AllFeedback() {
  const [feedback, setFeedback] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadFeedback = async () => {
    try {
      const response = await axios.get(API);
      setFeedback(response.data);
    } catch {
      alert("Unable to load feedback. Check the backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  const deleteFeedback = async (id) => {
    if (!window.confirm("Delete this feedback permanently?")) return;

    try {
      await axios.delete(`${API}/${id}`);
      setFeedback((old) => old.filter((item) => item._id !== id));
    } catch {
      alert("Failed to delete feedback.");
    }
  };

  const filtered = feedback.filter((item) =>
    `${item.courseId} ${item.courseName} ${item.comments}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main className="main-content">
      <Header
        title="All Feedback"
        subtitle="Browse, search, and manage all course submissions."
        action={
          <Link to="/add" className="button button-primary">
            ＋ Add Feedback
          </Link>
        }
      />

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Feedback Records</h2>
            <p>{feedback.length} total submissions</p>
          </div>
        </div>

        <div className="table-toolbar">
          <div className="search-box">
            <span>⌕</span>
            <input
              type="search"
              placeholder="Search by course or comments..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <span className="result-count">{filtered.length} records</span>
        </div>

        <FeedbackTable
          feedback={filtered}
          loading={loading}
          onDelete={deleteFeedback}
        />
      </section>
    </main>
  );
}

function FeedbackForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    courseName: "",
    comments: "",
    rating: "5"
  });

  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    axios.get(API)
      .then((response) => {
        const item = response.data.find((f) => f._id === id);

        if (!item) {
          if (!cancelled) setLoadError(true);
          return;
        }

        if (!cancelled) {
          setForm({
            courseName: item.courseName,
            comments: item.comments,
            rating: String(item.rating)
          });
        }
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice("");

    const data = {
      courseName: form.courseName.trim(),
      comments: form.comments.trim(),
      rating: Number(form.rating)
    };

    if (!data.courseName || !data.comments) {
      setNotice("Please complete all fields.");
      setSaving(false);
      return;
    }

    try {
      if (id) {
        await axios.put(`${API}/${id}`, data);
      } else {
        await axios.post(API, data);
      }

      navigate("/", {
        state: {
          success: id
            ? "Feedback updated successfully."
            : "Feedback submitted successfully."
        }
      });
    } catch {
      setNotice("Unable to save feedback. Check the backend and try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="main-content">
        <div className="table-message">Loading feedback...</div>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="main-content">
        <Header
          title="Feedback Not Found"
          subtitle="This record could not be loaded."
        />
        <Link to="/" className="button button-primary">
          Return to Dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="main-content">
      <Header
        title={id ? "Update Feedback" : "Add Feedback"}
        subtitle={
          id
            ? "Edit the course feedback details below."
            : "Collect and manage course feedback submissions."
        }
      />

      <div className="form-layout">
        <section className="form-panel">
          <div className="form-panel-header">
            <div className="form-heading-icon">✎</div>
            <div>
              <h2>{id ? "Edit feedback details" : "Feedback details"}</h2>
              <p>Enter the course information and feedback below.</p>
            </div>
          </div>

          {notice && <div className="form-notice">{notice}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field-group">
              <label htmlFor="courseName">Course Name <span>*</span></label>
              <input
                id="courseName"
                name="courseName"
                type="text"
                placeholder="e.g. Full Stack Web Development"
                value={form.courseName}
                onChange={handleChange}
                maxLength="120"
                required
              />
              <small>Enter the name of the course being reviewed.</small>
            </div>

            <div className="field-group">
              <label htmlFor="comments">Feedback Comments <span>*</span></label>
              <textarea
                id="comments"
                name="comments"
                placeholder="Share your experience with this course..."
                rows="5"
                maxLength="2000"
                value={form.comments}
                onChange={handleChange}
                required
              />
              <small>Describe the learning experience and your suggestions.</small>
            </div>

            <div className="field-group">
              <label>Feedback Rating <span>*</span></label>
              <div className="rating-options">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    className={`rating-option ${
                      Number(form.rating) === rating ? "selected" : ""
                    }`}
                    onClick={() =>
                      setForm({ ...form, rating: String(rating) })
                    }
                    aria-pressed={Number(form.rating) === rating}
                    aria-label={`Rate ${rating} out of 5`}
                  >
                    <span>★</span>
                    <small>{rating}</small>
                  </button>
                ))}
              </div>
              <small>
                {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][
                  Number(form.rating)
                ]}
                {" "}· {form.rating} out of 5 stars
              </small>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => navigate("/")}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="button button-primary"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : id
                    ? "Save Changes →"
                    : "Submit Feedback →"}
              </button>
            </div>
          </form>
        </section>

        <aside className="form-aside">
          <div className="info-card">
            <div className="info-icon">ⓘ</div>
            <h3>Before submitting</h3>
            <p>
              Your feedback helps improve course quality and the learning
              experience.
            </p>
            <ul>
              <li>Provide clear and constructive comments.</li>
              <li>Choose the rating that best reflects your experience.</li>
              <li>Review your details before submitting.</li>
            </ul>
          </div>

          <div className="rating-guide">
            <h3>Rating guide</h3>
            {[5, 4, 3, 2, 1].map((rating) => (
              <div className="guide-row" key={rating}>
                <span className="guide-stars">
                  {"★".repeat(rating)}
                </span>
                <span>
                  {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][
                    rating
                  ]}
                </span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}

function AppContent() {
  const location = useLocation();
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (location.state?.success) {
      setToast(location.state.success);
      window.history.replaceState({}, document.title);
      const timer = setTimeout(() => setToast(""), 3500);
      return () => clearTimeout(timer);
    }
  }, [location]);

  return (
    <div className="app-shell">
      <Sidebar />

      {toast && (
        <div className="toast-message" role="status">
          <span>✓</span> {toast}
          <button onClick={() => setToast("")} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/feedback" element={<AllFeedback />} />
        <Route path="/add" element={<FeedbackForm />} />
        <Route path="/update/:id" element={<FeedbackForm />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
