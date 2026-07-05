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

const emptyCampForm = {
  title: "",
  location: "",
  city: "",
  date: "",
  startTime: "",
  endTime: "",
  description: "",
  organizerName: "LifeDrop Blood Bank",
  contactNumber: "",
  maxSlots: 50,
};

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("donors");

  const [donors, setDonors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [requests, setRequests] = useState([]);
  const [queries, setQueries] = useState([]);
  const [camps, setCamps] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [campForm, setCampForm] = useState(emptyCampForm);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadAdminData = async () => {
    try {
      const [donorRes, patientRes, requestRes, queryRes, campRes] =
        await Promise.all([
          api.get("/admin/donors"),
          api.get("/admin/patients"),
          api.get("/admin/requests"),
          api.get("/admin/queries"),
          api.get("/admin/camps").catch(() => ({ data: { camps: [] } })),
        ]);

      setDonors(donorRes.data.donors || []);
      setPatients(patientRes.data.patients || []);
      setRequests(requestRes.data.requests || []);
      setQueries(queryRes.data.queries || []);
      setCamps(campRes.data.camps || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load admin data.");
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const clearAlerts = () => {
    setMessage("");
    setError("");
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCampChange = (e) => {
    setCampForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    clearAlerts();

    try {
      await api.post("/admin/users", {
        ...form,
        age: form.age ? Number(form.age) : undefined,
      });

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

    clearAlerts();

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
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) return;

    clearAlerts();

    try {
      await api.delete(`/admin/users/${id}`);
      setMessage("User deleted successfully.");
      loadAdminData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user.");
    }
  };

  const handleVerifyDonor = async (donor) => {
    clearAlerts();

    try {
      await api.patch(`/admin/donors/${donor._id}/verify`, {
        isVerifiedDonor: !donor.isVerifiedDonor,
        verificationNote: !donor.isVerifiedDonor
          ? "Verified by admin"
          : "Verification removed by admin",
      });

      setMessage(
        !donor.isVerifiedDonor
          ? "Donor verified successfully."
          : "Donor verification removed."
      );

      loadAdminData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to verify donor.");
    }
  };

  const handleHospitalVerify = async (request) => {
    clearAlerts();

    try {
      await api.patch(`/admin/requests/${request._id}/verify-hospital`, {
        isHospitalVerified: !request.isHospitalVerified,
      });

      setMessage(
        !request.isHospitalVerified
          ? "Hospital request verified."
          : "Hospital verification removed."
      );

      loadAdminData();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to verify hospital request."
      );
    }
  };

  const handleRequestStatusChange = async (requestId, status) => {
    clearAlerts();

    try {
      await api.patch(`/admin/requests/${requestId}/status`, { status });

      setMessage("Blood request status updated.");
      loadAdminData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update request.");
    }
  };

  const handleRequestOpenClose = async (request) => {
    clearAlerts();

    try {
      await api.put(`/admin/requests/${request._id}`, {
        isOpen: !request.isOpen,
      });

      setMessage("Blood request open/close status updated.");
      loadAdminData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update request.");
    }
  };

  const handleDeleteRequest = async (id) => {
    const confirmDelete = window.confirm("Delete this blood request?");
    if (!confirmDelete) return;

    clearAlerts();

    try {
      await api.delete(`/admin/requests/${id}`);
      setMessage("Blood request deleted.");
      loadAdminData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete request.");
    }
  };

  const handleQueryStatus = async (query) => {
    const status = prompt(
      "Enter status: New, In Progress, Resolved",
      query.status
    );

    if (!status) return;

    clearAlerts();

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

    clearAlerts();

    try {
      await api.delete(`/admin/queries/${id}`);
      setMessage("Query deleted.");
      loadAdminData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete query.");
    }
  };

  const handleCreateCamp = async (e) => {
    e.preventDefault();
    clearAlerts();

    try {
      await api.post("/admin/camps", {
        ...campForm,
        maxSlots: campForm.maxSlots ? Number(campForm.maxSlots) : 50,
      });

      setMessage("Blood camp created successfully.");
      setCampForm(emptyCampForm);
      loadAdminData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create blood camp.");
    }
  };

  const handleDeleteCamp = async (id) => {
    const confirmDelete = window.confirm("Delete this blood camp?");
    if (!confirmDelete) return;

    clearAlerts();

    try {
      await api.delete(`/admin/camps/${id}`);
      setMessage("Blood camp deleted successfully.");
      loadAdminData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete blood camp.");
    }
  };

  const handleToggleCampActive = async (camp) => {
    clearAlerts();

    try {
      await api.put(`/admin/camps/${camp._id}`, {
        isActive: !camp.isActive,
      });

      setMessage("Blood camp status updated.");
      loadAdminData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update blood camp.");
    }
  };

  const usersToShow = activeTab === "donors" ? donors : patients;

  return (
    <section className="section light-section">
      <div className="container dashboard-header">
        <div>
          <span className="eyebrow">Admin Panel</span>
          <h1>Manage Blood Bank System</h1>
          <p>
            Admin can manage donors, patients, blood requests, verification,
            camps and support queries.
          </p>
        </div>
      </div>

      <div className="container admin-tabs">
        <button
          type="button"
          onClick={() => setActiveTab("donors")}
          className={activeTab === "donors" ? "active" : ""}
        >
          Donors ({donors.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("patients")}
          className={activeTab === "patients" ? "active" : ""}
        >
          Patients ({patients.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("requests")}
          className={activeTab === "requests" ? "active" : ""}
        >
          Need Blood ({requests.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("camps")}
          className={activeTab === "camps" ? "active" : ""}
        >
          Camps ({camps.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("queries")}
          className={activeTab === "queries" ? "active" : ""}
        >
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

              <input
                name="name"
                placeholder="Full name"
                value={form.name}
                onChange={handleChange}
                required
              />

              <input
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
              />

              <input
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
              />

              <input
                name="phone"
                placeholder="Phone"
                value={form.phone}
                onChange={handleChange}
                required
              />

              <select
                name="bloodGroup"
                value={form.bloodGroup}
                onChange={handleChange}
              >
                <option>O+</option>
                <option>O-</option>
                <option>A+</option>
                <option>A-</option>
                <option>B+</option>
                <option>B-</option>
                <option>AB+</option>
                <option>AB-</option>
              </select>

              <input
                name="city"
                placeholder="City"
                value={form.city}
                onChange={handleChange}
                required
              />

              <input
                name="age"
                placeholder="Age"
                value={form.age}
                onChange={handleChange}
              />

              <select name="gender" value={form.gender} onChange={handleChange}>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
                <option>Prefer not to say</option>
              </select>

              <input
                name="address"
                placeholder="Address"
                value={form.address}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Add User
            </button>
          </form>

          <div className="admin-table-card glass-card">
            <h2>{activeTab === "donors" ? "All Donors" : "All Patients"}</h2>

            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Blood</th>
                    <th>City</th>
                    <th>Phone</th>
                    {activeTab === "donors" && <th>Verified</th>}
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {usersToShow.map((item) => (
                    <tr key={item._id}>
                      <td>{item.name}</td>
                      <td>{item.email}</td>
                      <td>{item.bloodGroup}</td>
                      <td>{item.city}</td>
                      <td>{item.phone}</td>

                      {activeTab === "donors" && (
                        <td>
                          {item.isVerifiedDonor ? (
                            <span className="admin-badge verified">
                              Verified
                            </span>
                          ) : (
                            <span className="admin-badge pending">Pending</span>
                          )}
                        </td>
                      )}

                      <td>
                        <button
                          type="button"
                          className="small-btn edit"
                          onClick={() => handleEditUser(item)}
                        >
                          Edit
                        </button>

                        {activeTab === "donors" && (
                          <button
                            type="button"
                            className={
                              item.isVerifiedDonor
                                ? "small-btn warning"
                                : "small-btn success"
                            }
                            onClick={() => handleVerifyDonor(item)}
                          >
                            {item.isVerifiedDonor ? "Unverify" : "Verify"}
                          </button>
                        )}

                        <button
                          type="button"
                          className="small-btn delete"
                          onClick={() => handleDeleteUser(item._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {usersToShow.length === 0 && <p>No users found.</p>}
          </div>
        </div>
      )}

      {activeTab === "requests" && (
        <div className="container admin-table-card glass-card">
          <h2>Need Blood Requests</h2>

          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Blood</th>
                  <th>Units</th>
                  <th>Hospital</th>
                  <th>City</th>
                  <th>Open</th>
                  <th>Status</th>
                  <th>Hospital Verify</th>
                  <th>Matched Donors</th>
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
                      <select
                        className="admin-status-select"
                        value={request.status || "pending"}
                        onChange={(e) =>
                          handleRequestStatusChange(request._id, e.target.value)
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="donor_found">Donor Found</option>
                        <option value="contacted">Contacted</option>
                        <option value="completed">Completed</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>

                    <td>
                      {request.isHospitalVerified ? (
                        <span className="admin-badge verified">Verified</span>
                      ) : (
                        <span className="admin-badge pending">Pending</span>
                      )}

                      <button
                        type="button"
                        className="small-btn edit"
                        onClick={() => handleHospitalVerify(request)}
                      >
                        {request.isHospitalVerified ? "Unverify" : "Verify"}
                      </button>
                    </td>

                    <td>{request.matchedDonors?.length || 0}</td>

                    <td>
                      <button
                        type="button"
                        className="small-btn edit"
                        onClick={() => handleRequestOpenClose(request)}
                      >
                        {request.isOpen ? "Close" : "Open"}
                      </button>

                      <button
                        type="button"
                        className="small-btn delete"
                        onClick={() => handleDeleteRequest(request._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {requests.length === 0 && <p>No blood requests found.</p>}
        </div>
      )}

      {activeTab === "camps" && (
        <div className="container admin-box">
          <form
            className="admin-add-form glass-card"
            onSubmit={handleCreateCamp}
          >
            <h2>Create Blood Camp</h2>

            <div className="admin-form-grid">
              <input
                name="title"
                placeholder="Camp title"
                value={campForm.title}
                onChange={handleCampChange}
                required
              />

              <input
                name="location"
                placeholder="Location"
                value={campForm.location}
                onChange={handleCampChange}
                required
              />

              <input
                name="city"
                placeholder="City"
                value={campForm.city}
                onChange={handleCampChange}
                required
              />

              <input
                type="date"
                name="date"
                value={campForm.date}
                onChange={handleCampChange}
                required
              />

              <input
                name="startTime"
                placeholder="Start time"
                value={campForm.startTime}
                onChange={handleCampChange}
              />

              <input
                name="endTime"
                placeholder="End time"
                value={campForm.endTime}
                onChange={handleCampChange}
              />

              <input
                name="organizerName"
                placeholder="Organizer name"
                value={campForm.organizerName}
                onChange={handleCampChange}
              />

              <input
                name="contactNumber"
                placeholder="Contact number"
                value={campForm.contactNumber}
                onChange={handleCampChange}
              />

              <input
                type="number"
                name="maxSlots"
                placeholder="Max slots"
                min="1"
                value={campForm.maxSlots}
                onChange={handleCampChange}
              />

              <textarea
                name="description"
                placeholder="Camp description"
                value={campForm.description}
                onChange={handleCampChange}
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Create Camp
            </button>
          </form>

          <div className="admin-table-card glass-card">
            <h2>Blood Camps</h2>

            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>City</th>
                    <th>Date</th>
                    <th>Slots</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {camps.map((camp) => (
                    <tr key={camp._id}>
                      <td>{camp.title}</td>
                      <td>{camp.city}</td>
                      <td>
                        {camp.date
                          ? new Date(camp.date).toLocaleDateString()
                          : "-"}
                      </td>
                      <td>
                        {camp.registeredDonors?.length || 0}/
                        {camp.maxSlots || 50}
                      </td>
                      <td>{camp.isActive ? "Active" : "Inactive"}</td>
                      <td>
                        <button
                          type="button"
                          className="small-btn edit"
                          onClick={() => handleToggleCampActive(camp)}
                        >
                          {camp.isActive ? "Deactivate" : "Activate"}
                        </button>

                        <button
                          type="button"
                          className="small-btn delete"
                          onClick={() => handleDeleteCamp(camp._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {camps.length === 0 && <p>No camps found.</p>}
          </div>
        </div>
      )}

      {activeTab === "queries" && (
        <div className="container admin-table-card glass-card">
          <h2>Support Queries</h2>

          <div className="admin-table-scroll">
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
                      <button
                        type="button"
                        className="small-btn edit"
                        onClick={() => handleQueryStatus(query)}
                      >
                        Status
                      </button>

                      <button
                        type="button"
                        className="small-btn delete"
                        onClick={() => handleDeleteQuery(query._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {queries.length === 0 && <p>No queries found.</p>}
        </div>
      )}
    </section>
  );
};

export default AdminPanel;