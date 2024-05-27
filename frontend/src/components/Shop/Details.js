import React, { useEffect, useRef, useState } from 'react';
import './Details.css';
import {useParams} from 'react-router-dom';
import axios from 'axios';
import {Helmet} from "react-helmet";
import NavBar from "../NavBar/NavBar";
import Footer from "../Footer/Footer";

const Details = () => {

    const [quantity, setQuantity] = useState(1);

    const handleQuantityChange = (e) => {
        const newQuantity = parseInt(e.target.value);
        setQuantity(newQuantity);
    };


  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState('');
  const thumbnailsContainerRef = useRef(null);

  const [globalRating, setGlobalRating] = useState(0);

  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:8000/get_related_products/?product_id=${productId}`)
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRelatedProducts(data);
        } else {
          console.error('API response is not an array:', data);
        }
      })
      .catch(error => console.error('Error fetching related products:', error));
  }, [productId]);



  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/get_product/${productId}/`);
        setProduct(response.data);
        if (response.data.images && response.data.images.length > 0) {
          setMainImage(response.data.images[0].image_data);
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
      }
    };

    fetchProductDetails();

    const fetchCommentsAndRating = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/comments_product/${productId}/`);
        setGlobalRating(response.data.global_rating);
      } catch (error) {
        console.error('Error fetching comments and rating:', error);
      }
    };

    fetchCommentsAndRating();
  }, [productId]);

  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= globalRating) {
      stars.push(<span key={i} className="fa fa-star checked" style={{color:'gold'}}></span>);
    } else {
      stars.push(<span key={i} className="fa fa-star"></span>);
    }
  }

  const handleThumbnailClick = (imageData) => {
    setMainImage(imageData);
  };

  if (!product) return <div>Loading...</div>;

  const handleAddToCart = async (productId, productName) => {
      if (quantity <= 0) {
        window.alert('Quantity must be greater than 0.');
        return;
      }
      try {
          const userId = localStorage.getItem('user_id');
          await axios.post('http://localhost:8000/product/add_to_cart/', {
              user_id: userId,
              product: { id: productId, quantity: quantity },
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



  return (
      <div>

         <Helmet>
                <title>{product.name}</title>
            </Helmet>

            <NavBar />

        <div className="product-details">
          <div className="product-details-main">
            <div className="product-images">
              <img src={`data:image/jpeg;base64,${mainImage}`} alt="Main" className="main-image"/>

              <div className="product-thumbnails">
                <div ref={thumbnailsContainerRef}
                     className={`thumbnails-container${product.images.length > 5 ? ' scrollable' : ''}`}>
                  {product.images.map((image, index) => (
                      <img
                          key={index}
                          src={`data:image/jpeg;base64,${image.image_data}`}
                          alt={`Thumbnail ${index}`}
                          className="thumbnail-image"
                          onClick={() => handleThumbnailClick(image.image_data)}
                      />
                  ))}
                </div>
              </div>
            </div>

              <div className="product-info">
                  <h2>{product.name}</h2>
                  <p>{product.description}</p>
                  <p className="product-price">{product.sellingprice} MAD</p>

                  <div className="quantity-selector">
                      <label htmlFor="quantity">Quantity:</label>
                      <input
                          type="number"
                          id="quantity"
                          name="quantity"
                          value={quantity}
                          onChange={handleQuantityChange}
                          min="1"
                      />
                  </div>

                  <div className="product-actions">
                      <button className="add-to-cart" onClick={() => handleAddToCart(product._id, product.name)}><i
                          className="fas fa-shopping-cart" style={{marginRight: '15px'}}></i>Add
                          to cart
                      </button>
                      <button className="add-to-wishlist"
                              onClick={() => handleAddToWishlist(product._id, product.name)}>
                          <i className="fas fa-heart" style={{marginRight: '15px'}}></i>Add to
                          wishlist
                      </button>
                  </div>
                  <div className="product-reviews">({stars} {product.comments.length} Customer Reviews)</div>
              </div>
          </div>

            <div className="comments-section">

                <div className="star-rating">
                    <h2>Customer Reviews </h2>
                    {stars}
                </div>

                {product.comments.length > 0 ? (
                    product.comments.map((comment, index) => (
                        <div key={index} className="comment">
                      <strong>{comment.username}:</strong>
                      <p> {comment.comment}</p>
                    </div>
                ))
            ) : (
                <p className="no-comments">No comments yet.</p>
            )}
          </div>
        </div>


          <div className="related-products">
              <h3>More to love ❤️</h3>
              <div className="related-products-list">
                  {Array.isArray(relatedProducts) && relatedProducts.length > 0 ? (
                      relatedProducts.map((relatedProduct, index) => (
                          <div key={index} className="related-product">
                              <img
                                  src={`data:image/jpeg;base64,${relatedProduct.image_data}`}
                                  alt={`Related Product ${index + 1}`}
                              />
                              <h4>{relatedProduct.name}</h4>
                              <p>{relatedProduct.sellingprice} MAD</p>
                          </div>
                      ))
                  ) : (
                      <p>No related products found.</p>
                  )}
              </div>
          </div>

          <Footer />

      </div>
  );

};

export default Details;




