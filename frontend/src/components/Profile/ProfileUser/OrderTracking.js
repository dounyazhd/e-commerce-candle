import React, {useEffect, useState} from 'react';
import './OrderTracking.css';
import {Helmet} from 'react-helmet';
import {Link} from 'react-router-dom';
import axios from 'axios';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCheckCircle, faTimesCircle} from '@fortawesome/free-solid-svg-icons';

const OrderTracking = () => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            const userId = localStorage.getItem('user_id');
            try {
                const response = await axios.get(`http://localhost:8000/get_orders_for_user/${userId}/`);
                setOrders(response.data);
            } catch (error) {
                setError('Failed to fetch orders');
            }
        };

        fetchOrders();
    }, []);

    const handleCancelOrder = async (orderId) => {
        const userId = localStorage.getItem('user_id');
        try {
            const response = await axios.post('http://localhost:8000/cancel_order/', {
                user_id: userId,
                order_id: orderId,
            });
            if (response.data.message === 'Order cancelled successfully!') {
                setOrders((prevOrders) =>
                    prevOrders.map((order) =>
                        order._id === orderId ? {...order, status: 'cancelled'} : order
                    )
                );
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            setError('Failed to cancel the order');
        }
    };


    const handleShowDetails = (order) => {
        setSelectedOrder(order);
    };

    const handleCloseDetails = () => {
        setSelectedOrder(null);
    };

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <Helmet>
                <title>Personal Information</title>
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
                    <li className="nav-item-user-active">
                        <Link to="/profile/order_tracking" className="nav-link">Order Tracking</Link>
                    </li>
                    <li className="nav-item-user">
                        <Link to="/profile/coupons" className="nav-link">Coupons</Link>
                    </li>
                </ul>

            </nav>

            <div className="order-list">
                <div className="title">
                    <h2>Orders List</h2>
                    <h2>({orders.length} Orders)</h2>
                </div>
                {orders.length > 0 ? (
                    <table style={{width: '100%', borderCollapse: 'collapse'}}>
                        <thead>
                        <tr>
                            <th>Order Date</th>
                            <th>Full Name</th>
                            <th>Phone</th>
                            <th>Address</th>
                            <th>Total Price</th>
                            <th>Payment Method</th>
                            <th>Status</th>
                            <th>Products Details</th>
                        </tr>
                        </thead>
                        <tbody>
                        {orders.map((order, index) => (
                            <tr key={index}>
                                <td>{new Date(order.order_date).toLocaleString()}</td>
                                <td>{order.first_name} {order.last_name}</td>
                                <td>{order.phone_number}</td>
                                <td>{order.country} {order.city} {order.address} {order.zip}</td>
                                <td>{order.total_price}</td>
                                <td>
                                    {order.payment_method}
                                    {order.is_paid ? (
                                        <FontAwesomeIcon icon={faCheckCircle}
                                                         style={{marginLeft: '8px', color: 'green'}}/>
                                    ) : (
                                        <FontAwesomeIcon icon={faTimesCircle}
                                                         style={{marginLeft: '8px', color: 'red'}}/>
                                    )}
                                </td>
                                <td>{order.status}</td>
                                <td>
                                    <button onClick={() => handleShowDetails(order)}
                                            className="button-details">Details
                                    </button>
                                    {order.status === 'pending' && (
                                        <button onClick={() => handleCancelOrder(order._id)}
                                                className="button-cancel">Cancel</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No orders available.</p>
                )}
            </div>

            {selectedOrder && (
                <div className="modal-container">
                    <div className="modal">
                        <div className="modal-content">
                            <i className="fas fa-times" onClick={handleCloseDetails}></i>
                            <h2>Order Details</h2>
                            <table style={{width: '100%', borderCollapse: 'collapse'}}>
                                <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Selling Price</th>
                                    <th>Images</th>
                                    <th>Quantity</th>
                                </tr>
                                </thead>
                                <tbody>
                                {selectedOrder.products.map((product, idx) => (
                                    <tr key={idx}>
                                        <td>{product.name}</td>
                                        <td>{product.sellingprice}</td>
                                        <td>
                                            {product.images.length > 0 && (
                                                <img
                                                    src={`data:image/jpeg;base64,${product.images[0].image_data}`}
                                                    alt={`Product ${product.name} Image`}
                                                />
                                            )}
                                        </td>
                                        <td>{product.quantity}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};

export default OrderTracking;
