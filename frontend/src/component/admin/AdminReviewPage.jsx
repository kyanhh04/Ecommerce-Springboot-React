import React, { useState, useEffect } from "react";
import '../../style/adminReview.css';
import ApiService from "../../service/ApiService";
import ConfirmDialog from "../common/ConfirmDialog";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";

const AdminReviewPage = () => {
    const [reviews, setReviews] = useState([]);
    const [newReplyText, setNewReplyText] = useState({});
    const [editingReply, setEditingReply] = useState({});
    const [showNewReplyForm, setShowNewReplyForm] = useState({});
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

    const handleNewReplyChange = (reviewId, text) => {
        setNewReplyText({ ...newReplyText, [reviewId]: text });
    };

    const handleShowNewReplyForm = (reviewId) => {
        setShowNewReplyForm({ ...showNewReplyForm, [reviewId]: true });
    };

    const handleCancelNewReply = (reviewId) => {
        setShowNewReplyForm({ ...showNewReplyForm, [reviewId]: false });
        setNewReplyText({ ...newReplyText, [reviewId]: '' });
    };

    const handleSubmitNewReply = async (reviewId) => {
        const content = newReplyText[reviewId]?.trim();
        if (!content) {
            setMessage('Vui lòng nhập nội dung trả lời');
            setTimeout(() => setMessage(''), 3000);
            return;
        }
        try {
            await ApiService.addNewReply(reviewId, content);
            setMessage('Đã thêm trả lời mới');
            setTimeout(() => setMessage(''), 3000);
            setNewReplyText({ ...newReplyText, [reviewId]: '' });
            setShowNewReplyForm({ ...showNewReplyForm, [reviewId]: false });
            fetchReviews();
        } catch (error) {
            setMessage(error.response?.data?.message || 'Không thể thêm trả lời');
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleEditReply = (replyId, currentContent) => {
        setEditingReply({ ...editingReply, [replyId]: currentContent });
    };

    const handleCancelEdit = (replyId) => {
        setEditingReply({ ...editingReply, [replyId]: null });
    };

    const handleUpdateReply = async (replyId) => {
        const updatedContent = editingReply[replyId]?.trim();
        if (!updatedContent) {
            setMessage('Vui lòng nhập nội dung trả lời');
            setTimeout(() => setMessage(''), 3000);
            return;
        }
        try {
            await ApiService.updateReplyById(replyId, updatedContent);
            setMessage('Đã cập nhật trả lời');
            setTimeout(() => setMessage(''), 3000);
            setEditingReply({ ...editingReply, [replyId]: null });
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

    const handleDeleteReply = (replyId) => {
        setConfirmTitle('Xóa trả lời');
        setConfirmMessage('Bạn có chắc muốn xóa trả lời này không?');
        setOnConfirmAction(() => async () => {
            try {
                await ApiService.deleteReplyById(replyId);
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

                            {/* Display multiple replies */}
                            {review.replies && review.replies.length > 0 && (
                                <div className="replies-section">
                                    <p className="replies-title"><strong>Trả lời từ Admin:</strong></p>
                                    {review.replies.map(reply => (
                                        <div key={reply.id} className="reply-item">
                                            {editingReply[reply.id] !== undefined && editingReply[reply.id] !== null ? (
                                                <div className="reply-form">
                                                    <textarea
                                                        placeholder="Chỉnh sửa trả lời..."
                                                        value={editingReply[reply.id]}
                                                        onChange={(e) => setEditingReply({ ...editingReply, [reply.id]: e.target.value })}
                                                        rows="3"
                                                    />
                                                    <div className="reply-actions">
                                                        <button 
                                                            className="btn-reply"
                                                            onClick={() => handleUpdateReply(reply.id)}
                                                        >
                                                            Lưu thay đổi
                                                        </button>
                                                        <button 
                                                            className="btn-cancel"
                                                            onClick={() => handleCancelEdit(reply.id)}
                                                        >
                                                            Hủy
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="reply-header">
                                                        <span className="reply-date">
                                                            {new Date(reply.createdAt).toLocaleDateString('vi-VN')} {new Date(reply.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                            {reply.updatedAt && ' (đã chỉnh sửa)'}
                                                        </span>
                                                        <div className="reply-actions-header">
                                                            <button 
                                                                className="btn-edit"
                                                                onClick={() => handleEditReply(reply.id, reply.content)}
                                                            >
                                                                <FiEdit2 /> Chỉnh sửa
                                                            </button>
                                                            <button 
                                                                className="btn-delete-reply"
                                                                onClick={() => handleDeleteReply(reply.id)}
                                                                title="Xóa trả lời"
                                                            >
                                                                <FiTrash2 />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p className="reply-content">{reply.content}</p>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* New reply form */}
                            {showNewReplyForm[review.id] ? (
                                <div className="reply-form">
                                    <textarea
                                        placeholder="Nhập trả lời mới..."
                                        value={newReplyText[review.id] || ''}
                                        onChange={(e) => handleNewReplyChange(review.id, e.target.value)}
                                        rows="3"
                                    />
                                    <div className="reply-actions">
                                        <button 
                                            className="btn-reply"
                                            onClick={() => handleSubmitNewReply(review.id)}
                                        >
                                            Gửi trả lời
                                        </button>
                                        <button 
                                            className="btn-cancel"
                                            onClick={() => handleCancelNewReply(review.id)}
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button 
                                    className="btn-add-reply"
                                    onClick={() => handleShowNewReplyForm(review.id)}
                                >
                                    <FiPlus /> Thêm trả lời
                                </button>
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
