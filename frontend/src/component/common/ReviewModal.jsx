import React, { useState } from "react";
import "../../style/reviewModal.css";

const ReviewModal = ({ show, onClose, product, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      alert("Vui lòng nhập nội dung đánh giá");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ rating, content });
      // Reset form
      setRating(5);
      setContent("");
      onClose();
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.className === "review-modal-overlay") {
      onClose();
    }
  };

  return (
    <div className="review-modal-overlay" onClick={handleOverlayClick}>
      <div className="review-modal">
        <div className="review-modal-header">
          <h2>Đánh giá sản phẩm</h2>
          <button className="review-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="review-modal-product">
          <img src={product?.imageUrl} alt={product?.name} />
          <div className="review-modal-product-info">
            <h3>{product?.name}</h3>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="review-modal-form">
          {/* Rating Stars */}
          <div className="review-rating-section">
            <label>Đánh giá của bạn:</label>
            <div className="review-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star-btn ${
                    star <= (hoveredRating || rating) ? "active" : ""
                  }`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                >
                  ★
                </button>
              ))}
            </div>
            <span className="rating-text">
              {rating === 1 && "Rất tệ"}
              {rating === 2 && "Tệ"}
              {rating === 3 && "Bình thường"}
              {rating === 4 && "Tốt"}
              {rating === 5 && "Rất tốt"}
            </span>
          </div>

          {/* Review Content */}
          <div className="review-content-section">
            <label>Nhận xét của bạn:</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
              rows="5"
              required
              disabled={loading}
            />
          </div>

          {/* Submit Buttons */}
          <div className="review-modal-actions">
            <button
              type="button"
              className="review-cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="review-submit-btn"
              disabled={loading}
            >
              {loading ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
