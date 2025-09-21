import { Link, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/DoctorDetails.css";
import starImg from "../assets/star.png";
import trustImg from "../assets/trust.png";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { checkTokenAndRedirect } from "../utils/auth";
import API from "../utils/axiosConfig";

const DoctorDetailPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [specialtyName, setSpecialtyName] = useState("");
  const [appointmentCounts, setAppointmentCounts] = useState({});
  const [availableSlots, setAvailableSlots] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [doctorRating, setDoctorRating] = useState(null);
  const location = useLocation();
  const specialtyId = location.state?.specialtyId ?? null;
  const [dates, setDates] = useState([]);

  // Generate weekdays for the calendar view, skipping weekends
  const getNextWeekdays = (count = 10, offset = 0) => {
    const days = [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const start = new Date(today);
    const todayDay = today.getDay();
    start.setDate(start.getDate() - ((todayDay + 6) % 7));
    start.setDate(start.getDate() + offset * 7);

    let date = new Date(start);
    while (days.length < count) {
      const dayOfWeek = date.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        const isSameDay = date.toDateString() === today.toDateString();
        const isPast = date < today && !isSameDay;

        days.push({
          date: new Date(date),
          day: date.toLocaleDateString("en-US", { weekday: "short" }),
          label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          isPast,
        });
      }
      date.setDate(date.getDate() + 1);
    }

    return days;
  };

  useEffect(() => {
    const generated = getNextWeekdays(11, weekOffset);
    setDates(generated);
  }, [weekOffset]);

  useEffect(() => {
    const allPast = dates.every((d) => d.isPast);
    if (allPast && weekOffset === 0) {
      setWeekOffset(1);
    }
  }, [dates, weekOffset]);

  useEffect(() => {
    API.get(`/doctors/${id}`)
      .then((res) => setDoctor(res.data))
      .catch((err) => console.error("Failed to load doctor:", err));
  }, [id]);

  useEffect(() => {
    if (!doctor) return;

    API.get("/specialties")
      .then((res) => {
        const found = res.data.find((s) => s.id === doctor.specialtyId);
        setSpecialtyName(found ? found.name : "Unknown specialty");
      })
      .catch((err) => console.error("Failed to load specialties:", err));
  }, [doctor]);

  useEffect(() => {
    if (!doctor?.id || dates.length === 0) return;

    const start = dates[0].date.toISOString().split("T")[0];
    const end = dates.reduce((latest, d) => d.date > latest ? d.date : latest, dates[0].date).toISOString().split("T")[0];

    API.get(`/appointment/${doctor.id}/count`, {
      params: { startDate: start, endDate: end },
    })
      .then((res) => setAppointmentCounts(res.data))
      .catch((err) => console.error("Error loading counts:", err));
  }, [dates, doctor?.id]);

  const handleConfirmAppointment = async () => {
    checkTokenAndRedirect();
    if (!selectedDate || !selectedSlot) return;

    const formattedDate = `${selectedDate.date.getFullYear()}-${String(selectedDate.date.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.date.getDate()).padStart(2, '0')}`;
    const formattedSlot = selectedSlot.length === 5 ? selectedSlot + ":00" : selectedSlot;
    const appointmentDate = `${formattedDate}T${formattedSlot}`;

    const userId = localStorage.getItem("userId");

    try {
      await API.post("/appointment/book", {
        userId: parseInt(userId),
        doctorId: doctor.id,
        appointmentDate: appointmentDate,
      });

      const res = await API.get(`/appointment/${doctor.id}/available-slots`, {
        params: { date: formattedDate },
      });

      setAvailableSlots(res.data);
      setSelectedSlot(null);
      setShowModal(false);

      const start = dates[0].date.toLocaleDateString("sv-SE");
      const end = dates[dates.length - 1].date.toLocaleDateString("sv-SE");

      API.get(`/appointment/${doctor.id}/count`, {
        params: { startDate: start, endDate: end },
      })
        .then((res) => setAppointmentCounts(res.data));
    } catch (err) {
      console.error("Error booking appointment:", err);
    }
  };

  const handleDateClick = (date) => {
    if (date.isPast) return;

    setSelectedDate(date);
    setShowModal(true);

    const formattedDate = `${date.date.getFullYear()}-${String(date.date.getMonth() + 1).padStart(2, '0')}-${String(date.date.getDate()).padStart(2, '0')}`;

    API.get(`/appointment/${doctor.id}/available-slots`, {
      params: { date: formattedDate }
    })
      .then((res) => setAvailableSlots(res.data));
  };

  const dateRangeLabel = dates.length > 0
    ? `${dates[0].day}, ${dates[0].label} – ${dates[dates.length - 1].day}, ${dates[dates.length - 1].label}`
    : "Loading...";

  useEffect(() => {
    if (!doctor?.id) return;
    API.get(`/reviews/get/${doctor.id}`)
      .then((res) => setReviews(res.data))
      .catch((err) => {
        console.error("Error loading reviews:", err);
        setReviews([]);
      });
  }, [doctor?.id]);

  useEffect(() => {
    if (!doctor?.id) return;
    API.get("/reviews/rating", {
      params: { doctorId: doctor.id }
    })
      .then((res) => setDoctorRating(res.data))
      .catch((err) => console.error("Error loading doctor rating", err));
  }, [doctor?.id]);

  return (
    <>
      <Header />
      {!doctor ? (
        <div className="doctor-detail-container">
          <p>Loading doctor...</p>
        </div>
      ) : (
        <div className="doctor-detail-container">
          <div className="breadcrumb">
            <Link
              to={specialtyId ? `/doctors?specialtyId=${specialtyId}` : "/doctors"}
              className="breadcrumb-link"
            >
              Doctors
            </Link>
            <span> / </span>
            <span className="active">Details</span>
          </div>

          <div className="top-info-row">
            <div className="doctor-header">
              <div className="doctor-photo">
                <img src={doctor.imageUrl || "https://via.placeholder.com/250x300.png?text=Doctor"} alt={doctor.name || "Doctor"} />
              </div>
              <div className="doctor-main-info">
                <h2>{doctor.name}</h2>
                <p className="specialty">{specialtyName}</p>
                <p className="experience">Experience: {doctor.experience} years</p>
                <div className="doctor-rating">
                  <p>Rating: {doctorRating ?? "–"}</p>
                  <img src={starImg} alt="star" className="static-star" />
                </div>
              </div>
            </div>

            <div className="calendar-summary">
              <h4>Book an appointment for free</h4>
              <h5>{dateRangeLabel}</h5>
              <div className="calendar-cards">
                {dates.slice(0, 10).map((date, index) => {
                  const dateKey = `${date.date.getFullYear()}-${String(date.date.getMonth() + 1).padStart(2, '0')}-${String(date.date.getDate()).padStart(2, '0')}`;
                  const appointmentCount = appointmentCounts[dateKey] ?? 0;

                  return (
                    <div
                      key={index}
                      className={`calendar-card ${appointmentCount === 0 || date.isPast ? "no-appts" : ""}`}
                      onClick={() => {
                        if (appointmentCount > 0 && !date.isPast) {
                          handleDateClick(date);
                        }
                      }}
                    >
                      <p className="calendar-day">{date.day}</p>
                      <p className="calendar-date">{date.label}</p>
                      <p className="calendar-appts">{appointmentCount} appts</p>
                    </div>
                  );
                })}
              </div>
              <div className="calendar-pagination-inside">
                <button
                  className="page-btn"
                  onClick={() => setWeekOffset((prev) => Math.max(0, prev - 1))}
                  disabled={weekOffset === 0}
                >
                  ← Previous
                </button>
                <button
                  className="page-btn"
                  onClick={() => setWeekOffset((prev) => prev + 1)}
                >
                  Next →
                </button>
              </div>
            </div>
          </div>

          <div className="description-section">
            <h3>About {doctor.name}</h3>
            <p>{doctor.description}</p>
          </div>

          <div className="trust-box">
            <img src={trustImg} alt="trust" className="trust-icon" />
            <p className="trust-text">
              Your trust is our top concern, so providers can’t pay to alter or remove reviews.
            </p>
          </div>

          <div className="reviews-section">
            <h3>Patient reviews</h3>
            {reviews.length === 0 ? (
              <p>No reviews yet.</p>
            ) : (
              reviews.map((review, index) => (
                <div key={index} className="review">
                  <div className="review-stars">
                    {[...Array(review.stars)].map((_, i) => (
                      <img key={i} src={starImg} alt="star" className="star" />
                    ))}
                  </div>
                  <p className="review-text">{review.text}</p>
                  <p className="review-meta">
                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })} — <strong>{review.userFirstName} {review.userLastName}</strong>
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {showModal && selectedDate && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            <h2 className="modal-title">Available appointments</h2>
            <p className="modal-subtitle">Click a time to book for free</p>
            <h3 className="modal-date">{selectedDate.day}, {selectedDate.label}</h3>
            <div className="slots-grid">
              {availableSlots.length > 0 ? (
                availableSlots.map((time, i) => (
                  <button
                    key={i}
                    className={`slot-btn ${selectedSlot === time ? "active" : ""}`}
                    onClick={() => setSelectedSlot(time)}
                  >
                    {time.slice(0, 5)}
                  </button>
                ))
              ) : (
                <p style={{ color: "#384A9C" }}>No available slots</p>
              )}
            </div>

            <button className="confirm-btn" onClick={handleConfirmAppointment}>
              Confirm appointment
            </button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default DoctorDetailPage;


