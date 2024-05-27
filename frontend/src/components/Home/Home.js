import React, {useEffect, useState} from 'react';
import './Home.css';
import { Link} from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import Footer from "../Footer/Footer";
import NavBar from "../NavBar/NavBar";


const Home = () => {
    const navigate = useNavigate();
    const [bestSellers, setBestSellers] = useState([]);

    useEffect(() => {
        const fetchBestSellers = async () => {
            try {
                const response = await fetch('http://localhost:8000/get_best_sellers/');
                const data = await response.json();
                setBestSellers(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchBestSellers();
    }, []);

    const handleAddToCart = async (productId, productName) => {
        try {
            const userId = localStorage.getItem('user_id');
            await axios.post('http://localhost:8000/product/add_to_cart/', {
                user_id: userId,
                product: { id: productId }
            });
            window.alert(`Product ${productName} added to cart.`);
        } catch (error) {
            console.error(error);
            window.alert(`Failed to add product to cart: ${error.response.data.message}`);
        }
    };

    const handleAddToWishlist = async (productId, productName) => {
        try {
            const userId = localStorage.getItem('user_id');
            await axios.post('http://localhost:8000/product/add_to_wishlist/', {
                user_id: userId,
                product: { id: productId }
            });
            window.alert(`Product ${productName} added to wishlist.`);
        } catch (error) {
            console.error(error);
            window.alert(`Failed to add product to cart: ${error.response.data.message}`);
        }
    };

    const handleClick = (productId) => {
        navigate(`/details/${productId}`);
    };


    return (
        <div>

            <Helmet>
                <title>Natural Candle</title>
            </Helmet>

            <NavBar/>

            <div className="Header1">

                <div className="video1-home">
                    <video autoPlay loop muted playsInline>
                        <source src="/images/Home/video1-home.mp4" type="video/mp4"/>
                        Your browser does not support the video tag.
                    </video>
                </div>

                <div className="content1-home">
                    <h1>Fill Your Home With Fragrance</h1>
                    <h3>Explore Our Collection of Scented Candles</h3>
                    <button className="button-shopnow">
                        <Link to="/shop" className="shop-link">
                            <h6>Shop now</h6>
                        </Link>
                        <FontAwesomeIcon icon={faAngleRight} style={{color: '#FFFFFF'}}/>
                        <FontAwesomeIcon icon={faAngleRight} style={{color: '#FFFFFF'}}/>
                    </button>

                </div>

            </div>


            <div className="Header2">

                <div className="content2-home">
                    <h3>Best For You</h3>
                    <h1>Meet Our Latest Creations</h1>
                    <button className="button-shopnow">
                        <Link to="/shop" className="shop-link">
                            <h6>Shop now</h6>
                        </Link>
                        <FontAwesomeIcon icon={faAngleRight} style={{color: '#FFFFFF'}}/>
                        <FontAwesomeIcon icon={faAngleRight} style={{color: '#FFFFFF'}}/>
                    </button>
                </div>

                <div className="image2-home">
                    <div>
                        <img src="/images/Home/image2-home.jpg" alt={"img"}/>
                    </div>
                </div>

            </div>


            <div className="Header3">
                <h3>Best Sellers</h3>

                <div className="content3-home">
                    {bestSellers && bestSellers.map((product, index) => (
                        <div className="item1" key={index}>
                            <div>
                                <img src={`data:image/jpeg;base64,${product.images[0].image_data}`} alt={product.name}/>
                            </div>
                            <div className="item1-content">
                                <div className="item1-content-name" onClick={() => handleClick(product._id)} style={{cursor:'pointer'}}>
                                    <h5>{product.name}</h5>
                                    <h6>{product.sellingprice} MAD</h6>
                                </div>
                                <div className="item1-content-icons">
                                    <i className="fas fa-shopping-cart"
                                       onClick={() => handleAddToCart(product._id, product.name)}></i>
                                    <i className="fas fa-heart"
                                       onClick={() => handleAddToWishlist(product._id, product.name)}></i>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button className="button-shopnow">
                    <Link to="/shop" className="shop-link">
                        <h6>View More</h6>
                    </Link>
                    <FontAwesomeIcon icon={faAngleRight} style={{color: '#FFFFFF'}}/>
                    <FontAwesomeIcon icon={faAngleRight} style={{color: '#FFFFFF'}}/>
                </button>

            </div>

            <Footer />

        </div>

    );
};

export default Home;

