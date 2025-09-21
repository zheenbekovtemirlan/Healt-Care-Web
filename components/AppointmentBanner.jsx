import React from "react";
import { Link } from "react-router-dom";
import greenCross from "../assets/green_cross.png";
import "../styles/AppointmentBanner.css";

const AppointmentBanner = () => {
  return (
    <div className="appointment-banner">
      <div className="appointment-left">
            <div className="appointment-wrapper">
                <div className="appointment-card">
                    <img src={greenCross} alt="Plus Icon" className="plus-icon" />
                    <Link to="/appointments" className="appointment-link">
                        My Appointments
                    </Link>
                </div>

                <div className="appointment-text">
                    <p className="appointment-message">
                    Haven’t booked your appointment yet? <br />
                        <strong>Book one today.</strong>
                    </p>
                </div>
            </div>

         <p className="appointment-status"><strong>Online.</strong></p>
        </div>
    </div>
  );
};

export default AppointmentBanner;

