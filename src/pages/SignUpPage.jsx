import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SignUp.css';
import API from '../utils/axiosConfig';


const SignupPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '' ,
        phoneNumber: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',

    });
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validatePassword = (password) => {
        const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        return regex.test(password);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if(!validatePassword(formData.password)) {
            setError('Password must be at least 8 characters with 1 letter and 1 number');
            return;
        }

        try {
            const response = await API.post('/auth/register', formData);
            console.log('Registration successful:', response.data);
            navigate('/login');
        } catch (err) {
            console.error('Registration failed:', err);
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="signup-container">
            <header className="main-header">
                <div className="logo-container">
                <svg className="logo-plus-signup" width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <rect x="10" y="3" width="4" height="18" rx="1" fill="#0FCEF0" />
                    <rect x="3" y="10" width="18" height="4" rx="1" fill="#0FCEF0" />
                    </svg>
            <span className="brand-name">DocSpot</span>
                </div>
                <a href="/" className="home-button">Home</a>
            </header>

            <div className="signup-content">
                <h1>Create an account</h1>

                <form className="signup-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Phone number</label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            placeholder="Enter your phone number"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Create password (8+ characters)"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="name-fields">
                        <div className="input-group">
                            <label className="input-label">First name</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Last name</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Date of birth</label>
                        <input
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Gender</label>
                        <div className="gender-selection">
                            <label className="gender-option">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="MALE"
                                    checked={formData.gender === 'MALE'}
                                    onChange={handleChange}
                                    required
                                />
                                <span className="radio-circle"></span>
                                Male
                            </label>
                            <label className="gender-option">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="FEMALE"
                                    checked={formData.gender === 'FEMALE'}
                                    onChange={handleChange}
                                />
                                <span className="radio-circle"></span>
                                Female
                            </label>
                        </div>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="continue-btn">Continue</button>

                    <div className="separator">
                        <span className="line"></span>
                        <span className="or">or</span>
                        <span className="line"></span>
                    </div>

                    <p className="login-link">
                        Already have an account? <a href="/login">Log in</a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default SignupPage;