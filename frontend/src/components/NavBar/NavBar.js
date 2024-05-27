import React, { useState } from 'react';
import './NavBar.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

const NavBar = () => {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const getUserRole = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:8000/read_user/${userId}/`);
            return response.data.role;
        } catch (error) {
            console.error("Failed to fetch user role:", error);
            return null;
        }
    };

    const handleUserIconClick = async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem('user_id');
        if (Cookies.get('auth_token') && userId) {
            const role = await getUserRole(userId);
            if (role === 'user') {
                navigate('/profile/personal_information');
            } else if (role === 'admin') {
                navigate('/admin/performance_overview');
            } else {
                navigate('/sign_in');
            }
        } else {
            navigate('/sign_in');
        }
    };

    const isAuthenticated = Cookies.get('auth_token') && localStorage.getItem('user_id');

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <div>
            <nav className="navbar">
                <div className="top">
                    <img src="/images/Home/logo.jpg" alt="Logo"/>
                    <i className="fas fa-bars menu-icon" onClick={toggleMenu}></i>
                </div>
                <div className={`bottom ${menuOpen ? 'open' : ''}`}>
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <Link to="/" className="nav-link">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/shop" className="nav-link">Shop</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/aboutus" className="nav-link">About Us</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/faqs" className="nav-link">FAQs</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/contact" className="nav-link">Contact</Link>
                        </li>
                    </ul>
                    <ul className="icons">
                        <li>
                            <Link to="/cart">
                                <i className="fas fa-shopping-cart"></i>
                            </Link>
                        </li>
                        <li>
                            <Link to="/wishlist">
                                <i className="fas fa-heart"></i>
                            </Link>
                        </li>
                        <li>
                            {isAuthenticated ? (
                                <a href="/profile" onClick={handleUserIconClick}>
                                    <i className="fas fa-user"></i>
                                </a>
                            ) : (
                                <Link to="/sign_in">
                                    <i className="fas fa-user"></i>
                                </Link>
                            )}
                        </li>
                    </ul>
                </div>
            </nav>
        </div>
    );
};

export default NavBar;
