import React, {useEffect, useState} from 'react';
import './OrderManagement.css';
import {Helmet} from "react-helmet";
import {Link} from "react-router-dom";
import axios from "axios";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheckCircle, faTimesCircle} from "@fortawesome/free-solid-svg-icons";
import NavBarProfile from "../../NavBarProfile/NavBarProfile";

const OrderManagement = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenuAdmin = () => {
        setIsMenuOpen(!isMenuOpen);
    };
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [editingOrderId, setEditingOrderId] = useState(null);


    const handleShowDetails = (order) => {
        setSelectedOrder(order);
    };

    const handleCloseDetails = () => {
        setSelectedOrder(null);
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await axios.get('http://localhost:8000/get_all_orders/');
            const ordersWithId = response.data.map((order, index) => ({...order, id: order._id}));
            setOrders(ordersWithId);
        } catch (error) {
            console.error("Error fetching orders: ", error.response?.data?.message);
        }
    };


    const updatePaymentStatus = async (order) => {
        try {
            if (!order.id) {
                console.error('Order ID is undefined');
                return;
            }

            const confirmation = window.confirm('Are you sure you want to update the payment status?');
            if (!confirmation) {
                return;
            }

            const updatedOrder = {...order, is_paid: !order.is_paid};
            await axios.put(`http://localhost:8000/update_order/${order.id}/`, updatedOrder);
            setOrders(orders.map(o => o.id === order.id ? updatedOrder : o));
        } catch (error) {
            console.error('Error updating payment status:', error);
        }
    };


    const updateOrderStatus = async (order, newStatus) => {
        try {
            if (!order.id) {
                console.error('Order ID is undefined');
                return;
            }

            if (order.status === 'cancelled') {
                window.alert('Cannot update status for cancelled order');
                return;
            }


            const confirmation = window.confirm('Are you sure you want to update the order status?');
            if (!confirmation) {
                return;
            }

            const updatedOrder = {...order, status: newStatus};
            await axios.put(`http://localhost:8000/update_order/${order.id}/`, updatedOrder);
            setOrders(orders.map(o => o.id === order.id ? updatedOrder : o));
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    };


    return (
        <div>
            <Helmet>
                <title>Order Management</title>
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
                        <li className="nav-item"
                            style={{backgroundColor: 'white', width: '80%', borderRadius: '20px 0 0 50px'}}>
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
                        <li className="nav-item">
                            <Link to="/admin/account_settings" className="nav-link">Account Settings</Link>
                        </li>
                    </ul>
                </nav>

                <div className="order-list">
                    <div className="title">
                        <h2>Orders List</h2>
                        <h2>({orders.length} Orders)</h2>
                    </div>

                    {Array.isArray(orders) && orders.length > 0 ? (
                        <>
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
                                        <td onClick={() => updatePaymentStatus(order)} style={{cursor: 'pointer'}}>
                                            {order.payment_method}
                                            {order.is_paid ? (
                                                <FontAwesomeIcon icon={faCheckCircle}
                                                                 style={{marginLeft: '8px', color: 'green'}}/>
                                            ) : (
                                                <FontAwesomeIcon icon={faTimesCircle}
                                                                 style={{marginLeft: '8px', color: 'red'}}/>
                                            )}

                                            <p style={{color: '#9f1010', fontSize: '14px'}}>
                                                <i className="fas fa-info-circle" style={{fontSize: '14px'}}></i>
                                                Clic to Change
                                            </p>
                                        </td>
                                        <td onClick={() => setEditingOrderId(order.id)} style={{cursor: 'pointer'}}>
                                            {editingOrderId === order.id ? (
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => updateOrderStatus(order, e.target.value)}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="On the way">On the way</option>
                                                    <option value="Delivered">Delivered</option>
                                                </select>
                                            ) : (
                                                order.status
                                            )}

                                            <p style={{color: '#9f1010', fontSize: '14px'}}>
                                                <i className="fas fa-info-circle" style={{fontSize: '14px'}}></i>
                                                Clic to Change
                                            </p>
                                        </td>
                                        <td>
                                            <button onClick={() => handleShowDetails(order)}
                                                    className="button-details">Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>

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
                        </>
                    ) : (
                        <p>No orders available.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderManagement;
