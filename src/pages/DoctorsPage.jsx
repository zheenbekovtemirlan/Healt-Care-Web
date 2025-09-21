import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../utils/axiosConfig";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AppointmentBanner from "../components/AppointmentBanner";
import "../styles/DoctorsList.css";
import { checkTokenAndRedirect, logout } from "../utils/auth";

const DoctorsPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const specialtyId = queryParams.get("specialtyId");
  const [doctors, setDoctors] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [specialties, setSpecialties] = useState([]);

  // Controls the current page in pagination
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;
  const navigate = useNavigate();

  const totalPages = Math.ceil(doctors.length / itemsPerPage);
  const currentDoctors = doctors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const [newDoctor, setNewDoctor] = useState({
    firstName: "",
    lastName: "",
    specialization: "",
    specialtyId: "",
    description: "",
    experience: 0,
    rating: 0,
  });

  const userRole = localStorage.getItem("userRole");
  const token = localStorage.getItem("jwtToken");
  const isAdmin = userRole === "ADMIN";

  useEffect(() => {
    if (specialtyId) {
      API.get(`/doctors?specialtyId=${specialtyId}`)
        .then((response) => {
          setDoctors(response.data);
        })
        .catch((error) => {
          console.error("Error fetching doctors:", error);
        });
    }
  }, [specialtyId]);

  useEffect(() => {
    API.get("/specialties")
      .then((res) => setSpecialties(res.data))
      .catch((err) => console.error("Error loading specialties", err));
  }, []);

  const handleDeleteDoctor = (doctorId) => {
    if (!doctorId) return;
    checkTokenAndRedirect();

    API.delete(`/admin/doctors/${doctorId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(() => {
        setDoctors(doctors.filter((doc) => doc.id !== doctorId));
      })
      .catch((error) => {
        console.error("Error deleting doctor:", error.response || error.message);
        alert("Failed to delete doctor: " + (error.response?.data?.message || error.message));
      });
  };

  return (
    <>
      <Header />
      <div className="doctors-container">
        <div className="breadcrumb">
          <a href="/" className="breadcrumb-link">Home</a>
          <span> / </span>
          <span className="active">Choose your Doctor</span>
        </div>

        {isAdmin && (
          <button className="add-doctor-btn" onClick={() => setShowAddModal(true)}>
            Add new Doctor +
          </button>
        )}

        <div className="doctors-grid">
          {currentDoctors.map((doctor) => (
            <div className={`doctor-card ${isAdmin ? "admin-card" : ""}`} key={doctor.id}>
              {isAdmin && (
                <button
                  className="delete-btn"
                  onClick={() => {
                    setSelectedDoctorId(doctor.id);
                    setShowDeleteModal(true);
                  }}
                >
                  Delete
                </button>
              )}
              <div className="image-overlay">
                <img
                  src={doctor.imageUrl || "/default-profile.png"}
                  alt={doctor.name}
                  className="doctor-img"
                />
                <div className="doctor-info">
                  <h4 className="doctor-name">{doctor.name}</h4>
                  <button
                    className="more-info-btn"
                    onClick={() => navigate(`/doctors/${doctor.id}`, { state: { specialtyId } })}
                  >
                    More info
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                className={`page-btn ${currentPage === index + 1 ? "active" : ""}`}
                onClick={() => setCurrentPage(index + 1)}
              >
                {(index + 1).toString().padStart(2, '0')}
              </button>
            ))}
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Are you sure?</h2>
            <p>Do you really want to remove the doctor?</p>
            <div className="modal-buttons">
              <button className="cancel-btn" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button
                className="yes-btn"
                onClick={() => {
                  handleDeleteDoctor(selectedDoctorId);
                  setShowDeleteModal(false);
                }}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal doctor-modal">
            <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            <h2 className="modal-title">Add new Doctor</h2>

            <form
              className="doctor-form"
              onSubmit={(e) => {
                e.preventDefault();
                checkTokenAndRedirect();

                const formData = new FormData();
                formData.append("name", newDoctor.firstName + " " + newDoctor.lastName);
                formData.append("specialtyId", parseInt(newDoctor.specialtyId));
                formData.append("experience", newDoctor.experience);
                formData.append("rating", newDoctor.rating);
                formData.append("description", newDoctor.description);
                if (selectedFile) {
                  formData.append("image", selectedFile);
                }

                API.post("/admin/doctors", formData, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                  },
                })
                  .then((res) => {
                    setDoctors([...doctors, res.data]);
                    setShowAddModal(false);
                    setNewDoctor({
                      firstName: "",
                      lastName: "",
                      specialization: "",
                      description: "",
                      experience: "",
                      rating: 0,
                    });
                    setSelectedFile(null);
                  })
                  .catch((err) => {
                    console.error("Error adding doctor:", err);
                    alert("Failed to add doctor");
                  });
              }}
            >
              <div className="add-doctor-form-left">
                <div className="image-placeholder">
                  {selectedFile ? (
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }}
                    />
                  ) : (
                    <span style={{ fontSize: "2rem", color: "#ccc" }}>+</span>
                  )}
                </div>

                <label htmlFor="doctorImageUpload" className="edit-text" style={{ cursor: "pointer", position: "relative" }}>
                  Edit
                </label>
                <input
                  id="doctorImageUpload"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                />

                <label className="label-small">Experience</label>
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="99"
                  maxLength="2"
                  value={newDoctor.experience}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d{0,2}$/.test(value)) {
                      setNewDoctor({ ...newDoctor, experience: value });
                    }
                  }}
                  style={{ position: "relative", zIndex: 2, background: "#fff" }}
                  placeholder="0–99"
                />

                <div className="rating">
                  <label className="label-small">Rating: </label>
                  <strong>{parseFloat(newDoctor.rating || 0).toFixed(2)}</strong>
                </div>
              </div>

              <div className="add-doctor-form-right">
                <div className="form-row">
                  <div className="form-col">
                    <label>First name</label>
                    <input
                      value={newDoctor.firstName}
                      onChange={(e) => setNewDoctor({ ...newDoctor, firstName: e.target.value })}
                    />
                  </div>
                  <div className="form-col">
                    <label>Last name</label>
                    <input
                      value={newDoctor.lastName}
                      onChange={(e) => setNewDoctor({ ...newDoctor, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <label>Specialization</label>
                <select
                  value={newDoctor.specialtyId}
                  onChange={(e) => setNewDoctor({ ...newDoctor, specialtyId: e.target.value })}
                >
                  <option value="">Choose specialization</option>
                  {specialties.map((spec) => (
                    <option key={spec.id} value={spec.id}>
                      {spec.name}
                    </option>
                  ))}
                </select>

                <label>Description</label>
                <textarea
                  rows="4"
                  value={newDoctor.description}
                  onChange={(e) => setNewDoctor({ ...newDoctor, description: e.target.value })}
                />

                <label className="label-small">Rating</label>
                <input
                  type="number"
                  step="0.01"
                  max="5"
                  min="0"
                  value={newDoctor.rating}
                  readOnly
                />
              </div>

              <button className="submit-btn" type="submit">Yes</button>
            </form>
          </div>
        </div>
      )}
      <AppointmentBanner />
      <Footer />
    </>
  );
};

export default DoctorsPage;

