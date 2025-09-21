import "../styles/AppointmentsList.css";
import React, { useState, useEffect } from 'react';
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom"; 
import AppointmentBanner from "../components/AppointmentBanner";
import { checkTokenAndRedirect } from "../utils/auth";
import API from "../utils/axiosConfig";
import greenStar from "../assets/green_star.png";
import emptyStar from "../assets/empty_star.png";

const Appointments = () => {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedStars, setSelectedStars] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const role = localStorage.getItem("userRole");
  const [reviewedAppointments, setReviewedAppointments] = useState([]);


  const statusStyles = {
    confirmed: { bg: 'rgba(205, 254, 101, 0.72)', text: '#409261' },
    completed: { bg: 'rgba(228, 228, 228, 1)', text: '#3F3748' },
    missed: { bg: 'rgba(255, 139, 22, 0.31)', text: '#DF814B' },
    canceled: { bg: 'rgba(229, 150, 150, 0.4)', text: '#DF4B4B' }
  };

  const handleCancelClick = (appointment) => {
    const now = new Date();
    const appointmentTime = new Date(appointment.rawDateTime);
    const diffInHours = (appointmentTime - now) / (1000 * 60 * 60);
    setSelectedAppointment(appointment);

    if (role === "ADMIN" || diffInHours >= 24) {
      setShowCancelModal(true);
    } else {
      setShowErrorModal(true);
    }
  };

  useEffect(() => {
    checkTokenAndRedirect(); 
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        const userId = localStorage.getItem("userId");

        if (role === "PATIENT") {
          const response = await API.get(`/appointment/user/${userId}`);
          const transformed = response.data.map(item => ({
            id: item.id,
            doctor: item.doctorName,
            speciality: item.doctorSpecialty,
            date: new Date(item.appointmentDate).toLocaleDateString(),
            time: new Date(item.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: item.status.toLowerCase(),
            rawDateTime: new Date(item.appointmentDate)
          }));
          setAppointments(transformed.sort(sortAppointments));
        }

        if (role === "ADMIN") {
          const response = await API.get(`/admin/appointment/all`);
          const transformed = response.data.map(item => ({
            id: item.id,
            doctor: item.doctorName,
            speciality: item.doctorSpecialty,
            date: new Date(item.appointmentDate).toLocaleDateString(),
            time: new Date(item.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: item.status?.toLowerCase(),
            rawDateTime: new Date(item.appointmentDate),
            patientName: item.userName
          }));
          setAppointments(transformed.sort(sortAppointments));
        }
      } catch (error) {
        console.error("Error while loading appts", error);
      }
    };
    fetchAppointments();
  }, [API_BASE_URL]);

  const filteredAppointments =
    role === "ADMIN"
      ? appointments.filter(appt => appt.patientName?.toLowerCase().includes(searchTerm.toLowerCase()))
      : appointments;

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const currentAppointments = filteredAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const sortAppointments = (a, b) => {
    const statusPriority = {
      confirmed: 1,
      completed: 2,
      missed: 3,
      canceled: 4
    };
    const statusA = statusPriority[a.status] || 5;
    const statusB = statusPriority[b.status] || 5;
    if (statusA !== statusB) return statusA - statusB;
    return new Date(a.rawDateTime) - new Date(b.rawDateTime);
  };

  const handleLeaveReviewClick = (appointment) => {
    setSelectedAppointment(appointment);
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      await API.post(`/reviews/add`, {
        appointmentId: selectedAppointment.id,
        text: reviewText,
        stars: selectedStars
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowReviewModal(false);
      setReviewText("");
      setSelectedStars(0);
    } catch (err) {
      console.error("Error submitting review:", err);
    }
  };

  return (
    <>
      <Header />
      <div className="page-container">
        <div className="content-wrapper">
          <div className="breadcrumb-fix">
            <div className="breadcrumb-appointments">
              <Link to="/" className="breadcrumb-link">Home</Link>
              <span> / </span>
              <span className="active-page">Appointments</span>
            </div>
            {role === "ADMIN" && (
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Search by patient name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="table-scroll">
            <table className="appointments-table">
              <thead>
                <tr>
                  {role === "ADMIN" && <th>Patient</th>}
                  <th>Doctor</th>
                  <th>Speciality</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {currentAppointments.map((appointment) => {
                  const status = appointment.status.toLowerCase();
                  return (
                    <tr key={appointment.id}>
                      {role === "ADMIN" && <td className="bold-doctor">{appointment.patientName}</td>}
                      <td className="bold-doctor">{appointment.doctor}</td>
                      <td>{appointment.speciality}</td>
                      <td>{appointment.date}</td>
                      <td>{appointment.time}</td>
                      <td>
                        <div className="status-container">
                          <div
                            className="status-rectangle"
                            style={{
                              backgroundColor: statusStyles[status].bg,
                              color: statusStyles[status].text,
                              '--eclipse-color': statusStyles[status].text
                            }}
                          >
                            {appointment.status}
                          </div>
                        </div>
                      </td>
                      <td>
                        {status === 'confirmed' && (
                          <div className="x-button-container">
                            <button className="x-button" onClick={() => handleCancelClick(appointment)}>X
                              <span className="cancel-tooltip">Cancel appointment</span>
                            </button>
                          </div>
                        )}
                        {status === 'completed' && role === 'ADMIN' && (
                          <button className="missed-button" onClick={async () => {
                            try {
                              await API.put(`/api/admin/appointment/missed/${appointment.id}`);
                              setAppointments(prev => prev.map(appt => appt.id === appointment.id ? { ...appt, status: "missed" } : appt));
                            } catch (err) {
                              console.error("Failed to mark as missed:", err);
                            }
                          }}>Mark as Missed</button>
                        )}
                        {status === 'completed' && role === 'PATIENT' && (
                          <button className="review-button" onClick={() => handleLeaveReviewClick(appointment)}>
                            Leave a Review
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination-section">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  className={`page-button ${currentPage === index + 1 ? 'active' : ''}`}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {(index + 1).toString().padStart(2, '0')}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <AppointmentBanner />
      <Footer />

      {showReviewModal && selectedAppointment && (
        <div className="appt-modal-overlay">
          <div className="appt-modal">
            <button className="close-btn" onClick={() => setShowReviewModal(false)}>✕</button>
            <h2>How was your visit?</h2>
            <p>Share your experience</p>
            <div className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <img
                  key={star}
                  src={selectedStars >= star ? greenStar : emptyStar}
                  alt={`${star} star`}
                  onClick={() => setSelectedStars(star)}
                  style={{ cursor: 'pointer', width: '32px' }}
                />
              ))}
            </div>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Your Review..."
              style={{ width: '90%', minHeight: '100px', marginTop: '12px', resize: 'none', borderRadius: '8px', padding: '8px' }}
            />
            <button className="confirm-btn" onClick={submitReview}>Send Review</button>
          </div>
        </div>
      )}

      {showCancelModal && selectedAppointment && (
        <div className="appt-modal-overlay">
          <div className="appt-modal">
            <h2>Are you sure?</h2>
            <p>Do you really want to cancel this appointment?</p>
            <div className="appt-modal-buttons">
              <button className="yes-btn" onClick={() => setShowCancelModal(false)}>Cancel</button>
              <button className="cancel-btn" onClick={async () => {
                try {
                  const userId = localStorage.getItem("userId");
                  if (role === "ADMIN") {
                    await API.put(`/api/admin/appointment/cancel`, null, { params: { appointmentId: selectedAppointment.id } });
                  } else {
                    await API.put(`/api/appointment/user/cancel`, null, {
                      params: { appointmentId: selectedAppointment.id, userId }
                    });
                  }
                  setAppointments((prev) =>
                    prev.map((appt) =>
                      appt.id === selectedAppointment.id ? { ...appt, status: "canceled" } : appt
                    )
                  );
                  setShowCancelModal(false);
                  setSelectedAppointment(null);
                } catch (error) {
                  console.error("Cancel error:", error);
                  setShowCancelModal(false);
                  setShowErrorModal(false);
                }
              }}>Yes</button>
            </div>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Unable to cancel</h2>
            <p>
              Your appointment is scheduled less than 24 hours in advance.
              <br />Please contact administration to cancel it.
            </p>
            <div className="modal-buttons center">
              <button className="cancel-btn" onClick={() => setShowErrorModal(false)}>OK</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Appointments;
