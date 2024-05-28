import React from 'react';
import './PerformanceOverview.css';
import {Helmet} from "react-helmet";
import {Link} from "react-router-dom";
import {useState, useEffect} from 'react';
import {Bar} from 'react-chartjs-2';
import axios from "axios";
import NavBarProfile from "../../NavBarProfile/NavBarProfile";
import TotalCard from "./TotalCard";

const PerformanceOverview = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenuAdmin = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    //*************************************************************************//

    const [totals, setTotals] = useState({});

    useEffect(() => {
        axios.get('http://localhost:8000/get_totals/')
            .then(response => {
                setTotals(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching totals:', error);
                setLoading(false);
            });
    }, []);

    //***************************************************************************//

    const [date, setDate] = useState('');
    const [predictions, setPredictions] = useState([]);
    const [error, setError] = useState('');

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

            <NavBarProfile/>

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

                    <div className="performance-overview-container">
                        <div className="card-grid">
                            <TotalCard
                                title="Total Customers"
                                value={totals.total_users}
                                description="Increase in Customers"
                                iconClassName="fas fa-users"
                            />
                            <TotalCard
                                title="Products"
                                value={totals.total_products}
                                description="Total number of products available"
                                iconClassName="fas fa-box"
                            />
                            <TotalCard
                                title="Different Categories"
                                value={totals.total_categories}
                                description="Total number of categories in app"
                                iconClassName="fas fa-list"
                            />
                            <TotalCard
                                title="Total Orders"
                                value={totals.total_orders}
                                description="Total number of orders"
                                iconClassName="fas fa-shopping-cart"
                            />
                        </div>
                    </div>

                    <div className="content-performance">

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


        </div>

    );
};

export default PerformanceOverview;