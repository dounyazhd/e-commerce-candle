import React, {useEffect, useState} from 'react';
import './Coupons.css';
import {Helmet} from "react-helmet";
import {Link} from "react-router-dom";
import axios from "axios";
import NavBarProfile from "../../NavBarProfile/NavBarProfile";

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

            <NavBarProfile/>

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