import React, {useEffect, useState} from 'react';
import './PersonalInformation.css';
import {Helmet} from "react-helmet";
import {Link, useNavigate} from "react-router-dom";
import axios from "axios";
import NavBarProfile from "../../NavBarProfile/NavBarProfile";

const PersonalInformation = () => {

    const navigate = useNavigate();

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
                <title>Personal Information </title>
            </Helmet>

            <NavBarProfile/>

            <nav className='dashboard-user'>

                <div className="top-user">
                    <img src="/images/Home/logo.jpg" alt="Logo"/>
                </div>

                <ul className="navbar-nav-user">
                    <li className="nav-item-user-active">
                        <Link to="/profile/personal_information" className="nav-link">Personal Information</Link>
                    </li>
                    <li className="nav-item-user">
                        <Link to="/profile/order_tracking" className="nav-link">Order Tracking</Link>
                    </li>
                    <li className="nav-item-user">
                        <Link to="/profile/coupons" className="nav-link">Coupons</Link>
                    </li>
                </ul>

            </nav>

            <div className="information-user">
                <h2>Your Personal Information :</h2>

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
                            <input type="email" placeholder="Enter the new email" name="email" value={formData.email}
                                   onChange={handleChange}/>
                            <label>Address : </label>
                            <input type="text" placeholder="Enter the new address" name="address"
                                   value={formData.address} onChange={handleChange}/>
                            <label>Country : </label>
                            <input type="text" placeholder="Enter the new country" name="country"
                                   value={formData.country} onChange={handleChange}/>
                            <label>City : </label>
                            <input type="text" placeholder="Enter the new city" name="city" value={formData.city}
                                   onChange={handleChange}/>

                            <label>Old Password : </label>
                            <input type="password" placeholder="Enter your old password if you want to change it"
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
                                        <i className="fas fa-eye-slash" onClick={togglePasswordVisibility}></i> :
                                        <i className="fas fa-eye"></i>}
                                </button>
                            </div>


                            <button className="update-button" type="button" onClick={handleUpdate}>Update</button>


                            {message && <p>{message}</p>}

                        </div>
                    </div>
                )}

            </div>

            <div className="log-out" onClick={handleLogout}>
                Log Out
            </div>

        </div>

    );
};

export default PersonalInformation;