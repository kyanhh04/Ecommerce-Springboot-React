import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import ApiService from "../../service/ApiService";
import "../../style/productDetailsPage.css";

const ProductDetailsPage = () => {


const { productId } = useParams();
const { dispatch } = useCart();

const [product, setProduct] = useState(null);
const [reviews, setReviews] = useState([]);
const [averageRating, setAverageRating] = useState(0);

const [rating, setRating] = useState(0);
const [hover, setHover] = useState(0);
const [content, setContent] = useState("");

useEffect(() => {

    const fetchData = async () => {

        try {

            const productRes = await ApiService.getProductById(productId);
            setProduct(productRes.product);

            const reviewRes = await ApiService.getProductReviews(productId);

            setReviews(reviewRes.reviews || []);
            setAverageRating(reviewRes.averageRating || 0);

        } catch (err) {
            console.log(err);
        }

    };

    fetchData();

}, [productId]);

const addToCart = () => {

    dispatch({ type: "ADD_ITEM", payload: product });
    alert("Đã thêm sản phẩm vào giỏ hàng");

};

const submitReview = async () => {

    if (!rating || !content) {
        alert("Please enter rating and comment");
        return;
    }

    try {

        const body = {
            productId: productId,
            rating: rating,
            content: content
        };

        await ApiService.createReview(body);

        setRating(0);
        setContent("");

        const reviewRes = await ApiService.getProductReviews(productId);

        setReviews(reviewRes.reviews || []);
        setAverageRating(reviewRes.averageRating || 0);

    } catch (err) {
        console.log(err);
    }

};

if (!product) {
    return <p className="loading">Loading product...</p>;
}

return (

    <div className="product-detail-page">
    <div className="product-detail">

        <div className="product-container">

            <div className="product-image-detail">
                <img
                    src={product.imageUrl}
                    alt={product.name}
                />
            </div>

            <div className="product-info">

                <h1>{product.name}</h1>

                <div className="rating">

                    <span className="stars">
                        {"⭐".repeat(Math.round(averageRating))}
                    </span>

                    <span className="rating-text">
                        {averageRating.toFixed(1)} / 5
                    </span>

                    <span className="review-count">
                        ({reviews.length} reviews)
                    </span>

                </div>

                <p className="description">
                    {product.description}
                </p>

                <div className="product-extra-info">

                    <h3>Product Information</h3>

                    <div className="info-table">

                        <div className="info-row">
                            <span className="info-label">Category</span>
                            <span className="info-value">
                                {product.name || "N/A"}
                            </span>
                        </div>

                        <div className="info-row">
                            <span className="info-label">Product ID</span>
                            <span className="info-value">
                                {product.id}
                            </span>
                        </div>

                        <div className="info-row">
                            <span className="info-label">Stock</span>
                            <span className="info-value">
                                {product.stock || "Available"}
                            </span>
                        </div>

                        <div className="info-row">
                            <span className="info-label">Created</span>
                            <span className="info-value">
                                {product.createdAt
                                    ? new Date(product.createdAt).toLocaleDateString()
                                    : "N/A"}
                            </span>
                        </div>

                    </div>

                </div>

                <div className="price">
                    {product.price.toLocaleString()} ₫
                </div>

                <button
                    className="add-cart-btn"
                    onClick={addToCart}
                >
                    Add To Cart
                </button>

            </div>

        </div>


        <div className="review-section">

            <h2>Customer Reviews</h2>

            {reviews.length === 0 ? (
                <p className="no-review">
                    Chưa có review nào
                </p>
            ) : (
                reviews.map((review, index) => (

                    <div
                        className="review-card"
                        key={index}
                    >

                        <div className="review-stars">
                            {"⭐".repeat(review.rating)}
                        </div>

                        <p className="review-content">
                            {review.content}
                        </p>

                        <div className="review-date">
                            {new Date(review.createdAt).toLocaleDateString()}
                        </div>

                    </div>

                ))
            )}

        </div>


        <div className="write-review">

            <h2>Write a Review</h2>

            <div className="review-form">

                <div className="star-rating">

                    {[1,2,3,4,5].map((star) => (

                        <span
                            key={star}
                            className={
                                star <= (hover || rating)
                                ? "star active"
                                : "star"
                            }

                            onClick={() => setRating(star)}

                            onMouseEnter={() => setHover(star)}

                            onMouseLeave={() => setHover(0)}
                        >
                            ★
                        </span>

                    ))}

                </div>

                <p className="rating-value">
                    Your rating: {rating || 0} / 5
                </p>

                <textarea
                    placeholder="Write your review..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />

                <button
                    className="submit-review-btn"
                    onClick={submitReview}
                >
                    Submit Review
                </button>

            </div>

        </div>

    </div>
    </div>

);


};

export default ProductDetailsPage;
