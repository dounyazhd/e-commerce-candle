import React, {useEffect, useState} from 'react';
import './Marketing.css';
import {Helmet} from "react-helmet";
import {Link} from "react-router-dom";
import axios from "axios";
import NavBarProfile from "../../NavBarProfile/NavBarProfile";

const Marketing = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenuAdmin = () => {
        setIsMenuOpen(!isMenuOpen);
    };
    const [promotions, setPromotions] = useState([]);
    const [code, setCode] = useState('');
    const [discount, setDiscount] = useState('');
    const [active, setActive] = useState(true);


    const fetchPromotions = async () => {
        try {
            const response = await axios.get('http://localhost:8000/get_promotions/');
            setPromotions(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchPromotions();
    }, []);

    const handleCreatePromotion = async () => {
        try {
            const response = await axios.post('http://localhost:8000/create_promotion/', {
                code,
                discount: parseFloat(discount),
                active
            });
            alert(response.data.message);
            setCode('');
            setDiscount('');
            setActive(true);
            fetchPromotions();
        } catch (error) {
            alert(error.response.data.message);
        }
    };

    const handleDeletePromotion = async (code) => {
        if (window.confirm('Are you sure you want to delete this promotion?')) {
            try {
                const response = await axios.delete(`http://localhost:8000/delete_promotion/?code=${code}`);
                if (response && response.data) {
                    alert(response.data.message);
                    fetchPromotions();
                } else {
                    alert('Something went wrong.');
                }
            } catch (error) {
                alert('An error occurred while deleting the promotion.');
                console.error(error);
            }
        }
    };


    const handleToggleActivation = async (id, activeState) => {
        try {
            const response = await axios.put(`http://localhost:8000/toggle_activation/${id}/`, {
                active: !activeState
            });
            alert(response.data.message);
            setPromotions(promotions.map(promotion =>
                promotion._id === id ? {...promotion, active: !activeState} : promotion
            ));
        } catch (error) {
            alert(error.response.data.message);
        }
    };

    const handleDeleteAllPromotions = async () => {
        if (window.confirm('Are you sure you want to delete all promotions?')) {
            try {
                const response = await axios.delete('http://localhost:8000/delete_all_promotions/');
                if (response && response.data) {
                    alert(response.data.message);
                    setPromotions([]);
                } else {
                    alert('Unexpected response format');
                }
            } catch (error) {
                alert(error.response?.data?.message || 'An error occurred');
            }
        }
    };

    const [emailContent, setEmailContent] = useState('');
    const sendEmailToUsers = async () => {
        try {
            const formData = new FormData();
            formData.append('content', emailContent);

            const response = await axios.post('http://localhost:8000/send_promotion_email/', formData);

            alert(response.data.message);
        } catch (error) {
            alert(error.response.data.message);
        }
    };


    return (
        <div>
            <Helmet>
                <title>Marketing</title>
            </Helmet>

            <NavBarProfile/>


            <div className="content">
                <nav className='dashboard-admin'>

                    <i className="fas fa-bars menu-icon" onClick={toggleMenuAdmin}></i>

                    <div className="top">
                        <img src="/images/Home/logo.jpg" alt="Logo"/>

                    </div>

                    <ul className={`navbar-nav ${isMenuOpen ? 'show' : ''}`}>
                        <li className="nav-item">
                            <Link to="/admin/performance_overview" className="nav-link">Performance Overview /
                                Analytics</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/admin/order_management" className="nav-link">Order Management</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/admin/product_management" className="nav-link">Product Management</Link>
                        </li>
                        <li className="nav-item"
                            style={{backgroundColor: 'white', width: '80%', borderRadius: '20px 0 0 50px'}}>
                            <Link to="/admin/marketing_and_promotion" className="nav-link">Marketing and
                                Promotion</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/admin/customers" className="nav-link">Customers</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/admin/account_settings" className="nav-link">Account Settings</Link>
                        </li>
                    </ul>
                </nav>

                <div className="content-marketing">

                    <div className="promotions-list">
                        <h3>Promotions List</h3>
                        {Array.isArray(promotions) && promotions.length > 0 ? (
                            <ul>
                                {promotions.map((promotion) => (
                                    <li key={promotion._id} className="promotion-item">
                                        <div>
                                            <span className="promotion-code">Code: {promotion.code}</span> |
                                            <span className="promotion-discount">Discount: {promotion.discount}</span> |
                                            <span
                                                className="promotion-active">Active: {promotion.active ? 'Yes' : 'No'}</span>
                                        </div>
                                        <div className="promotion-actions">
                                            <button
                                                onClick={() => handleToggleActivation(promotion._id, promotion.active)}
                                                id="button-activate">{promotion.active ? 'Deactivate' : 'Activate'}</button>
                                            <i onClick={() => handleDeletePromotion(promotion.code)}
                                               className="fas fa-trash"
                                               id="button-delete"></i>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No promotions available.</p>
                        )}
                        <button onClick={handleDeleteAllPromotions} className="button-delete">Delete All Promotions
                        </button>
                    </div>

                    <div className="content-promotion">

                        <div className="create-promotion-form">
                            <h2>Create Promotion</h2>
                            <div className="input-group">
                                <label htmlFor="code">Code : </label>
                                <input
                                    type="text"
                                    id="code"
                                    placeholder="Enter promotion code"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="discount">Discount : </label>
                                <input
                                    type="number"
                                    id="discount"
                                    placeholder="Enter discount amount"
                                    value={discount}
                                    onChange={(e) => setDiscount(e.target.value)}
                                />
                            </div>
                            <div className="input-group">
                                <label>
                                    Active :
                                    <input
                                        type="checkbox"
                                        checked={active}
                                        onChange={(e) => setActive(e.target.checked)}
                                    />
                                </label>
                            </div>
                            <button className="create-button" onClick={handleCreatePromotion}>
                                Create Promotion
                            </button>
                        </div>


                        <div className="send-email">
                            <h2>Create E-mail Promotion : </h2>
                            <textarea
                                placeholder="Send email to discover promotion"
                                value={emailContent}
                                onChange={(e) => setEmailContent(e.target.value)}
                                className="textarea"
                            />
                            <button onClick={sendEmailToUsers}>Send Emails to All Users</button>
                        </div>


                    </div>


                </div>

            </div>
        </div>
    );
};

export default Marketing;

