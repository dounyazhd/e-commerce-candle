import './signUp.css';
import { Helmet } from 'react-helmet';

import React, { useState } from 'react';
import axios from 'axios';
import {Link} from "react-router-dom";


const SignUp = () => {
    const [formData, setFormData] = useState({
        username: '',
        role: 'user',
        first_name: '',
        last_name: '',
        date_of_birth: '',
        phone_number: '',
        email: '',
        password: '',
        address: '',
        country: '',
        city: ''
    });

     const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const validateForm = () => {
        const requiredFields = ['username', 'first_name', 'last_name', 'date_of_birth', 'phone_number', 'email', 'password'];
        for (const key of requiredFields) {
            if (formData[key] === '') {
                throw new Error('All fields are required');
            }
        }
    };

    const validatePhoneNumber = (phoneNumber) => {
        const phoneRegex = /^\+?[0-9]{3}-?[0-9]{6,12}$/;
        return phoneRegex.test(phoneNumber);
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    try {

        validateForm();

        if (!validatePhoneNumber(formData.phone_number)) {
            throw new Error('Phone number is invalid');
        }

        if (formData.username.length < 4) {
            throw new Error('Username must be at least 4 characters long');
        }

        if (formData.password.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }

        const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])[\w!@#$%^&*]{8,}$/;
        if (!passwordRegex.test(formData.password)) {
            throw new Error('Password must contain at least one number and one symbol');
        }

        const response = await axios.post('http://127.0.0.1:8000/create_user/', formData);
        console.log(response.data);
    } catch (error) {
        console.error(error.message);
        alert(error.message);
    }
};

    return (
        <div>

            <Helmet>
                <title>Natural Candle</title>
            </Helmet>

            <div className="container">

                <div className="form-SignUp">

                    <form onSubmit={handleSubmit}>

                        <h2>Welcome To Natural Candle</h2>
                        <h6>Your relax space</h6>

                        <div className="username">
                            <h5>Username <span>*</span></h5>
                            <input type="text" name="username" placeholder="Enter your username here"
                                   onChange={handleChange}/>
                        </div>

                        <div className="first_name">
                            <h5>First Name <span>*</span></h5>
                            <input type="text" name="first_name" placeholder="Enter your first name here"
                                   onChange={handleChange}/>
                        </div>

                        <div className="last_name">
                            <h5>Last Name <span>*</span></h5>
                            <input type="text" name="last_name" placeholder="Enter your last name here"
                                   onChange={handleChange}/>
                        </div>

                        <div className="date_ofbirth">
                            <h5>Date of birth <span>*</span></h5>
                            <input type="date" name="date_of_birth" placeholder="choice your date of birth"
                                   onChange={handleChange}/>
                        </div>

                        <div className="phone_number">
                            <h5>Phone Number <span>*</span></h5>
                            <input type="tel" name="phone_number" placeholder="Enter your phone number here"
                                   onChange={handleChange}/>
                        </div>

                        <div className="email">
                            <h5>Email <span>*</span></h5>
                            <input type="email" name="email" placeholder="Enter your email here"
                                   onChange={handleChange}/>
                        </div>

                        <div className="password">
                            <h5>Password <span>*</span></h5>
                            <div className="password-input">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Enter your password here"
                                    onChange={handleChange}
                                />
                                <i className={`far ${showPassword ? "fa-eye-slash" : "fa-eye"} password-icon`}
                                   onClick={togglePasswordVisibility}></i>
                            </div>
                        </div>

                        <button type="submit">Sign Up</button>
                        <Link to="/sign_in" className="signin-link">Already have account ?</Link>

                    </form>
                </div>

                <div className="Image-SignUp">
                    <img src="/images/Home/image3.2-home.jpg" alt="SignUp"/>
                </div>

            </div>

        </div>
    );
};

export default SignUp;
