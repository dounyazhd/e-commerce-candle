import React, {useEffect, useState} from 'react';
import './Coupons.css';
import {Helmet} from "react-helmet";
import {Link} from "react-router-dom";
import axios from "axios";

const Coupons = () => {

    const [promotions, setPromotions] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                const response = await axios.get('http://localhost:8000/get_promotions/');
                setPromotions(response.data);
            } catch (error) {
                setError('Failed to fetch promotions');
            }
        };

        fetchPromotions();
    }, []);


    return (

        <div>

            <Helmet>
                <title>Personal Information </title>
            </Helmet>

            <nav className="navbar" style={{
                marginBottom: '50px',
                marginTop: '50px',
            }}>

                <div className="bottom">
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
                        <li style={{pointerEvents: 'none'}}>
                            <Link to="/profile">
                                <i className="fas fa-user" style={{color: '#9E5AC7'}}></i>
                            </Link>
                        </li>
                    </ul>
                </div>

            </nav>

            <nav className='dashboard-user'>

                <div className="top-user">
                    <img src="/images/Home/logo.jpg" alt="Logo"/>
                </div>

                <ul className="navbar-nav-user">
                    <li className="nav-item-user">
                        <Link to="/profile/personal_information" className="nav-link">Personal Information</Link>
                    </li>
                    <li className="nav-item-user">
                        <Link to="/profile/order_tracking" className="nav-link">Order Tracking</Link>
                    </li>
                    <li className="nav-item-user-active">
                        <Link to="/profile/coupons" className="nav-link">Coupons</Link>
                    </li>
                </ul>

            </nav>

            <div className="promotions-container">
                <h2>Available Coupons 🎟️</h2>
                {error && <p className="error">{error}</p>}
                <div className="coupons-list">
                    {promotions.map(promotion => (
                        <div
                            key={promotion._id}
                            className={`promotion-item ${promotion.isActive ? 'active' : 'inactive'} ${promotion.active ? '' : 'inactive-promotion'}`}
                        >
                            <h3>Code coupon : {promotion.code}</h3>
                            <p>Active : {promotion.active ? 'Yes' : 'No'}</p>
                            <p><strong>Discount : </strong> {promotion.discount}%</p>
                        </div>
                    ))}
                </div>
            </div>


        </div>

    );
};

export default Coupons;