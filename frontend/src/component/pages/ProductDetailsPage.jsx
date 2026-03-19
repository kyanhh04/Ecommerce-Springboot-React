import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import ApiService from "../../service/ApiService";
import "../../style/productDetailsPage.css";

const ProductDetailsPage = () => {
  const { productId } = useParams();
  const { dispatch } = useCart();

  const [product, setProduct] = useState(null);
  const [categoryName, setCategoryName] = useState("N/A");
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [content, setContent] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Lấy product
        const productRes = await ApiService.getProductById(productId);
        setProduct(productRes.product);

        // 2. Lấy reviews
        const reviewRes = await ApiService.getProductReviews(productId);
        setReviews(reviewRes.reviews || []);
        setAverageRating(reviewRes.averageRating || 0);

        // 3. Lấy tên category dựa trên category_id
        if (productRes.product.category_id) {
          const categoryRes = await ApiService.getCategoryById(
            productRes.product.category_id,
          );
          setCategoryName(categoryRes.name || "N/A");
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, [productId]);

  const addToCart = () => {
    dispatch({ type: "ADD_ITEM", payload: product });
    alert("Đã thêm vào giỏ hàng");
  };

  const submitReview = async () => {
    if (!rating || !content) {
      alert("Please enter rating and comment");
      return;
    }

    try {
      const body = { productId, rating, content };
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
            <img src={product.imageUrl} alt={product.name} />
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
              <span className="review-count">({reviews.length} reviews)</span>
            </div>

            <p className="description">{product.description}</p>

            <div className="product-extra-info">
              <h3>Thông tin sản phẩm</h3>
              <div className="info-table">
                <div className="info-row">
                  <span className="info-label">Danh mục</span>
                  <span className="info-value">{categoryName}</span>
                </div>

                <div className="info-row">
                  <span className="info-label">Số lượng còn lại</span>
                  <span className="info-value">
                    {product.stock || "Available"}
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label">Ngày sản xuất</span>
                  <span className="info-value">
                    {product.createdAt
                      ? new Date(product.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="price">{product.price.toLocaleString()} ₫</div>
            <button className="add-cart-btn" onClick={addToCart}>
              Thêm vào giỏ hàng
            </button>
          </div>
        </div>

        {/* Review section */}
        <div className="review-section">
          <h2>Đánh giá sản phẩm</h2>
          {reviews.length === 0 ? (
            <p className="no-review">Chưa có đánh giá </p>
          ) : (
            reviews.map((review, index) => (
              <div className="review-card" key={index}>
                <div className="review-stars">{"⭐".repeat(review.rating)}</div>
                <p className="review-content">{review.content}</p>
                <div className="review-date">
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Write review */}
        <div className="write-review">
          <h2>Đánh giá</h2>
          <div className="review-form">
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={star <= (hover || rating) ? "star active" : "star"}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                >
                  ★
                </span>
              ))}
            </div>

            <p className="rating-value">Xếp hạng: {rating || 0} / 5</p>

            <textarea
              placeholder="Viết đánh giá ...."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <button className="submit-review-btn" onClick={submitReview}>
              Gửi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
