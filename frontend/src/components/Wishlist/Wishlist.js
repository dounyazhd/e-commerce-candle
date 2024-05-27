import React, {useEffect, useState} from 'react';
import './Wishlist.css';
import {useNavigate} from "react-router-dom";
import { Helmet } from 'react-helmet';
import axios from "axios";
import NavBar from "../NavBar/NavBar";
import Footer from "../Footer/Footer";


const Wishlist = () => {

    const [wishlist, setWishlist] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const userId = localStorage.getItem('user_id');
                const response = await axios.get(`http://localhost:8000/get_wishlist/${userId}/`);
                setWishlist(response.data.products);
            } catch (error) {
                console.error(error);
            }
        };
        fetchWishlist();
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

    const handleRemoveFromWishlist = async (productId, productName) => {
        try {
            const userId = localStorage.getItem('user_id');
            await axios.delete(`http://localhost:8000/product/delete_from_wishlist/${userId}/${productId}/`);
            window.alert(`Product ${productName} removed from wishlist.`);
            setWishlist(wishlist.filter(product => product.product_id !== productId));
        } catch (error) {
            console.error(error);
            window.alert(`Failed to remove product from wishlist: ${error.response.data.message}`);
        }
    };

      const handleClick = (productId) => {
        navigate(`/details/${productId}`);
      };


    return (
        <div>

            <Helmet>
                <title>Wishlist</title>
            </Helmet>

            <NavBar />

            <div className="Header1-Shop">

                <div className="image1-shop">
                    <img src="/images/FAQs/image1-faqs.jpg" alt="Logo"/>
                </div>
                <div className="content1-shop">
                    <h3>Wishlist</h3>
                </div>

            </div>


            <div className="Header1-wishlist">
                <div className="content1-wishlist">

                    {wishlist.length > 0 ? (
                        wishlist.map((product, index) => (
                            <div className="item1" key={index}>
                                <div>
                                    <img src={`data:image/jpeg;base64,${product.images[0].image_data}`}
                                         alt={product.name}/>
                                </div>
                                <div className="item1-content">
                                    <div className="item1-content-name" onClick={() => handleClick(product._id)}>
                                        <h5>{product.product_name}</h5>
                                        <h6>{product.sellingprice} MAD</h6>
                                    </div>
                                    <div className="item1-content-icons">
                                        <i className="fas fa-shopping-cart"
                                           onClick={() => handleAddToCart(product.product_id, product.product_name)}></i>
                                        <i className="fas fa-trash" style={{color: '#9f1010'}}
                                           onClick={() => {
                                               const confirmDelete = window.confirm(`Are you sure you want to remove ${product.product_name} from wishlist?`);
                                               if (confirmDelete) {
                                                   handleRemoveFromWishlist(product.product_id, product.product_name);
                                               }
                                           }}
                                        ></i>

                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-products-container">
                            <p className="no-products-message">No products in wishlist.</p>
                            <img src="/images/oops.jpg" alt="Oops" className="oops-image"/>
                        </div>
                    )}

                </div>
            </div>

            <Footer />

        </div>

    );
};

export default Wishlist;