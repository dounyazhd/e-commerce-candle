import React, {useEffect, useRef, useState} from 'react';
import './Customers.css';
import {Helmet} from 'react-helmet';
import {Link} from 'react-router-dom';
import axios from 'axios';
import Chart from 'chart.js/auto';
import NavBarProfile from "../../NavBarProfile/NavBarProfile";

const Customers = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenuAdmin = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);


    useEffect(() => {
        const fetchUsers = async () => {

            setLoading(true);

            try {
                const response = await axios.get('http://localhost:8000/get_all_users/');
                const usersWithOrders = await Promise.all(response.data.map(async (user) => {
                    if (user._id) {
                        const ordersResponse = await axios.get(`http://localhost:8000/get_orders_for_user/${user._id}/`);
                        const ordersCount = ordersResponse.data.length;
                        return {...user, number_of_orders: ordersCount};
                    } else {
                        console.error('User ID is undefined:', user);
                        return user;
                    }
                }));
                setUsers(usersWithOrders);
            } catch (error) {
                console.error('Error fetching users: ', error);
            }
            setLoading(false);
        };

        fetchUsers();
    }, []);


    const [userChart, setUserChart] = useState(null);
    const [monthCounts, setMonthCounts] = useState([]);
    const chartRef = useRef(null);

    useEffect(() => {
        const fetchMonthCounts = async () => {
            try {
                const response = await axios.get('http://localhost:8000/get_date_signin_users/');
                setMonthCounts(response.data);
            } catch (error) {
                console.error('Error fetching month counts: ', error);
            }
        };
        fetchMonthCounts();
    }, []);

    useEffect(() => {
        if (monthCounts.length > 0) {
            const ctx = chartRef.current;

            if (userChart) {
                userChart.destroy();
            }

            const newChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: monthCounts.map(item => item.month_year),
                    datasets: [{
                        label: 'Active Users per Month',
                        data: monthCounts.map(item => item.user_count),
                        borderColor: 'rgb(75, 192, 192)',
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            stepSize: 1,
                            precision: 0,
                        }
                    }
                }
            });
            setUserChart(newChart);
        }
    }, [monthCounts]);


    return (
        <div>
            <Helmet>
                <title>Customers </title>
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
                        <li className="nav-item">
                            <Link to="/admin/marketing_and_promotion" className="nav-link">Marketing and
                                Promotion</Link>
                        </li>
                        <li className="nav-item"
                            style={{backgroundColor: 'white', width: '80%', borderRadius: '20px 0 0 50px'}}>
                            <Link to="/admin/customers" className="nav-link">Customers</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/admin/account_settings" className="nav-link">Account Settings</Link>
                        </li>
                    </ul>
                </nav>


                <div className="content-customers">

                    <div className="chart-container">
                        <h3>User Growth Over Time</h3>
                        <canvas ref={chartRef}></canvas>
                    </div>

                    {loading &&
                        <div className="loading">
                            <i className="fas fa-spinner fa-spin"></i>
                        </div>
                    }

                    <div className="customer-list">

                        <div className="title">
                            <i className="fas fa-users"></i>
                            <h2>Customer List</h2>
                            <h2>({users.length} Users)</h2>
                        </div>

                        <table>
                            <thead>
                            <tr>
                                <th style={{width: '30%'}}>Username</th>
                                <th style={{width: '30%'}}>Full name</th>
                                <th style={{width: '30%'}}>Phone Number</th>
                                <th>Email</th>
                                <th style={{width: '20%'}}>Number of Orders</th>
                            </tr>
                            </thead>
                            <tbody>
                            {users.map((user) => (
                                <tr key={user._id}>
                                    <td>{user.username}</td>
                                    <td>{user.first_name} {user.last_name}</td>
                                    <td>{user.phone_number}</td>
                                    <td>{user.email}</td>
                                    <td>{user.number_of_orders}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>

                    </div>

                </div>

            </div>
        </div>
    );
};

export default Customers;
