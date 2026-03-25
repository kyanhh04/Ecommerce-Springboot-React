import React, { useState, useEffect } from "react";
import '../../style/adminReview.css';
import ApiService from "../../service/ApiService";
import ConfirmDialog from "../common/ConfirmDialog";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

const AdminReviewPage = () => {
    const [reviews, setReviews] = useState([]);
    const [replyText, setReplyText] = useState({});
    const [editingReply, setEditingReply] = useState({});
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [confirmTitle, setConfirmTitle] = useState('');
    const [confirmMessage, setConfirmMessage] = useState('');
    const [onConfirmAction, setOnConfirmAction] = useState(null);
    const reviewsPerPage = 10;

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
            setTimeout(() => setMessage(''), 3000);
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

    const handleEditReply = (reviewId, currentReply) => {
        setEditingReply({ ...editingReply, [reviewId]: currentReply });
    };

    const handleCancelEdit = (reviewId) => {
        setEditingReply({ ...editingReply, [reviewId]: null });
    };

    const handleUpdateReply = async (reviewId) => {
        const updatedReply = editingReply[reviewId]?.trim();
        if (!updatedReply) {
            setMessage('Vui lòng nhập nội dung trả lời');
            setTimeout(() => setMessage(''), 3000);
            return;
        }
        try {
            await ApiService.addReviewReply(reviewId, updatedReply);
            setMessage('Đã cập nhật trả lời');
            setTimeout(() => setMessage(''), 3000);
            setEditingReply({ ...editingReply, [reviewId]: null });
            fetchReviews();
        } catch (error) {
            setMessage(error.response?.data?.message || 'Không thể cập nhật trả lời');
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleDeleteReview = (reviewId) => {
        setConfirmTitle('Xóa đánh giá');
        setConfirmMessage('Bạn có chắc muốn xóa đánh giá này không? Hành động này không thể hoàn tác.');
        setOnConfirmAction(() => async () => {
            try {
                await ApiService.deleteReview(reviewId);
                setMessage('Đã xóa đánh giá');
                setTimeout(() => setMessage(''), 3000);
                fetchReviews();
            } catch (error) {
                setMessage(error.response?.data?.message || 'Không thể xóa đánh giá');
                setTimeout(() => setMessage(''), 3000);
            }
            setShowConfirmDialog(false);
        });
        setShowConfirmDialog(true);
    };

    const handleDeleteReply = (reviewId) => {
        setConfirmTitle('Xóa trả lời');
        setConfirmMessage('Bạn có chắc muốn xóa trả lời này không?');
        setOnConfirmAction(() => async () => {
            try {
                await ApiService.deleteReviewReply(reviewId);
                setMessage('Đã xóa trả lời');
                setTimeout(() => setMessage(''), 3000);
                fetchReviews();
            } catch (error) {
                setMessage(error.response?.data?.message || 'Không thể xóa trả lời');
                setTimeout(() => setMessage(''), 3000);
            }
            setShowConfirmDialog(false);
        });
        setShowConfirmDialog(true);
    };

    // Pagination logic
    const indexOfLastReview = currentPage * reviewsPerPage;
    const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
    const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
    const totalPages = Math.ceil(reviews.length / reviewsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCloseConfirmDialog = () => {
        setShowConfirmDialog(false);
        setOnConfirmAction(null);
    };

    return (
        <div className="admin-review-page">
            <div className="review-header-section">
                <h2>Quản lý đánh giá</h2>
                {reviews.length > 0 && (
                    <div className="review-stats">
                        Tổng: <strong>{reviews.length}</strong> đánh giá
                    </div>
                )}
            </div>

            {message && <div className="message">{message}</div>}
            {loading && <p className="loading">Đang tải...</p>}

            <div className="reviews-list">
                {reviews.length === 0 ? (
                    <p className="empty-msg">Không có đánh giá nào</p>
                ) : (
                    currentReviews.map(review => (
                        <div key={review.id} className="review-card">
                            <div className="review-header">
                                <div className="review-user">
                                    <strong>{review.userName}</strong>
                                    <span className="rating">{'⭐'.repeat(review.rating)}</span>
                                </div>
                                <div className="review-header-actions">
                                    <span className="review-date">
                                        {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                    </span>
                                    <button 
                                        className="btn-delete"
                                        onClick={() => handleDeleteReview(review.id)}
                                        title="Xóa đánh giá"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>

                            <div className="review-product">
                                <span className="label">Sản phẩm:</span>
                                <span>{review.productName}</span>
                                {review.categoryName && (
                                    <>
                                        <span className="label" style={{ marginLeft: '20px' }}>Danh mục:</span>
                                        <span>{review.categoryName}</span>
                                    </>
                                )}
                            </div>

                            <div className="review-content">
                                <p><strong>Đánh giá:</strong></p>
                                <p>{review.content}</p>
                            </div>

                            {review.reply ? (
                                editingReply[review.id] !== undefined && editingReply[review.id] !== null ? (
                                    <div className="reply-form">
                                        <textarea
                                            placeholder="Chỉnh sửa trả lời..."
                                            value={editingReply[review.id]}
                                            onChange={(e) => setEditingReply({ ...editingReply, [review.id]: e.target.value })}
                                            rows="3"
                                        />
                                        <div className="reply-actions">
                                            <button 
                                                className="btn-reply"
                                                onClick={() => handleUpdateReply(review.id)}
                                            >
                                                Lưu thay đổi
                                            </button>
                                            <button 
                                                className="btn-cancel"
                                                onClick={() => handleCancelEdit(review.id)}
                                            >
                                                Hủy
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="review-reply">
                                        <div className="reply-header">
                                            <p><strong>Trả lời từ Admin:</strong></p>
                                            <div className="reply-actions-header">
                                                <button 
                                                    className="btn-edit"
                                                    onClick={() => handleEditReply(review.id, review.reply)}
                                                >
                                                    <FiEdit2 /> Chỉnh sửa
                                                </button>
                                                <button 
                                                    className="btn-delete-reply"
                                                    onClick={() => handleDeleteReply(review.id)}
                                                    title="Xóa trả lời"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </div>
                                        <p>{review.reply}</p>
                                    </div>
                                )
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

            {reviews.length > reviewsPerPage && (
                <div className="pagination">
                    <button 
                        className="page-btn"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        ← Trước
                    </button>

                    <div className="page-numbers">
                        {[...Array(totalPages)].map((_, index) => {
                            const pageNumber = index + 1;
                            // Hiển thị: trang đầu, trang cuối, trang hiện tại và 2 trang xung quanh
                            if (
                                pageNumber === 1 ||
                                pageNumber === totalPages ||
                                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                            ) {
                                return (
                                    <button
                                        key={pageNumber}
                                        className={`page-number ${currentPage === pageNumber ? 'active' : ''}`}
                                        onClick={() => handlePageChange(pageNumber)}
                                    >
                                        {pageNumber}
                                    </button>
                                );
                            } else if (
                                pageNumber === currentPage - 2 ||
                                pageNumber === currentPage + 2
                            ) {
                                return <span key={pageNumber} className="page-dots">...</span>;
                            }
                            return null;
                        })}
                    </div>

                    <button 
                        className="page-btn"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Sau →
                    </button>
                </div>
            )}
            
            <ConfirmDialog
                show={showConfirmDialog}
                title={confirmTitle}
                message={confirmMessage}
                onConfirm={onConfirmAction}
                onCancel={handleCloseConfirmDialog}
            />
        </div>
    );
};

export default AdminReviewPage;
