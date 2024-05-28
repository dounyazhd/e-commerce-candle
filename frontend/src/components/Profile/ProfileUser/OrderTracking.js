import React, { useEffect, useState } from 'react';
import './OrderTracking.css';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import NavBarProfile from "../../NavBarProfile/NavBarProfile";

const OrderTracking = () => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [error, setError] = useState(null);
    const [comment, setComment] = useState('');
    const [commentProductId, setCommentProductId] = useState(null);
    const [commentOrderId, setCommentOrderId] = useState(null);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('');

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
                        order._id === orderId ? { ...order, status: 'cancelled' } : order
                    )
                );
                showAlert('Order cancelled successfully!', 'success');
            } else {
                setError(response.data.message);
                showAlert(response.data.message, 'error');
            }
        } catch (error) {
            setError('Failed to cancel the order');
            showAlert('Failed to cancel the order', 'error');
        }
    };

    const handleShowDetails = (order) => {
        setSelectedOrder(order);
    };

    const handleCloseDetails = () => {
        setSelectedOrder(null);
    };

    const handleAddComment = async (orderId, productId) => {
        const userId = localStorage.getItem('user_id');
        try {
            const response = await axios.post(`http://localhost:8000/product/add_comment/`, {
                comment,
                username: userId,
                order_id: orderId,
                product_id: productId
            });
            if (response.data.message === 'Comment added successfully!') {
                setComment('');
                setCommentProductId(null);
                setCommentOrderId(null);
                showAlert('Comment added successfully!', 'success');
                const updatedOrders = orders.map(order => {
                    if (order._id === orderId) {
                        return {
                            ...order,
                            products: order.products.map(product => {
                                if (product._id === productId) {
                                    return {
                                        ...product,
                                        comments: [...product.comments, { username: userId, comment }]
                                    };
                                }
                                return product;
                            })
                        };
                    }
                    return order;
                });
                setOrders(updatedOrders);
            } else {
                setError(response.data.message);
                showAlert(response.data.message, 'error');
            }
        } catch (error) {
            setError('Failed to add comment');
            showAlert('Failed to add comment', 'error');
        }
    };

    const showAlert = (message, type) => {
        setAlertMessage(message);
        setAlertType(type);
        setTimeout(() => {
            setAlertMessage('');
            setAlertType('');
        }, 3000);
    };

    if (error) {
        return <div>{error}</div>;
    }


    return (
        <div>
            <Helmet>
                <title>Personal Information</title>
            </Helmet>

            <NavBarProfile/>

            <nav className='dashboard-user'>
                <div className="top-user">
                    <img src="/images/Home/logo.jpg" alt="Logo" />
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

             {alertMessage && (
                <div className={`alert ${alertType === 'success' ? 'alert-success' : 'alert-error'}`}>
                    {alertMessage}
                </div>
            )}

            <div className="order-list">
                <div className="title">
                    <h2>Orders List</h2>
                    <h2>({orders.length} Orders)</h2>
                </div>
                {orders.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                                            <FontAwesomeIcon icon={faCheckCircle} style={{ marginLeft: '8px', color: 'green' }} />
                                        ) : (
                                            <FontAwesomeIcon icon={faTimesCircle} style={{ marginLeft: '8px', color: 'red' }} />
                                        )}
                                    </td>
                                    <td>{order.status}</td>
                                    <td>
                                        <button onClick={() => handleShowDetails(order)} className="button-details">Details</button>
                                        {order.status === 'pending' && (
                                            <button onClick={() => handleCancelOrder(order._id)} className="button-cancel">Cancel</button>
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
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Selling Price</th>
                                        <th>Images</th>
                                        <th>Quantity</th>
                                        <th>Add Comment</th>
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
                                            <td>
                                                {selectedOrder.status === 'Delivered' && (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                setCommentProductId(product._id);
                                                                setCommentOrderId(selectedOrder._id);
                                                            }}
                                                            className="button-comment"
                                                            style={{width:'max-content', height:'auto'}}
                                                        >
                                                            Add Comment
                                                        </button>
                                                        {commentProductId === product._id && commentOrderId === selectedOrder._id && (
                                                            <div className="comment-form">
                                                                <input
                                                                    type="text"
                                                                    value={comment}
                                                                    onChange={(e) => setComment(e.target.value)}
                                                                    placeholder="Enter your comment"
                                                                    required
                                                                />
                                                                <button
                                                                    onClick={() => handleAddComment(selectedOrder._id, product._id)}
                                                                    className="button-submit"
                                                                    style={{width:'max-content', height:'auto'}}
                                                                >
                                                                    Submit
                                                                </button>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                                <div>
                                                    {product.comments && product.comments.map((comment, commentIdx) => (
                                                        <p key={commentIdx}><strong>{comment.username}:</strong> {comment.comment}</p>
                                                    ))}
                                                </div>
                                            </td>
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

