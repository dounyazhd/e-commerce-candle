import React, {useEffect, useState} from 'react';
import './Shop.css';
import {useNavigate} from "react-router-dom";
import { Helmet } from 'react-helmet';
import axios from "axios";
import NavBar from "../NavBar/NavBar";
import Footer from "../Footer/Footer";

const Shop = () => {
    const [loading, setLoading] = useState(false);
    const [AllProducts, setAllProducts] = useState([]);
    const [sortOption, setSortOption] = useState('default');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 400) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);

        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };


    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleSortChange = (event) => {
        setSortOption(event.target.value);
    };

    const handleCategoryChange = (event) => {
        setCategoryFilter(event.target.value);
    };

    const handleSearchByImage = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);

        try {
            setLoading(true);
            const response = await axios.post('http://localhost:8000/search_similar_products/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setAllProducts(response.data.results);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:8000/get_all_categories/');
                setCategories(response.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchCategories();
    }, []);


    useEffect(() => {
        const fetchAllProducts = async () => {
            setLoading(true);

            let url = 'http://localhost:8000/get_all_products/';
            const params = new URLSearchParams();
            params.append('sort', sortOption);

            if (searchTerm) {
                url += `?search=${searchTerm}`;
            }

            if (categoryFilter) {
                params.append('category', categoryFilter);
            }

            try {
                const response = await axios.get(url, { params });
                setAllProducts(response.data);
            } catch (error) {
                console.error(error);
            }

            setLoading(false);
        };

        fetchAllProducts();
    }, [searchTerm, sortOption, categoryFilter]);


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
                <title>Shop</title>
            </Helmet>

            <NavBar />

            <div className="Header1-Shop">

                <div className="image1-shop">
                    <img src="/images/Shop/image1-shop.jpg" alt="Logo"/>
                </div>
                <div className="content1-shop">
                    <h3>Product</h3>
                </div>

            </div>

            <div className="Header2-Shop">
                <i className="fas fa-search"></i>
                <input type="text" placeholder="Search products..." value={searchTerm} className="search"
                       onChange={handleSearch}/>

                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <label htmlFor="file-upload" className="custom-file-upload">
                        <i className="fas fa-camera"></i>
                    </label>
                    <input id="file-upload" type="file" onChange={handleSearchByImage} accept="image/*" required style={{display: 'none'}}/>
                </div>


            </div>

            <div className="sort-shop">

                <select value={sortOption} onChange={handleSortChange}>
                    <option value="default">Default</option>
                    <option value="best_sellers">Best Sellers</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                </select>

                <select value={categoryFilter} onChange={handleCategoryChange}>
                    <option value="">All Categories</option>
                    {categories.map((category, index) => (
                        <option key={index} value={category}>
                            {category}
                        </option>
                    ))}
                </select>

            </div>

            <div className="Header3-Shop">

                {AllProducts.length === 0 && !loading && (
                    <div className="no-results">No results found.</div>
                )}

                {loading &&
                    <div className="loading">
                        <i className="fas fa-spinner fa-spin"></i>
                    </div>
                }

                <div className="content2-shop">
                    {AllProducts.map((product, index) => (
                        <div className="item1" key={index}>
                            <div>
                                {product.images && product.images.length > 0 && (
                                    <img src={`data:image/jpeg;base64,${product.images[0].image_data}`} alt={product.name}/>
                                )}
                            </div>
                            <div className="item1-content" >
                                <div className="item1-content-name" onClick={() => handleClick(product._id)} style={{ cursor: 'pointer' }}>
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

            </div>

            <div className={`scroll-to-top ${isVisible ? 'show' : ''}`} onClick={scrollToTop}>
                <i className="fas fa-arrow-up"></i>
            </div>

            <Footer />


        </div>

    );
};

export default Shop;