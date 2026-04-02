import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import '../../style/adminProduct.css'
import Pagination from "../common/Pagination";
import ConfirmDialog from "../common/ConfirmDialog";
import ApiService from "../../service/ApiService";

const AdminDiscountPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [discounts, setDiscounts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [confirmState, setConfirmState] = useState({ show: false, id: null });
    const itemsPerPage = 10;

    // Hiển thị message từ navigate state
    useEffect(() => {
        if (location.state?.message) {
            setMessage(location.state.message);
            setTimeout(() => setMessage(null), 3000);
            // Clear state để không hiển thị lại khi refresh
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const fetchDiscounts = async() => {
        try {
            const response = await ApiService.getAllDiscounts();
            const discountList = response.discountList || [];
            setTotalPages(Math.ceil(discountList.length/itemsPerPage));
            setDiscounts(discountList.slice((currentPage -1) * itemsPerPage, currentPage * itemsPerPage));
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'Unable to fetch discounts')
        }
    }

    useEffect(()=>{
        fetchDiscounts();
    }, [currentPage]);

    const handleEdit = async (id) => {
        navigate(`/admin/edit-discount/${id}`)
    }

    const openDeleteDialog = (id) => {
        setConfirmState({ show: true, id });
    };

    const closeDeleteDialog = () => {
        setConfirmState({ show: false, id: null });
    };

    const handleDeleteConfirm = async () => {
        try {
            const response = await ApiService.deleteDiscount(confirmState.id);
            setMessage(response.message || 'Xóa mã giảm giá thành công');
            setError(null);
            fetchDiscounts();
            closeDeleteDialog();
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'Unable to delete discount');
            setTimeout(() => setError(null), 3000);
            closeDeleteDialog();
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    }

    const isActive = (discount) => {
        const now = new Date();
        const startDate = new Date(discount.startDate);
        const endDate = new Date(discount.endDate);
        return now >= startDate && now <= endDate && discount.isActive;
    }

    return(
        <div className="admin-product-list">
            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}

            <div>
                <h2>Mã Giảm Giá</h2>
                <button className="product-btn" onClick={()=> navigate('/admin/add-discount')}>Thêm Mã Giảm Giá</button>

                {discounts.length === 0 ? (
                    <p>Không tìm thấy mã giảm giá nào</p>
                ) : (
                    <div className="discount-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Mã</th>
                                    <th>Mô tả</th>
                                    <th>Loại</th>
                                    <th>Giá trị</th>
                                    <th>Đơn tối thiểu</th>
                                    <th>Giảm tối đa</th>
                                    <th>Lượt dùng</th>
                                    <th>Tự động cấp</th>
                                    <th>Ngày bắt đầu</th>
                                    <th>Ngày kết thúc</th>
                                    <th>Trạng thái</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {discounts.map((discount)=>(
                                    <tr key={discount.id}>
                                        <td><strong>{discount.code}</strong></td>
                                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {discount.description || '-'}
                                        </td>
                                        <td>{discount.discountType === 'PERCENTAGE' ? 'Phần trăm' : 'Số tiền cố định'}</td>
                                        <td>
                                            {discount.discountType === 'PERCENTAGE'
                                                ? `${discount.discountValue || 0}%`
                                                : `${(discount.discountValue || 0).toLocaleString()}đ`}
                                        </td>
                                        <td>
                                            {discount.minOrderAmount 
                                                ? `${discount.minOrderAmount.toLocaleString()}đ` 
                                                : '-'}
                                        </td>
                                        <td>
                                            {discount.maxDiscountAmount 
                                                ? `${discount.maxDiscountAmount.toLocaleString()}đ` 
                                                : '-'}
                                        </td>
                                        <td>
                                            {discount.currentUsage || 0}/{discount.usageLimit || 0}
                                        </td>
                                        <td>
                                            <span className={`status-badge ${discount.autoAssignNewUser ? 'active' : 'inactive'}`}>
                                                {discount.autoAssignNewUser ? 'Có' : 'Không'}
                                            </span>
                                        </td>
                                        <td>{formatDate(discount.startDate)}</td>
                                        <td>{formatDate(discount.endDate)}</td>
                                        <td>
                                            <span className={`status-badge ${isActive(discount) ? 'active' : 'inactive'}`}>
                                                {isActive(discount) ? 'Hoạt động' : 'Không hoạt động'}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="product-btn" onClick={()=> handleEdit(discount.id)}>Sửa</button>
                                            <button className="product-btn-delete" onClick={()=> openDeleteDialog(discount.id)}>Xóa</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <ConfirmDialog
                    show={confirmState.show}
                    title="Xác nhận xóa mã giảm giá"
                    message="Bạn có chắc chắn muốn xóa mã giảm giá này không?"
                    onConfirm={handleDeleteConfirm}
                    onCancel={closeDeleteDialog}
                />

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page)=> setCurrentPage(page)}
                />
            </div>
        </div>
    )
}

export default AdminDiscountPage;
