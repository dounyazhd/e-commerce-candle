import React from 'react';
import './Footer.css';
import { Link} from 'react-router-dom';


const Footer = () => {

    return (

            <div className="footer">
                <div className="footer-content">

                    <div className="footer-logo">
                        <img src="/images/Home/logo.jpg" alt="Logo"/>
                    </div>

                    <div className="footer-info">
                        <h2>Information</h2>
                        <ul>
                        <li>Delivery Information</li>
                            <li >
                                <Link to="/faqs" style={{color:'rgba(255,255,255,0.6)', textDecoration: 'none'}}>FAQs</Link>
                            </li>
                            <li>
                                <Link to="/contact" style={{color:'rgba(255,255,255,0.6)', textDecoration: 'none'}}>Contact</Link>
                            </li>
                        </ul>
                    </div>

                    <div className="footer-contact">
                        <h2>Get In Touch</h2>
                        <p>We'd love to hear from you.</p>
                        <ul className="icons">
                            <li>
                                <Link to="/">
                                    <i className="fab fa-instagram"></i>
                                </Link>
                            </li>
                            <li>
                                <Link to="/">
                                    <i className="fab fa-whatsapp"></i>
                                </Link>
                            </li>
                            <li>
                                <Link to="/">
                                    <i className="fab fa-facebook"></i>
                                </Link>
                            </li>
                        </ul>

                    </div>

                </div>

                <hr></hr>

                <div className="footer-copyright">
                    <p>Copyright © 2024. All Rights Reserved.</p>
                </div>

            </div>

    );
};

export default Footer;