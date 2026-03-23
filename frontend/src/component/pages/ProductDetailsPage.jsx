import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import ApiService from "../../service/ApiService";
import "../../style/productDetailsPage.css";

// Import Google Font
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
fontLink.rel = 'stylesheet';
if (!document.querySelector('link[href*="Inter"]')) {
    document.head.appendChild(fontLink);
}

const ProductDetailsPage = () => {

const { productId } = useParams();
const navigate = useNavigate();
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

const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
        setQuantity(value);
    } else if (e.target.value === '') {
        setQuantity(1);
    }
};

const scrollToReviews = () => {
    const reviewSection = document.querySelector('.review-section');
    if (reviewSection) {
        reviewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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

            <div className="product-left-column">
                <div className="product-image-detail">
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                    />
                </div>
            </div>

            <div className="product-info">

                <h1>{product.name}</h1>

                <div className="rating-review-bar">
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
                    <button className="view-reviews-btn" onClick={scrollToReviews}>
                        Xem đánh giá
                    </button>
                </div>

                <div className="price">
                    {product.price.toLocaleString()} ₫
                </div>

                <div className="product-extra-info">
                    <h3>Thông tin sản phẩm</h3>
                    <div className="info-table">
                        <div className="info-row">
                            <span className="info-label">Danh mục</span>
                            <span className="info-value">{product.category?.name || "Chưa phân loại"}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">An tâm khi mua hàng</span>
                            <span className="info-value">Trả hàng miễn phí sau 15 ngày</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Cam kết</span>
                            <span className="info-value">Hàng chính hàng, chất lượng cao</span>
                        </div>
                        
                        <div className="info-row">
                            <span className="info-label">Tồn kho</span>
                            <span className="info-value">
                                {product.stock || "Còn hàng"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="quantity-selector">
                    <button onClick={decrementQuantity}>-</button>
                    <input 
                        type="number" 
                        value={quantity} 
                        onChange={handleQuantityChange}
                        min="1"
                    />
                    <button onClick={incrementQuantity}>+</button>
                </div>

            </div>

        </div>

        <div className="bottom-actions-row">
            <div className="image-actions">
                <button className="wishlist-btn" onClick={toggleWishlist}>
                    {isWishlisted ? "❤️" : "🤍"}
                    <span className="wishlist-count">{wishlistCount}</span>
                </button>

                <div className="share-section">
                    <span className="share-label">Chia sẻ:</span>
                    <div className="share-icons">
                        <button className="share-btn facebook">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                        </button>
                        <button className="share-btn zalo">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 15.567c-.02.267-.153.5-.356.656-.203.156-.458.234-.72.22h-.002c-1.83-.097-3.584-.684-5.065-1.694l-2.656 1.004c-.168.063-.356.047-.51-.044-.154-.09-.26-.244-.287-.418l-.47-3.003c-.89-1.456-1.36-3.13-1.36-4.844 0-4.97 4.03-9 9-9s9 4.03 9 9c0 2.544-1.06 4.844-2.76 6.49l.186 1.633z"/>
                            </svg>
                        </button>
                        <button className="share-btn instagram">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                        </button>
                        <button className="share-btn telegram">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <button className="add-cart-btn" onClick={addToCart}>Thêm vào giỏ hàng</button>
        </div>

        <div className="product-description-section">
            <h2>Mô tả sản phẩm</h2>
            <p>{product.description}</p>
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
