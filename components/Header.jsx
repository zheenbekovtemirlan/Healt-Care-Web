import React, { useEffect, useState } from 'react';
import { logout } from "../utils/auth";
import { Link } from "react-router-dom";
import '../styles/Header.css'

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    setIsLoggedIn(!!token);
    setLoaded(true);
  }, []);

  const handleLogout = () => {
    logout();
  };

  if (!loaded) return null;

  return (
    <header className="header">
      <div className="logo">
        <span className="plus">+</span>DocSpot
      </div>

      <nav className="nav-links">
        <a href="/">Home</a>
        <a href="/appointments">Appointments</a>
        {isLoggedIn && <a href="/myaccount" className="my-account">My Account</a>}
      </nav>

      <div className="auth-buttons">
        {!isLoggedIn ? (
          <>
            <Link to="/registration" className="btn btn-primary">Sign up</Link>
            <Link to="/login" className="btn btn-outline">Log in</Link>
          </>
        ) : (
          <button className="btn btn-primary" onClick={handleLogout}>Log Out</button>
        )}
      </div>
    </header>
  );
};

export default Header;


