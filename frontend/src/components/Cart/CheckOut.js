import React, { useEffect, useState } from 'react';
import {useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import {Helmet} from "react-helmet";
import './CheckOut.css';
import Footer from "../Footer/Footer";

const CheckOut = ({ totalQuantity, totalPrice }) => {
    const navigate = useNavigate();
    const authToken = Cookies.get('auth_token');
    const userId = localStorage.getItem('user_id');
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        user_id: '',
        first_name: '',
        last_name: '',
        phone_number: '',
        company_name: '',
        country: '',
        city: '',
        address: '',
        zip: '',
        paymentMethod: 'bank transfer',
        promotionCode: ''
    });

    const [couponMessage, setCouponMessage] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(`http://localhost:8000/read_user/${userId}/`);
                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                    setFormData({
                        ...formData,
                        user_id: userData._id,
                        first_name: userData.first_name,
                        last_name: userData.last_name,
                        company_name: userData.company_name,
                        phone_number: userData.phone_number,
                        country: userData.country,
                        city: userData.city,
                        address: userData.address,
                        zip: userData.zip,
                    });
                } else {
                    console.error('Failed to fetch user:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };

        if (authToken && userId) {
            fetchUser();
        } else {
            navigate('/sign_in');
        }
    }, [authToken, userId, navigate]);


    const handleChange = (e) => {
        const {name, value, type, checked} = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };


    const handleChangeCoupon = (e) => {
        setFormData({ ...formData, promotionCode: e.target.value });
    };

    const [newPrice, setNewPrice] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const requestData = {
            ...formData,
            user_id: formData.user_id,
            payment_method: formData.paymentMethod,
            promotion_code: formData.promotionCode,
        };

        try {
            const response = await fetch('http://localhost:8000/create_order/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            const data = await response.json();
            if (response.ok) {
                console.log('Order ID:', data.order_id);
                navigate('/order_completed');
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    const handleCouponValidation = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8000/validate_coupon/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    couponCode: formData.promotionCode,
                    totalPrice: totalPrice
                }),
            });
            const data = await response.json();
            if (response.ok) {
                setNewPrice(data.newPrice);
                setCouponMessage('Coupon applied successfully!');
            } else {
                setCouponMessage(`Failed to apply coupon: ${data.message}`);
            }
        } catch (error) {
            setCouponMessage('Failed to apply coupon');
            console.error('Coupon validation error:', error);
        }
    };


        if (!user) {
            return <div>Loading...</div>;
        }

        return (
            <div>
                <Helmet>
                    <title>CheckOut</title>
                </Helmet>

                <div className="progress-container">
                    <div className="step">
                        <div className="step-number">01</div>
                        <div className="step-title">Shopping Cart</div>
                    </div>
                    <div className="step active">
                        <div className="step-number">02</div>
                        <div className="step-title">Check Out</div>
                    </div>
                    <div className="step">
                        <div className="step-number">03</div>
                        <div className="step-title">Order Completed</div>
                    </div>
                </div>

                <div className="checkout-form-container">

                    <form className="checkout-form" onSubmit={handleSubmit}>
                        <div className="billing-address">
                            <h2>Billing Address</h2>

                            <label>First Name *</label>
                            <input type="text" name="first_name" value={formData.first_name} onChange={handleChange}
                                   required/>

                            <label>Last Name *</label>
                            <input type="text" name="last_name" value={formData.last_name} onChange={handleChange}
                                   required/>

                            <label>Company Name</label>
                            <input type="text" name="company_name" value={formData.company_name} onChange={handleChange}/>

                            <label>Phone *</label>
                            <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} required/>

                            <label>Country *</label>
                            <input type="text" name="country" value={formData.country} onChange={handleChange}
                                   required/>

                            <label>City *</label>
                            <input type="text" name="city" value={formData.city} onChange={handleChange} required/>

                            <label>Address *</label>
                            <input type="text" name="address" value={formData.address} onChange={handleChange}
                                   required/>

                            <label>Postcode / ZIP *</label>
                            <input type="text" name="zip" value={formData.zip} onChange={handleChange} required/>

                        </div>

                        <div className="your-order">

                            <h2>Your Order</h2>

                            <div className="discount-code">
                                <h3>DISCOUNT CODES</h3>
                                <p>Enter your coupon if you have one</p>
                                <input
                                    type="text"
                                    placeholder="Enter coupon code"
                                    value={formData.promotionCode}
                                    onChange={handleChangeCoupon}
                                    disabled={newPrice !== null}
                                />
                                <button className="subscribe-btn" onClick={handleCouponValidation} disabled={newPrice !== null}>
                                    APPLY
                                </button>
                                {couponMessage && <p>{couponMessage}</p>}

                            </div>

                                <div className="order-summary">
                                    <table>
                                        <tbody>
                                        <tr>
                                            <td>TOTAL NUMBER PRODUCTS : </td>
                                            <td>{totalQuantity}</td>
                                        </tr>
                                        <tr>
                                            <td>TOTAL PRICE : </td>
                                            <td>{totalPrice} MAD</td>
                                        </tr>
                                        <tr>
                                            <td>PRICE TO PAY : </td>
                                            <td style={{
                                                fontWeight: 'bold',
                                                fontSize: '20px',
                                                color: 'red'
                                            }}>
                                                {newPrice === undefined || newPrice === null ? `${totalPrice} MAD` : newPrice === totalPrice ? `${totalPrice} MAD` : `${newPrice} MAD`}
                                            </td>


                                        </tr>
                                        </tbody>
                                    </table>
                                </div>


                            <h3>Payment Method</h3>
                            <label>
                                <input type="radio" name="paymentMethod" value="bank transfer"
                                           checked={formData.paymentMethod === 'bank transfer'}
                                           onChange={handleChange}/>
                                    Bank Transfer
                                </label>
                                <label style={{color:'#555'}}>
                                    <input type="radio" name="paymentMethod" value="credit_card" disabled/>
                                    Credit Card (in progress)
                                </label>
                                <label style={{color:'#555'}}>
                                    <input type="radio" name="paymentMethod" value="paypal" disabled/>
                                    PayPal (in progress)
                                </label>
                                <label style={{color:'#555'}}>
                                    <input type="radio" name="paymentMethod" value="cash_on_delivery" disabled/>
                                    Cash on Delivery (in progress)
                                </label>

                                <button type="submit" onClick={handleSubmit}>Place Order</button>
                            </div>
                    </form>
                </div>

                <Footer/>

            </div>

        );
    };

export default CheckOut;