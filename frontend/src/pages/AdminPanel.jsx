import { useEffect, useState } from "react";
import api from "../api/axios.js";

const emptyForm = {
  role: "donor",
  name: "",
  email: "",
  password: "",
  phone: "",
  bloodGroup: "O+",
  city: "",
  address: "",
  age: "",
  gender: "Prefer not to say",
};

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("donors");
  const [donors, setDonors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [requests, setRequests] = useState([]);
  const [queries, setQueries] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadAdminData = async () => {
    try {
      const [donorRes, patientRes, requestRes, queryRes] = await Promise.all([
        api.get("/admin/donors"),
        api.get("/admin/patients"),
        api.get("/admin/requests"),
        api.get("/admin/queries"),
      ]);

      setDonors(donorRes.data.donors || []);
      setPatients(patientRes.data.patients || []);
      setRequests(requestRes.data.requests || []);
      setQueries(queryRes.data.queries || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load admin data.");
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await api.post("/admin/users", form);
      setMessage("User added successfully.");
      setForm(emptyForm);
      loadAdminData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add user.");
    }
  };

  const handleEditUser = async (user) => {
    const name = prompt("Enter name", user.name);
    if (name === null) return;

    const phone = prompt("Enter phone", user.phone);
    if (phone === null) return;

    const city = prompt("Enter city", user.city);
    if (city === null) return;

    const bloodGroup = prompt("Enter blood group", user.bloodGroup);
    if (bloodGroup === null) return;

    try {
      await api.put(`/admin/users/${user._id}`, {
        name,
        phone,
        city,
        bloodGroup,
      });

      setMessage("User updated successfully.");
      loadAdminData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user.");
    }
  };

  const handleDeleteUser = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    try {
      await api.delete(`/admin/users/${id}`);
      setMessage("User deleted successfully.");
      loadAdminData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user.");
    }
  };

  const handleRequestStatus = async (request) => {
    try {
      await api.put(`/admin/requests/${request._id}`, {
        isOpen: !request.isOpen,
      });

      setMessage("Blood request status updated.");
      loadAdminData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update request.");
    }
  };

  const handleDeleteRequest = async (id) => {
    const confirmDelete = window.confirm("Delete this blood request?");
    if (!confirmDelete) return;

    try {
      await api.delete(`/admin/requests/${id}`);
      setMessage("Blood request deleted.");
      loadAdminData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete request.");
    }
  };

  const handleQueryStatus = async (query) => {
    const status = prompt("Enter status: New, In Progress, Resolved", query.status);
    if (!status) return;

    try {
      await api.put(`/admin/queries/${query._id}`, { status });
      setMessage("Query status updated.");
      loadAdminData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update query.");
    }
  };

  const handleDeleteQuery = async (id) => {
    const confirmDelete = window.confirm("Delete this support query?");
    if (!confirmDelete) return;

    try {
      await api.delete(`/admin/queries/${id}`);
      setMessage("Query deleted.");
      loadAdminData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete query.");
    }
  };

  const usersToShow = activeTab === "donors" ? donors : patients;

  return (
    <section className="section light-section">
      <div className="container dashboard-header">
        <div>
          <span className="eyebrow">Admin Panel</span>
          <h1>Manage Blood Bank System</h1>
          <p>Admin can manage donors, patients, blood requests and support queries.</p>
        </div>
      </div>

      <div className="container admin-tabs">
        <button onClick={() => setActiveTab("donors")} className={activeTab === "donors" ? "active" : ""}>
          Donors ({donors.length})
        </button>
        <button onClick={() => setActiveTab("patients")} className={activeTab === "patients" ? "active" : ""}>
          Patients ({patients.length})
        </button>
        <button onClick={() => setActiveTab("requests")} className={activeTab === "requests" ? "active" : ""}>
          Need Blood ({requests.length})
        </button>
        <button onClick={() => setActiveTab("queries")} className={activeTab === "queries" ? "active" : ""}>
          Queries ({queries.length})
        </button>
      </div>

      <div className="container">
        {message && <div className="alert success">{message}</div>}
        {error && <div className="alert error">{error}</div>}
      </div>

      {(activeTab === "donors" || activeTab === "patients") && (
        <div className="container admin-box">
          <form className="admin-add-form glass-card" onSubmit={handleAddUser}>
            <h2>Add Donor / Patient</h2>

            <div className="admin-form-grid">
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="donor">Donor</option>
                <option value="patient">Patient</option>
              </select>

              <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} required />
              <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
              <input name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
              <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} required />

              <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange}>
                <option>O+</option>
                <option>O-</option>
                <option>A+</option>
                <option>A-</option>
                <option>B+</option>
                <option>B-</option>
                <option>AB+</option>
                <option>AB-</option>
              </select>

              <input name="city" placeholder="City" value={form.city} onChange={handleChange} required />
              <input name="age" placeholder="Age" value={form.age} onChange={handleChange} />

              <select name="gender" value={form.gender} onChange={handleChange}>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
                <option>Prefer not to say</option>
              </select>

              <input name="address" placeholder="Address" value={form.address} onChange={handleChange} />
            </div>

            <button className="btn btn-primary">Add User</button>
          </form>

          <div className="admin-table-card glass-card">
            <h2>{activeTab === "donors" ? "All Donors" : "All Patients"}</h2>

            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Blood</th>
                  <th>City</th>
                  <th>Phone</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {usersToShow.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.bloodGroup}</td>
                    <td>{user.city}</td>
                    <td>{user.phone}</td>
                    <td>
                      <button className="small-btn edit" onClick={() => handleEditUser(user)}>Edit</button>
                      <button className="small-btn delete" onClick={() => handleDeleteUser(user._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {usersToShow.length === 0 && <p>No users found.</p>}
          </div>
        </div>
      )}

      {activeTab === "requests" && (
        <div className="container admin-table-card glass-card">
          <h2>Need Blood Requests</h2>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Blood</th>
                <th>Units</th>
                <th>Hospital</th>
                <th>City</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((request) => (
                <tr key={request._id}>
                  <td>{request.patientName}</td>
                  <td>{request.bloodGroup}</td>
                  <td>{request.units}</td>
                  <td>{request.hospitalName}</td>
                  <td>{request.city}</td>
                  <td>{request.isOpen ? "Open" : "Closed"}</td>
                  <td>
                    <button className="small-btn edit" onClick={() => handleRequestStatus(request)}>
                      {request.isOpen ? "Close" : "Open"}
                    </button>
                    <button className="small-btn delete" onClick={() => handleDeleteRequest(request._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {requests.length === 0 && <p>No blood requests found.</p>}
        </div>
      )}

      {activeTab === "queries" && (
        <div className="container admin-table-card glass-card">
          <h2>Support Queries</h2>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Subject</th>
                <th>Message</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {queries.map((query) => (
                <tr key={query._id}>
                  <td>{query.name}</td>
                  <td>{query.email}</td>
                  <td>{query.subject}</td>
                  <td>{query.message}</td>
                  <td>{query.status}</td>
                  <td>
                    <button className="small-btn edit" onClick={() => handleQueryStatus(query)}>
                      Status
                    </button>
                    <button className="small-btn delete" onClick={() => handleDeleteQuery(query._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {queries.length === 0 && <p>No queries found.</p>}
        </div>
      )}
    </section>
  );
};

export default AdminPanel;