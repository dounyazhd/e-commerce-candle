import React, {useEffect, useState} from 'react';
import './AccountSettings.css';
import {Helmet} from "react-helmet";
import {Link} from "react-router-dom";
import {useNavigate} from 'react-router-dom';
import axios from "axios";
import Cookies from "js-cookie";

const AccountSettings = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenuAdmin = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const navigate = useNavigate();

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
            console.log("Something Wrong !!")
        }
    };


    const handleLogout = () => {
        const confirmed = window.confirm("Are you sure you want to log out?");
        if (confirmed) {
            localStorage.removeItem('authToken');
            navigate.push('/');
        }
    };

    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({
        role: '',
        username: '',
        first_name: '',
        last_name: '',
        date_of_birth: '',
        phone_number: '',
        email: '',
        address: '',
        country: '',
        city: '',
        old_password: '',
        password: '',
    });

    useEffect(() => {
        const userId = localStorage.getItem('user_id');
        const fetchUser = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/read_user/${userId}/`);
                setUser(response.data);
                setFormData(response.data);
            } catch (error) {
                setError('User not found');
            }
        };

        fetchUser();
    }, []);

    const openUpdateModal = () => {
        setShowUpdateModal(true);
    };

    const closeUpdateModal = () => {
        setShowUpdateModal(false);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleUpdate = async () => {
        const userId = localStorage.getItem('user_id');
        if (formData.password && !formData.old_password) {
            setMessage('Please enter your old password to update the password.');
            return;
        }
        try {
            const response = await axios.put(`http://localhost:8000/update_user/${userId}/`, formData);
            setMessage(response.data.message);
            setShowUpdateModal(false);
        } catch (error) {
            setMessage('Failed to update user.');
        }
    };

    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    if (error) {
        return <div>{error}</div>;
    }

    if (!user) {
        return <div>Loading...</div>;
    }


    return (

        <div>

            <Helmet>
                <title>Account Settings </title>
            </Helmet>

            <nav className="navbar-profile">
                <div className="bottom-profile">
                    <ul className="navbar-nav-profile">
                        <li className="nav-item-profile">
                            <Link to="/" className="nav-link">Home</Link>
                        </li>
                        <li className="nav-item-profile">
                            <Link to="/shop" className="nav-link">Shop</Link>
                        </li>
                        <li className="nav-item-profile">
                            <Link to="/aboutus" className="nav-link">About Us</Link>
                        </li>
                        <li className="nav-item-profile">
                            <Link to="/faqs" className="nav-link">FAQs</Link>
                        </li>
                        <li className="nav-item-profile">
                            <Link to="/contact" className="nav-link">Contact</Link>
                        </li>
                    </ul>
                    <ul className="icons-profile">
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
                            <Link to="/profile" onClick={handleUserIconClick}>
                                <i className="fas fa-user" style={{color: '#9E5AC7'}}></i>
                            </Link>
                        </li>
                    </ul>
                </div>
            </nav>

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
                        <li className="nav-item">
                            <Link to="/admin/marketing_and_promotion" className="nav-link">Marketing and
                                Promotion</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/admin/customers" className="nav-link">Customers</Link>
                        </li>
                        <li className="nav-item"
                            style={{backgroundColor: 'white', width: '80%', borderRadius: '20px 0 0 50px'}}>
                            <Link to="/admin/account_settings" className="nav-link">Account Settings</Link>
                        </li>
                    </ul>
                </nav>

                <div className="content-customers">

                    <div className="information-user">
                        <h2>Your Personal Information : ({user.role})</h2>

                        <p><strong>Username : </strong> {user.username}</p>
                        <p><strong>First Name : </strong> {user.first_name}</p>
                        <p><strong>Last Name :</strong> {user.last_name}</p>
                        <p><strong>Date of Birth : </strong> {user.date_of_birth}</p>
                        <p><strong>Phone Number : </strong> {user.phone_number}</p>
                        <p><strong>Email : </strong> {user.email}</p>
                        <p><strong>Address : </strong> {user.address}</p>
                        <p><strong>Country : </strong> {user.country}</p>
                        <p><strong>City :</strong> {user.city}</p>
                        <button onClick={openUpdateModal}>Update</button>

                        {showUpdateModal && (
                            <div className="update-user">
                                <div className="modal">
                                    <i className="fas fa-times" onClick={closeUpdateModal}></i>
                                    <h2>Update User Information</h2>


                                    <label>Username : </label>
                                    <input type="text" placeholder="Enter the new username" name="username"
                                           value={formData.username} onChange={handleChange}/>
                                    <label>First Name : </label>
                                    <input type="text" placeholder="Enter the new first name" name="first_name"
                                           value={formData.first_name} onChange={handleChange}/>
                                    <label>Last Name : </label>
                                    <input type="text" placeholder="Enter the new last name" name="last_name"
                                           value={formData.last_name} onChange={handleChange}/>
                                    <label>Date of Birth : </label>
                                    <input type="date" placeholder="Enter the new date of birth" name="date_of_birth"
                                           value={formData.date_of_birth}
                                           onChange={handleChange}
                                    />
                                    <label>Phone Number : </label>
                                    <input type="text" placeholder="Enter the new phone number" name="phone_number"
                                           value={formData.phone_number}
                                           onChange={handleChange}/>
                                    <label>Email : </label>
                                    <input type="email" placeholder="Enter the new email" name="email"
                                           value={formData.email}
                                           onChange={handleChange}/>
                                    <label>Address : </label>
                                    <input type="text" placeholder="Enter the new address" name="address"
                                           value={formData.address} onChange={handleChange}/>
                                    <label>Country : </label>
                                    <input type="text" placeholder="Enter the new country" name="country"
                                           value={formData.country} onChange={handleChange}/>
                                    <label>City : </label>
                                    <input type="text" placeholder="Enter the new city" name="city"
                                           value={formData.city}
                                           onChange={handleChange}/>

                                    <label>Old Password : </label>
                                    <input type="password"
                                           placeholder="Enter your old password if you want to change it"
                                           name="old_password" value={formData.old_password}
                                           onChange={handleChange}
                                           className="password-input"
                                    />

                                    <label>New Password : </label>
                                    <div className="password-input-container">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter the new password"
                                            name="new_password"
                                            value={formData.new_password}
                                            onChange={handleChange}
                                            className="password-input"
                                        />
                                        <button type="button" onClick={togglePasswordVisibility}>
                                            {showPassword ?
                                                <i className="fas fa-eye-slash"
                                                   onClick={togglePasswordVisibility}></i> :
                                                <i className="fas fa-eye"></i>}
                                        </button>
                                    </div>


                                    <button className="update-button" type="button" onClick={handleUpdate}>Update
                                    </button>


                                    {message && <p>{message}</p>}

                                </div>
                            </div>
                        )}

                    </div>

                    <div className="log-out" onClick={handleLogout}>
                        Log Out
                    </div>


                </div>

            </div>

        </div>

    );
};

export default AccountSettings;