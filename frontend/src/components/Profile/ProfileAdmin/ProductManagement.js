import React, {useEffect, useState} from 'react';
import './ProductManagement.css';
import {Helmet} from "react-helmet";
import {Link, useNavigate} from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import NavBarProfile from "../../NavBarProfile/NavBarProfile";

const ProductManagement = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenuAdmin = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
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


    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);

            try {
                const response = await axios.get('http://localhost:8000/get_all_products/');
                const Products = response.data;
                setProducts(Products);
            } catch (error) {
                console.error('Error fetching products: ', error);
            }

            setLoading(false);
        };

        fetchProducts();
    }, []);

    const handleDelete = (productId) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this product?');
        if (confirmDelete) {
            fetch(`http://localhost:8000/delete_product/${productId}/`, {
                method: 'DELETE'
            })
                .then(response => {
                    if (response.ok) {
                        console.log('Product deleted successfully!');
                        setProducts(products.filter(product => product._id !== productId));
                    } else {
                        console.error('Failed to delete product');
                    }
                })
                .catch(error => {
                    console.error('Error deleting product:', error);
                });
        }
    };


    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState({});

    const handleEdit = (productId) => {
        setEditingProduct(products.find(product => product._id === productId));
        setShowEditModal(true);
    };

    const handleChange = (e) => {
        const {name, value} = e.target;
        setEditingProduct({...editingProduct, [name]: value});
    };

    const updateProduct = async () => {
        try {
            const response = await axios.put(`http://localhost:8000/update_product/${editingProduct._id}/`, editingProduct);
            if (response.status === 200) {
                console.log('Product updated successfully!');
            } else {
                console.error('Failed to update product');
            }
        } catch (error) {
            console.error('Error updating product:', error);
        }
    };

    const handleSave = () => {
        updateProduct();
        setShowEditModal(false);
        alert('Product updated successfully!');
    };


    const handleCloseModal = () => {
        setShowEditModal(false);
        setShowCreateModal(false);
    };


    const handleDeleteImage = (index) => {
        setEditingProduct({
            ...editingProduct,
            images: editingProduct.images.filter((_, i) => i !== index)
        });
    };

    const handleUploadNewImage = () => {
        if (editingProduct.newImage) {
            setEditingProduct({
                ...editingProduct,
                images: [...editingProduct.images, editingProduct.newImage],
                newImage: {}
            });
        }
    };


    const handleImageChange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onloadend = () => {
            setEditingProduct({
                ...editingProduct,
                newImage: {
                    image_name: file.name,
                    image_data: reader.result.split(",")[1]
                }
            });
        };

        if (file) {
            reader.readAsDataURL(file);
        }
    };


    //Create New Product
    const [productName, setProductName] = useState('');
    const [productCategory, setProductCategory] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [productSellingPrice, setProductSellingPrice] = useState('');
    const [productStock, setProductStock] = useState('');
    const [productUnitsSold, setProductUnitsSold] = useState(0);
    const [productDescription, setProductDescription] = useState('');

    const [selectedImages, setSelectedImages] = useState(null);
    const [imagePreviews, setImagePreviews] = useState([]);

    const [showCreateModal, setShowCreateModal] = useState(false);

    const [showRequiredFieldsAlert, setShowRequiredFieldsAlert] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [showErrorAlert, setShowErrorAlert] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');


    const handleProductNameChange = (event) => {
        setProductName(event.target.value);
    };

    const handleProductCategoryChange = (event) => {
        setProductCategory(event.target.value);
    };

    const handleProductPriceChange = (event) => {
        setProductPrice(event.target.value);
    };

    const handleProductSellingPriceChange = (event) => {
        setProductSellingPrice(event.target.value);
    };

    const handleProductStockChange = (event) => {
        setProductStock(event.target.value);
    };

    const handleProductUnitsSoldChange = (event) => {
        setProductUnitsSold(event.target.value);
    };

    const handleProductDescriptionChange = (event) => {
        setProductDescription(event.target.value);
    };


    const handleImageChangee = (event) => {
        const files = event.target.files;
        setSelectedImages(files);

        const previews = [];
        for (let i = 0; i < files.length; i++) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previews.push({src: e.target.result, file: files[i]});
                if (previews.length === files.length) {
                    setImagePreviews([...imagePreviews, ...previews]);
                }
            };
            reader.readAsDataURL(files[i]);
        }
    };

    const handleDeleteImagee = (index) => {
        const updatedPreviews = [...imagePreviews];
        updatedPreviews.splice(index, 1);
        setImagePreviews(updatedPreviews);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!productName || !productCategory || !productPrice || !productSellingPrice || !productStock || !productDescription) {
            setShowRequiredFieldsAlert(true);
            return;
        }

        const formData = new FormData();
        formData.append('productName', productName);
        formData.append('productCategory', productCategory);
        formData.append('productPrice', productPrice);
        formData.append('productSellingPrice', productSellingPrice);
        formData.append('productStock', productStock);
        formData.append('productUnitsSold', productUnitsSold);
        formData.append('productDescription', productDescription);

        for (let i = 0; i < selectedImages.length; i++) {
            formData.append('images', selectedImages[i]);
        }

        try {
            const response = await fetch('http://localhost:8000/create_product/', {
                method: 'POST',
                body: formData,
            });
            if (response.ok) {
                setShowSuccessAlert(true);
            } else {
                setShowErrorAlert(true);
                const data = await response.json();
                setErrorMessage(data.message);
            }
        } catch (error) {
            setShowErrorAlert(true);
            setErrorMessage('Error uploading images');
        }
    };

    useEffect(() => {
        if (showRequiredFieldsAlert || showSuccessAlert || showErrorAlert) {
            setTimeout(() => {
                setShowRequiredFieldsAlert(false);
                setShowSuccessAlert(false);
                setShowErrorAlert(false);
            }, 4000);
        }
    }, [showRequiredFieldsAlert, showSuccessAlert, showErrorAlert]);

    const handleDeleteAllProducts = async () => {
        const confirmation = window.confirm('Êtes-vous sûr de vouloir supprimer tous les produits ?');
        if (!confirmation) {
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/delete_all_products/', {
                method: 'DELETE',
            });
            if (response.ok) {
                console.log('Tous les produits ont été supprimés');
                alert('Tous les produits ont été supprimés avec succès');
            } else {
                console.error('Erreur lors de la suppression des produits');
                alert('Une erreur s\'est produite lors de la suppression des produits');
            }
        } catch (error) {
            console.error('Erreur lors de la suppression des produits', error);
            alert('Une erreur s\'est produite lors de la suppression des produits');
        }
    };


    return (

        <div>

            <Helmet>
                <title>Product Management </title>
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
                        >
                            <Link to="/admin/performance_overview" className="nav-link">Performance Overview /
                                Analytics</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/admin/order_management" className="nav-link">Order Management</Link>
                        </li>
                        <li className="nav-item"
                            style={{backgroundColor: 'white', width: '80%', borderRadius: '20px 0 0 50px'}}>
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

                <div className="content-products">

                    {loading &&
                        <div className="loading">
                            <i className="fas fa-spinner fa-spin"></i>
                        </div>
                    }


                    <div className="product-list">

                        <div className="title">
                            <h2>Product List</h2>
                            <h2>({products.length} Products)</h2>
                        </div>

                        <table>
                            <thead>
                            <tr>
                                <th>Category</th>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Selling Price</th>
                                <th>Stock</th>
                                <th>Units Sold</th>
                                <th>Images</th>
                                <th>Manage</th>
                            </tr>
                            </thead>
                            <tbody>
                            {products.map((product) => (
                                <tr key={product._id}>
                                    <td>{product.category}</td>
                                    <td>{product.name}</td>
                                    <td>{product.price}</td>
                                    <td>{product.sellingprice}</td>
                                    <td>{product.stock}</td>
                                    <td>{product.units_sold}</td>
                                    <td>
                                        {product.images.length > 0 && (
                                            <img
                                                src={`data:image/jpeg;base64,${product.images[0].image_data}`}
                                                alt={`Product ${product.name} Image`}
                                            />
                                        )}
                                    </td>
                                    <td>
                                        <i className="fas fa-edit" onClick={() => handleEdit(product._id)}
                                           id="icon-edit"></i>
                                        <i className="fas fa-trash" onClick={() => handleDelete(product._id)}
                                           id="icon-delete"></i>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>

                    </div>


                    {showEditModal && (
                        <div className="modal-container">

                            <div className="modal">
                                <div className="modal-content">
                                    <i className="fas fa-times" onClick={handleCloseModal}></i>

                                    <h2>Edit Product</h2>
                                    <label>Name : <input type="text" name="name" value={editingProduct.name}
                                                         onChange={handleChange}/></label>
                                    <label>Price : <input type="number" name="price" value={editingProduct.price}
                                                          onChange={handleChange}/></label>
                                    <label>Selling Price : <input type="number" name="sellingprice"
                                                                  value={editingProduct.sellingprice}
                                                                  onChange={handleChange}/></label>
                                    <label>Stock : <input type="number" name="stock"
                                                          value={editingProduct.stock}
                                                          onChange={handleChange}/></label>
                                    <label>Units Sold : <input type="number" name="units_sold"
                                                               value={editingProduct.units_sold}
                                                               onChange={handleChange}/></label>
                                    <label>Description: <textarea name="description"
                                                                  value={editingProduct.description}
                                                                  onChange={handleChange}/></label>
                                    <label>Images: </label>
                                    <div className="image-container">
                                        {editingProduct.images && editingProduct.images.map((image, index) => (
                                            <div key={index} className="image-item">
                                                <img src={`data:image/jpeg;base64,${image.image_data}`}
                                                     alt={image.image_name}/>
                                                <button onClick={() => handleDeleteImage(index)}>Delete</button>
                                            </div>
                                        ))}
                                    </div>
                                    <label>Upload New Image: <input type="file" name="newImage"
                                                                    onChange={handleImageChange}/></label>
                                    <button onClick={handleUploadNewImage}>Upload New Image</button>
                                    <button onClick={handleSave}>Save</button>
                                </div>
                            </div>

                        </div>
                    )}


                    <div className="button-create-delete">
                        <button onClick={() => setShowCreateModal(true)} className="button-create">Create New Product
                        </button>
                        <button onClick={handleDeleteAllProducts} className="button-delete">Delete All Products
                        </button>
                    </div>
                    {showCreateModal && (
                        <div className="modal-container">
                            <div className="modal">
                                <div className="modal-content">
                                    <i className="fas fa-times" onClick={handleCloseModal}></i>

                                    <h2>Create Product</h2>

                                    <label>Name :<input type="text" name="name" value={productName}
                                                        onChange={handleProductNameChange}
                                                        placeholder="Product Name"/></label>
                                    <label>Category :<input type="text" name="category" value={productCategory}
                                                            onChange={handleProductCategoryChange}
                                                            placeholder="Product Category"/></label>
                                    <label>Price :<input type="number" name="price" value={productPrice}
                                                         onChange={handleProductPriceChange}
                                                         placeholder="Product Price"/></label>
                                    <label>Selling Price :<input type="number" name="sellingprice"
                                                                 value={productSellingPrice}
                                                                 onChange={handleProductSellingPriceChange}
                                                                 placeholder="Product Selling Price"/></label>
                                    <label>Stock :<input type="number" name="stock" value={productStock}
                                                         onChange={handleProductStockChange}
                                                         placeholder="Product Stock"/></label>
                                    <label>Units Sold :<input type="number" name="units_sold"
                                                              value={productUnitsSold}
                                                              onChange={handleProductUnitsSoldChange}
                                                              placeholder="Product Units Sold"/></label>
                                    <label>Description :<textarea name="description" value={productDescription}
                                                                  onChange={handleProductDescriptionChange}
                                                                  placeholder="Product Description"/></label>
                                    <label className="file-input-label">
                                        <i className="fas fa-images"></i>
                                        Choose your images here
                                        <input type="file" name="images" multiple onChange={handleImageChangee}
                                               className="file-input"/>
                                    </label>
                                    <div className="image-container">
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} className="image-item">
                                                <img src={preview.src} alt={`Image ${index}`}/>
                                                <button onClick={() => handleDeleteImagee(index)}>Delete</button>
                                            </div>
                                        ))}
                                    </div>

                                    <button onClick={handleSubmit} style={{marginLeft: '20%'}}>Add Product</button>

                                    {showRequiredFieldsAlert &&
                                        <div className="alert">Veuillez remplir tous les champs obligatoires</div>}
                                    {showSuccessAlert && <div className="alert">Produit créé avec succès!</div>}
                                    {showErrorAlert && <div className="alert">Erreur: {errorMessage}</div>}

                                </div>
                            </div>
                        </div>
                    )}

                </div>

            </div>

        </div>
    );
};

export default ProductManagement;