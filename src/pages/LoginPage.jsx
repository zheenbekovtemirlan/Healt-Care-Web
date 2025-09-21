import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import API from "../utils/axiosConfig";
import '../styles/Login.css';

export default function Login() {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [error, setError] = useState(null);
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();
    const [logoutMessage, setLogoutMessage] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const isExpired = queryParams.get("expired");

        if (isExpired === "true") {
            setLogoutMessage("Your session has expired. Please log in again.");
        }

        const rememberedEmail = localStorage.getItem("rememberedEmail");
        if (rememberedEmail) {
            setFormData(prev => ({ ...prev, email: rememberedEmail }));
            setRememberMe(true);
        }
    }, [location.search]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email.trim() || !formData.password.trim()) {
            setError("Please enter both email and password.");
            return;
        }

        try {
            const response = await API.post("/auth/login", formData);
            const { token, userId, userRole } = response.data;

            const expiryTime = Date.now() + 30 * 60 * 1000;
            localStorage.setItem("jwtToken", token);
            localStorage.setItem("userId", userId);
            localStorage.setItem("userRole", userRole);
            localStorage.setItem("tokenExpiry", expiryTime);

            if (rememberMe) {
                localStorage.setItem("rememberedEmail", formData.email);
            } else {
                localStorage.removeItem("rememberedEmail");
            }

            navigate("/");
        } catch (err) {
            console.error("Login failed:", err);
            setError("Invalid email or password. Please try again.");
        }
    };

    return (
        <div className="login-page">
            <div className="login-page-wrapper">
                {logoutMessage && (
                    <div className="logout-alert">
                        {logoutMessage}
                    </div>
                )}

                <div className="login-container">
                    <div className="login-back">
                        <Link to="/" className="back-link">← Back to Home</Link>
                    </div>

                    <div className="login-content">
                        <div className="logo-plus-login">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                                <rect x="10" y="3" width="4" height="18" rx="1" fill="#0FCEF0" />
                                <rect x="3" y="10" width="18" height="4" rx="1" fill="#0FCEF0" />
                            </svg>
                        </div>

                        <div className="login-header">
                            <h1>Log in to your account</h1>
                            <p className="subheading">Welcome back! Please enter your details.</p>
                        </div>

                        <form className="login-form" onSubmit={handleSubmit}>
                            <div className="login-form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    autoComplete="username"
                                />
                            </div>

                            <div className="login-form-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    autoComplete="current-password"
                                />
                            </div>

                            <div className="form-options">
                                <label className="remember-me">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <span>Remember me</span>
                                </label>
                                <Link to="/login" className="forgot-password">Forgot password</Link>
                            </div>

                            {error && <div className="error-message">{error}</div>}

                            <button
                                type="submit"
                                className="signin-button"
                            >
                                Log in
                            </button>

                            <div className="signup-link">
                                Don’t have an account? {" "}
                                <Link to="/registration" className="registration-link">
                                    Sign up
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
