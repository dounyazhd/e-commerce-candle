import React, { useState } from 'react';
import './signIn.css';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import {Link, useNavigate} from 'react-router-dom';
import Cookies from 'js-cookie';

const SignIn = () => {
    const [formData, setFormData] = useState({
        username_or_email: '',
        password: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const validateForm = () => {
        const requiredFields = ['username_or_email', 'password'];
        for (const key of requiredFields) {
            if (formData[key] === '') {
                setError('All fields are required');
                const errorMessageElement = document.getElementById('error-message');
                if (errorMessageElement) {
                    errorMessageElement.classList.add('error');
                }
                return false;
            }
        }
        setError('');
        const errorMessageElement = document.getElementById('error-message');
        if (errorMessageElement) {
            errorMessageElement.classList.remove('error');
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!validateForm()) {
            setLoading(false);
            return;
        }
        try {
            const response = await axios.post('http://127.0.0.1:8000/signin/', formData);
            console.log(response.data);
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('user_id', response.data.user_id);
            Cookies.set('auth_token', response.data.token);

            navigate('/', { replace: true });
        } catch (error) {
            console.error(error.response.data);
            setError('Invalid username or email or password');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:8000/reset-password',
                { email: formData.username_or_email });
            alert(response.data.message);
        } catch (error) {
            setError('Something went wrong. Please try again later.');
        }
    };


    return (
        <div>
            <Helmet>
                <title>Natural Candle - Sign In</title>
            </Helmet>
            <div className="signin-container">

                <div className="video-container">
                    <video autoPlay loop muted playsInline className="fullscreen-video">
                        <source src="/images/Authentication/video-signin.mp4" type="video/mp4"/>
                        Your browser does not support the video tag.
                    </video>
                </div>

                <div className="form-signin">

                    <form onSubmit={handleSubmit}>
                        <h2>Welcome Back To Natural Candle !!</h2>

                        <h4>Username / Email</h4>
                        <input type="text" name="username_or_email" placeholder="Enter your username or email here"
                               onChange={handleChange}/>

                        <h4>Password</h4>
                        <input type="password" name="password" placeholder="Enter your password"
                               onChange={handleChange}/>
                        {error && <p id="error-message">{error}</p>}

                        <Link to="/sign_in" className="forgot-password-link" onClick={handleForgotPassword}>Forgot password ?</Link>

                        <button type="submit" disabled={loading}>{loading ? 'Signing In...' : 'Sign In'}</button>
                        <Link to="/sign_up" className="signin-link">Not yet have account ?</Link>

                    </form>
                </div>

            </div>
        </div>
    );
};

export default SignIn;






