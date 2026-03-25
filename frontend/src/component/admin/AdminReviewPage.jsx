import React, { useState, useEffect } from "react";
import '../../style/adminReview.css';
import ApiService from "../../service/ApiService";

const AdminReviewPage = () => {
    const [reviews, setReviews] = useState([]);
    const [replyText, setReplyText] = useState({});
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => { fetchReviews(); }, []);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const response = await ApiService.getAllReviews();
            setReviews(response.reviewList || []);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Không thể tải đánh giá');
            setTimeout(() => setMessage(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleReplyChange = (reviewId, text) => {
        setReplyText({ ...replyText, [reviewId]: text });
    };

    const handleSubmitReply = async (reviewId) => {
        const reply = replyText[reviewId]?.trim();
        if (!reply) {
            setMessage('Vui lòng nhập trả lời');
            return;
        }
        try {
            await ApiService.addReviewReply(reviewId, reply);
            setMessage('Đã thêm trả lời');
            setTimeout(() => setMessage(''), 3000);
            setReplyText({ ...replyText, [reviewId]: '' });
            fetchReviews();
        } catch (error) {
            setMessage(error.response?.data?.message || 'Không thể thêm trả lời');
            setTimeout(() => setMessage(''), 3000);
        }
    };

    return (
        <div className="admin-review-page">
            <h2>Quản lý đánh giá</h2>
            {message && <div className="message">{message}</div>}
            {loading && <p className="loading">Đang tải...</p>}

            <div className="reviews-list">
                {reviews.length === 0 ? (
                    <p className="empty-msg">Không có đánh giá nào</p>
                ) : (
                    reviews.map(review => (
                        <div key={review.id} className="review-card">
                            <div className="review-header">
                                <div className="review-user">
                                    <strong>{review.userName}</strong>
                                    <span className="rating">{'⭐'.repeat(review.rating)}</span>
                                </div>
                                <span className="review-date">
                                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                </span>
                            </div>

                            <div className="review-product">
                                <span className="label">Sản phẩm:</span>
                                <span>{review.productName}</span>
                            </div>

                            <div className="review-content">
                                <p><strong>Đánh giá:</strong></p>
                                <p>{review.content}</p>
                            </div>

                            {review.reply ? (
                                <div className="review-reply">
                                    <p><strong>Trả lời từ Admin:</strong></p>
                                    <p>{review.reply}</p>
                                </div>
                            ) : (
                                <div className="reply-form">
                                    <textarea
                                        placeholder="Nhập trả lời..."
                                        value={replyText[review.id] || ''}
                                        onChange={(e) => handleReplyChange(review.id, e.target.value)}
                                        rows="3"
                                    />
                                    <button 
                                        className="btn-reply"
                                        onClick={() => handleSubmitReply(review.id)}
                                    >
                                        Gửi trả lời
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminReviewPage;
