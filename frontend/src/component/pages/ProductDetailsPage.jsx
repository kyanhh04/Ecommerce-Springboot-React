import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import ApiService from "../../service/ApiService";
import '../../style/productDetailsPage.css';

const ProductDetailsPage = () => {

    const { productId } = useParams();
    const { dispatch } = useCart();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await ApiService.getProductById(productId);
                setProduct(response.product);
            } catch (error) {
                console.log(error.message || error);
            }
        };

        fetchProduct();
    }, [productId]);

    const addToCart = () => {
        if (product) {
            const confirmOrder = window.confirm("Bạn có muốn đặt hàng sản phẩm này không?");

            if (confirmOrder) {
                dispatch({ type: 'ADD_ITEM', payload: product });
                navigate("/cart");
            }
        }
    };

    if (!product) {
        return <p>Loading product details ...</p>;
    }

    return (
        <div className="product-detail">
            <div className="product-detail-container">

                <div className="product-image-section">
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        loading="lazy"
                    />
                </div>

                <div className="product-info-section">
                    <h1>{product.name}</h1>
                    <p>{product.description}</p>
                    <h2 className="product-price">
                        {product.price.toLocaleString()} ₫
                    </h2>

                    <button
                        className="add-to-cart-btn"
                        onClick={addToCart}
                    >
                        Add To Cart
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ProductDetailsPage;