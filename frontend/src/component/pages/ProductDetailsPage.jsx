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
const [isWishlisted, setIsWishlisted] = useState(false);
const [wishlistCount, setWishlistCount] = useState(0);
const [quantity, setQuantity] = useState(1);

const [reviewError, setReviewError] = useState("");
const [reviewSuccess, setReviewSuccess] = useState("");
const [rating, setRating] = useState(0);
const [hover, setHover] = useState(0);
const [content, setContent] = useState("");

useEffect(() => {

    const fetchData = async () => {

        try {

            const productRes = await ApiService.getProductById(productId);
            setProduct(productRes.product);

            const reviewRes = await ApiService.getProductReviews(productId);
            setReviews(reviewRes.reviewList || []);
            setAverageRating(reviewRes.averageRating || 0);

            const countRes = await ApiService.getWishlistCount(productId);
            setWishlistCount(parseInt(countRes.message) || 0);

            if (ApiService.isAuthenticated()) {
                const wishRes = await ApiService.getWishlist();
                const inWishlist = (wishRes.wishlistList || []).some(
                    (w) => w.product.id === parseInt(productId)
                );
                setIsWishlisted(inWishlist);
            }

        } catch (err) {
            console.log(err);
        }

    };

    fetchData();

}, [productId]);

const toggleWishlist = async () => {
    if (!ApiService.isAuthenticated()) {
        alert("Vui lòng đăng nhập để thêm vào yêu thích");
        return;
    }
    try {
        if (isWishlisted) {
            await ApiService.removeFromWishlist(product.id);
            setWishlistCount(prev => Math.max(0, prev - 1));
        } else {
            await ApiService.addToWishlist(product.id);
            setWishlistCount(prev => prev + 1);
        }
        setIsWishlisted(!isWishlisted);
    } catch (e) {
        console.error(e);
    }
};

const addToCart = () => {
    dispatch({ type: "ADD_ITEM", payload: { ...product, quantity } });
    alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
};

const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
};

const decrementQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1));
};

const submitReview = async () => {
    if (!rating || !content) {
        setReviewError("Vui lòng nhập đánh giá và nội dung");
        return;
    }
    setReviewError("");
    setReviewSuccess("");
    try {
        const res = await ApiService.createReview({ productId, rating, content });
        if (res.status !== 200) {
            setReviewError(res.message || "Gửi đánh giá thất bại");
            return;
        }
        setReviewSuccess("Đã gửi đánh giá thành công!");
        setRating(0);
        setContent("");
        const reviewRes = await ApiService.getProductReviews(productId);
        setReviews(reviewRes.reviewList || []);
        setAverageRating(reviewRes.averageRating || 0);
    } catch (err) {
        setReviewError(err.response?.data?.message || err.message || "Gửi đánh giá thất bại");
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
                            <span className="info-label">Stock</span>
                            <span className="info-value">
                                {product.stock || "Available"}
                            </span>
                        </div>

                    </div>

                </div>

                <div className="price">
                    {product.price.toLocaleString()} ₫
                </div>

                <div className="quantity-selector">
                    <button onClick={decrementQuantity}>-</button>
                    <span>{quantity}</span>
                    <button onClick={incrementQuantity}>+</button>
                </div>

                <button className="add-cart-btn" onClick={addToCart}>Add To Cart</button>
                <button className="wishlist-btn" onClick={toggleWishlist}>
                    {isWishlisted ? "❤️" : "🤍"} {wishlistCount}
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
                reviews.map((review) => (

                    <div
                        className="review-card"
                        key={review.id}
                    >

                        <div className="review-stars">
                            {"⭐".repeat(review.rating)}
                        </div>

                        <p className="review-content">{review.content}</p>

                        <div className="review-date">
                            {review.userName ? `${review.userName} · ` : ''}
                            {new Date(review.createdAt).toLocaleDateString()}
                        </div>

                    </div>

                ))
            )}

        </div>


        <div className="write-review">

            <h2>Write a Review</h2>

            <div className="review-form">
                {reviewError && <p style={{color: 'red', marginBottom: 8}}>{reviewError}</p>}
                {reviewSuccess && <p style={{color: 'green', marginBottom: 8}}>{reviewSuccess}</p>}

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
