import React from 'react';
import './PerformanceOverview.css';
import {Helmet} from "react-helmet";
import {Link, useNavigate} from "react-router-dom";
import {useState, useEffect} from 'react';
import {Bar} from 'react-chartjs-2';
import axios from "axios";
import Cookies from "js-cookie";

const PerformanceOverview = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenuAdmin = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const [date, setDate] = useState('');
    const [predictions, setPredictions] = useState([]);
    const [error, setError] = useState('');
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


    const handleSubmitPrediction = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`http://localhost:8000/predict_sales_view/${date}/`, {});
            setPredictions(response.data.predictions);
        } catch (error) {
            setError('Error predicting sales. Please try again.');
        }
    };

    //******************************************************//


    const [monthlyProfits, setMonthlyProfits] = useState([]);
    const [totalProfit, setTotalProfit] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:8000/monthly_profit_view/')
            .then(response => response.json())
            .then(data => {
                setMonthlyProfits(data.monthly_profits);
                setTotalProfit(data.total_profit);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching the monthly profits:', error);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    const labels = monthlyProfits.map(profit => `${profit.year}-${profit.month}`);
    const data = {
        labels,
        datasets: [
            {
                label: 'Total Profit',
                data: monthlyProfits.map(profit => profit.total_profit),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Monthly Profits',
            },
        },
    };


    return (

        <div>

            <Helmet>
                <title>Performance Overview / Analytics </title>
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
                        <li className="nav-item"
                            style={{backgroundColor: 'white', width: '80%', borderRadius: '20px 0 0 50px'}}>
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
                        <li className="nav-item">
                            <Link to="/admin/account_settings" className="nav-link">Account Settings</Link>
                        </li>
                    </ul>
                </nav>

                <div className="content-customers">

                    <div className="profit">
                        <h2>Monthly Profits</h2>
                        <div className="chart">
                            <Bar data={data} options={options} style={{width: '100%'}}/>
                        </div>
                        <h3>Total Profit: {totalProfit}</h3>
                    </div>

                    <div className="form-container">
                        <h2>Sales Prediction</h2>
                        <form onSubmit={handleSubmitPrediction}>
                            <label>Date : (Choose Date Here)</label>
                            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required/>
                            <button type="submit">Predict</button>
                        </form>
                        {predictions.length > 0 && (
                            <div className="predictions-container">
                                <h3>Predictions for {date}</h3>
                                <table>
                                    <thead>
                                    <tr>
                                        <th>Product Name</th>
                                        <th>Predicted Units Sold</th>
                                        <th>Predicted Profit</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {predictions.map(prediction => (
                                        <tr key={prediction.product_id}>
                                            <td>{prediction.name}</td>
                                            <td>{prediction.predicted_units_sold}</td>
                                            <td>{prediction.predicted_profit}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {error && <p>{error}</p>}

                    </div>

                </div>

            </div>


        </div>

    );
};

export default PerformanceOverview;