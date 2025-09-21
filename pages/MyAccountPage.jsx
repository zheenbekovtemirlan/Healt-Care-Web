import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AppointmentBanner from "../components/AppointmentBanner";
import "../styles/MyAccount.css";
import { logout, checkTokenAndRedirect } from "../utils/auth";
import API from "../utils/axiosConfig";

const MyAccount = () => {
    const [userData, setUserData] = useState({
        email: "",
        number: "",
        birthDate: "",
        gender: "",
        firstName: "",
        lastName: "",
        profilePictureUrl: ""
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: ""
    });

    const [passwordError, setPasswordError] = useState(null);
    const [passwordSuccess, setPasswordSuccess] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        checkTokenAndRedirect();

        const fetchUserData = async () => {
            try {
                const response = await API.get("/user/me", {
                    headers: {
                        Authorization: "Bearer " + localStorage.getItem("jwtToken")
                    }
                });

                const data = response.data;
                setUserData({
                    email: data.email,
                    number: data.phoneNumber,
                    birthDate: data.dateOfBirth,
                    gender: data.gender,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    profilePictureUrl: data.profilePictureUrl
                });
            } catch (err) {
                console.error("Error in loading user data", err);
                logout();
            }
        };

        fetchUserData();
    }, [navigate]);

    const handlePhotoChange = async (e) => {
        checkTokenAndRedirect();
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            await API.post("/user/profile-picture", formData, {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("jwtToken")
                }
            });

            const newImageUrl = URL.createObjectURL(file);
            setUserData(prev => ({ ...prev, profilePictureUrl: newImageUrl }));
        } catch (err) {
            console.error("Ошибка загрузки фото:", err);
        }
    };

    const validatePassword = (password) => {
        const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        return regex.test(password);
    };

    const handlePasswordChange = async () => {
        checkTokenAndRedirect(); 
        setPasswordError(null);
        setPasswordSuccess(null);

        const { currentPassword, newPassword, confirmNewPassword } = passwordForm;

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            setPasswordError("All fields are required.");
            return;
        }

        if (!validatePassword(newPassword)) {
            setPasswordError("Password must be at least 8 characters, include letters and numbers.");
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setPasswordError("New passwords do not match.");
            return;
        }

        try {
            await API.post("/user/change-password", {
                currentPassword,
                newPassword,
                confirmNewPassword
            }, {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("jwtToken")
                }
            });

            setPasswordSuccess("Password updated successfully.");
            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmNewPassword: ""
            });
        } catch (err) {
            setPasswordError(err.message);
        }
    };

    const handleCancelPassword = () => {
        setPasswordForm({
            currentPassword: "",
            newPassword: "",
            confirmNewPassword: ""
        });
        setPasswordError(null);
        setPasswordSuccess(null);
    };

    return (
        <>
            <Header />
            <div className="account-container">
                <div className="breadcrumb">
                    <Link to="/" className="breadcrumb-link">Home</Link>
                    <span> / </span>
                    <span className="active">My Account</span>
                </div>

                <div className="account-content">
                    <div className="account-left">
                        <div className="profile-img-placeholder">
                            <img
                                src={userData.profilePictureUrl}
                                alt="Profile"
                                className="profile-img"
                            />
                        </div>

                        <div className="profile-name-wrapper">
                            <p className="profile-name">
                                {userData.firstName} {userData.lastName}
                            </p>
                            <div>
                                <input
                                    type="file"
                                    id="upload-photo"
                                    style={{ display: "none" }}
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                />
                                <label htmlFor="upload-photo" className="edit-photo">Edit</label>
                            </div>
                        </div>
                    </div>

                    <div className="account-right">
                        <h2 className="form-title">Edit Your Profile</h2>

                        <div className="form-grid">
                            <div className="account-form-group">
                                <label>Email</label>
                                <input type="email" value={userData.email || ""} readOnly />
                            </div>
                            <div className="account-form-group">
                                <label>Number</label>
                                <input type="tel" value={userData.number || ""} readOnly />
                            </div>
                            <div className="account-form-group">
                                <label>Date of Birth</label>
                                <input type="date" value={userData.birthDate || ""} readOnly />
                            </div>
                            <div className="account-form-group">
                                <label>Gender</label>
                                <input type="text" value={userData.gender || ""} readOnly />
                            </div>
                        </div>

                        <div className="password-section">
                            <h4>Password Changes</h4>
                            <input
                                type="password"
                                placeholder="Current Password"
                                value={passwordForm.currentPassword}
                                onChange={(e) =>
                                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                                }
                            />
                            <input
                                type="password"
                                placeholder="New Password"
                                value={passwordForm.newPassword}
                                onChange={(e) =>
                                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                                }
                            />
                            <input
                                type="password"
                                placeholder="Confirm New Password"
                                value={passwordForm.confirmNewPassword}
                                onChange={(e) =>
                                    setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })
                                }
                            />

                            {passwordError && (
                                <p style={{ color: "red", marginTop: "0.5rem" }}>{passwordError}</p>
                            )}
                            {passwordSuccess && (
                                <p style={{ color: "green", marginTop: "0.5rem" }}>{passwordSuccess}</p>
                            )}
                        </div>

                        <div className="account-form-buttons">
                            <button className="account-cancel" onClick={handleCancelPassword}>
                                Cancel
                            </button>
                            <button className="account-save" onClick={handlePasswordChange}>
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <AppointmentBanner />
            <Footer />
        </>
    );
};

export default MyAccount;
