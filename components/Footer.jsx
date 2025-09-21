import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
    return (
        <footer className="new-footer">
            <div className="footer-top">
                <div className="footer-brand">
                    <h3 className="footer-heading">DocSpot</h3>
                    <p className="footer-description">
                    Your trusted platform for finding the right doctor at the right time.
                    </p>

                    <div className="footer-contacts">
                        <h4 className="footer-heading-contacts">Contacts</h4>
                        <p>+1 (234) 567-89-00</p>
                        <p>support@docspot.com</p>
                    </div>
                </div>
            </div>

            <div className="footer-links">
                <a href="/features">Features</a>
                <a href="/pricing">Pricing</a>
                <a href="/careers">Careers</a>
                <a href="/help">Help</a>
                <a href="/privacy">Privacy</a>
            </div>

            <hr className="footer-divider" />

            <div className="footer-bottom">
                <p>© 2025 DocSpot, Inc. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;

