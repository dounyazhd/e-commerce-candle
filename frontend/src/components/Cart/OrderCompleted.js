import React from 'react';
import './OrderCompleted.css';
import { Helmet } from 'react-helmet';
import NavBar from "../NavBar/NavBar";
import Footer from "../Footer/Footer";

const OrderCompleted = () => {

    return (
        <div>
            <Helmet>
                <title>Cart - Order Completed</title>
            </Helmet>

            <NavBar/>

            <div className="progress-container">
                <div className="step">
                    <div className="step-number">01</div>
                    <div className="step-title">Shopping Cart</div>
                </div>
                <div className="step">
                    <div className="step-number">02</div>
                    <div className="step-title">Check Out</div>
                </div>
                <div className="step active">
                    <div className="step-number">03</div>
                    <div className="step-title">Order Completed</div>
                </div>
            </div>

            <div className="confirm-order-container">
                <h1 className="confirm-order-title">Order Completed Successfully</h1>
                <p className="confirm-order-message">Customer service will contact you to finalize your order.</p>
                <video className="confirm-order-video" autoPlay loop muted playsInline>
                    <source src="/images/Cart/order-completed.mp4" type="video/mp4"/>
                    Your browser does not support the video tag.
                </video>
            </div>

            <Footer/>

        </div>

    );
};

export default OrderCompleted;