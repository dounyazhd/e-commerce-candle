import React, { useEffect, useState } from 'react';
import './Cart.css';
import {Link, useNavigate} from "react-router-dom";
import { Helmet } from 'react-helmet';
import axios from "axios";
import CheckOut from "./CheckOut";
import NavBar from "../NavBar/NavBar";
import Footer from "../Footer/Footer";

const Cart = () => {
    const [cart, setCart] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const totalQuantity = cart.reduce((acc, product) => acc + product.quantity, 0);
    const canProceedToCheckout = cart.length > 0;

    const navigate = useNavigate();

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const userId = localStorage.getItem('user_id');
                if (!userId) {
                    navigate('/sign_in');
                    return;
                }

                const response = await axios.get(`http://localhost:8000/get_cart/${userId}/`);
                setCart(response.data.products);
            } catch (error) {
                console.error(error);
            }
        };
        fetchCart();
    }, [navigate]);

    useEffect(() => {
        const calculateTotalPrice = () => {
            const total = cart.reduce((acc, product) => acc + product.total_price_product, 0);
            setTotalPrice(total);
        };
        calculateTotalPrice();
    }, [cart]);

    const handleRemoveFromCart = async (productId, productName) => {
        try {
            const userId = localStorage.getItem('user_id');
            await axios.delete(`http://localhost:8000/product/delete_from_cart/${userId}/${productId}/`);
            window.alert(`Product ${productName} removed from cart.`);
            setCart(cart.filter(product => product.product_id !== productId));
        } catch (error) {
            console.error(error);
            window.alert(`Failed to remove product from cart: ${error.response.data.message}`);
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
            window.alert(`Failed to add product to wishlist: ${error.response.data.message}`);
        }
    };

    const handleQuantityChange = async (productId, delta) => {
        try {
            const userId = localStorage.getItem('user_id');
            const product = cart.find(p => p.product_id === productId);
            const newQuantity = product.quantity + delta;
            if (newQuantity <= 0) {
                window.alert('Quantity cannot be less than 1.');
                return;
            }

            await axios.put(`http://localhost:8000/modify_quantity/${userId}/${productId}/${delta}/`);
            setCart(cart.map(p =>
                p.product_id === productId ? { ...p, quantity: newQuantity } : p
            ));
        } catch (error) {
            console.error(error);
        }
    };


    const [showCheckoutPage, setShowCheckoutPage] = useState(false);
    const handleCheckout = () => {
        setShowCheckoutPage(true);
    };

      const handleClick = (productId) => {
        navigate(`/details/${productId}`);
      };

    return (
        <div>
            <Helmet>
                <title>Cart</title>
            </Helmet>

            <NavBar/>

            <div className="Header1-Shop">
                <div className="image1-shop">
                    <img src="/images/FAQs/image1-faqs.jpg" alt="Logo" />
                </div>
                <div className="content1-shop">
                    <h3>Cart</h3>
                </div>
            </div>

            <div className="progress-container">
                <div className="step active">
                    <div className="step-number">01</div>
                    <div className="step-title">Shopping Cart</div>
                </div>
                <div className="step">
                    <div className="step-number">02</div>
                    <div className="step-title">Check Out</div>
                </div>
                <div className="step">
                    <div className="step-number">03</div>
                    <div className="step-title">Order Completed</div>
                </div>
            </div>

            <div className="Header1-cart">
                <div className="content1-cart">
                    {cart.length > 0 ? (
                        cart.map((product, index) => (
                            <div className="item1" key={index}>
                                <div>
                                    <img src={`data:image/jpeg;base64,${product.images[0].image_data}`} alt={product.name} />
                                </div>
                                <div className="item1-content">
                                    <div className="item1-content-name" onClick={() => handleClick(product._id)} style={{cursor:'pointer'}}>
                                        <h5>{product.product_name}</h5>
                                        <h6>{product.sellingprice} MAD</h6>
                                        <h4>Quantity : {product.quantity}</h4>
                                        <h4>Total Price Product : {product.total_price_product} MAD</h4>
                                    </div>
                                    <div className="item-modify">
                                        <div className="item1-content-icons">
                                            <i className="fas fa-trash" style={{ color: '#9f1010' }}
                                               onClick={() => {
                                                   const confirmDelete = window.confirm(`Are you sure you want to remove ${product.product_name} from cart?`);
                                                   if (confirmDelete) {
                                                       handleRemoveFromCart(product.product_id, product.product_name);
                                                   }
                                               }}></i>
                                            <i className="fas fa-heart" onClick={() => handleAddToWishlist(product.product_id, product.product_name)}></i>
                                        </div>
                                        <div className="modify-quantity">
                                            <button className="quantity-button-minus"
                                                    onClick={() => handleQuantityChange(product.product_id, -1)}>-
                                            </button>
                                            {product.quantity}
                                            <button className="quantity-button-plus"
                                                    onClick={() => handleQuantityChange(product.product_id, 1)}>+
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-products-container">
                            <p className="no-products-message">No products in cart.</p>
                            <img src="/images/oops.jpg" alt="Oops" className="oops-image" />
                        </div>
                    )}
                </div>
            </div>

            <div className="return-shop">
                <Link to="/shop">Continue Shopping</Link>
            </div>

            <div className="cart-total">
                <h3>CART TOTAL</h3>
                <p>TOTAL NUMBER PRODUCTS : {totalQuantity}</p>
                <p>TOTAL PRICE : {totalPrice} MAD</p>
                <button className="checkout-btn" onClick={handleCheckout} disabled={!canProceedToCheckout}>Proceed to Checkout</button>

                <p style={{color: '#9f1010'}}>
                    <i className="fas fa-info-circle" style={{marginRight: '8px'}}></i>
                    if you have code coupon you can use it on check out
                </p>
            </div>

            {showCheckoutPage && <CheckOut totalQuantity={totalQuantity} totalPrice={totalPrice} />}

            <Footer/>
        </div>

    );
};

export default Cart;