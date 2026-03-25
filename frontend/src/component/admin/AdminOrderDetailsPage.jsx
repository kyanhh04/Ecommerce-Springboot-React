import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import '../../style/adminOrderDetails.css'
import ApiService from "../../service/ApiService";

const OrderStatus = ["PENDING", "CONFIRMED", "SHIPPED", "CANCELLED", "RETURNED"];

const AdminOrderDetailsPage = () => {
    const { itemId } = useParams();
    const navigate = useNavigate();
    const [orderItems, setOrderItems] = useState([]);
    const [message, setMessage] = useState('');
    const [selectedStatus, setSelectedStatus] = useState({});

    useEffect(() => { fetchOrderDetails(itemId); }, [itemId]);

    const fetchOrderDetails = async (itemId) => {
        try {
            const response = await ApiService.getOrderItemById(itemId);
            setOrderItems(response.orderItemList);
        } catch (error) {
            console.log(error.message || error);
        }
    };

    const handleStatusChange = (orderItemId, newStatus) => {
        setSelectedStatus({ ...selectedStatus, [orderItemId]: newStatus });
    };

    const handleSubmitStatusChange = async (orderItemId) => {
        const newStatus = selectedStatus[orderItemId] || orderItems.find(o => o.id === orderItemId)?.status;
        if (!newStatus) {
            setMessage('Vui lòng chọn trạng thái');
            return;
        }
        try {
            await ApiService.updateOrderitemStatus(orderItemId, newStatus);
            setMessage('Cập nhật trạng thái thành công');
            setTimeout(() => setMessage(''), 3000);
            fetchOrderDetails(itemId); // Reload data
        } catch (error) {
            setMessage(error.response?.data?.message || error.message || 'Không thể cập nhật trạng thái');
        }
    };

    return (
        <div className="order-details-page">
            <button type="button" className="back-btn" onClick={() => navigate('/admin/orders')}>← Quay lại</button>
            <h2>Chi tiết đơn hàng</h2>
            {message && <div className="message">{message}</div>}

            {orderItems.length ? orderItems.map((orderItem) => (
                <div key={orderItem.id} className="order-item-details">

                    {/* Row 1: 3 info cards — sản phẩm | đơn hàng | khách hàng */}
                    <div className="details-grid">
                        <div className="info-card">
                            <h3>Thông tin sản phẩm</h3>
                            {orderItem.product?.imageUrl && (
                                <img src={orderItem.product.imageUrl} alt={orderItem.product.name} />
                            )}
                            <p><span>Tên:</span>{orderItem.product?.name}</p>
                            <p><span>Mô tả:</span>{orderItem.product?.description}</p>
                            <p><span>Giá:</span>{orderItem.product?.price?.toLocaleString('vi-VN')}₫</p>
                        </div>

                        <div className="info-card">
                            <h3>Thông tin đơn hàng</h3>
                            <p><span>Mã đơn:</span>{orderItem.id}</p>
                            <p><span>Số lượng:</span>{orderItem.quantity}</p>
                            <p><span>Tổng tiền:</span>{orderItem.price?.toLocaleString('vi-VN')}₫</p>
                            <p><span>Trạng thái:</span>
                                <span className={`status-badge status-${orderItem.status?.toLowerCase()}`}>
                                    {orderItem.status}
                                </span>
                            </p>
                            <p><span>Ngày đặt:</span>{new Date(orderItem.createdAt).toLocaleDateString('vi-VN')}</p>
                        </div>

                        <div className="info-card">
                            <h3>Thông tin khách hàng</h3>
                            <p><span>Tên:</span>{orderItem.user?.name}</p>
                            <p><span>Email:</span>{orderItem.user?.email}</p>
                            <p><span>SĐT:</span>{orderItem.user?.phoneNumber}</p>
                            <p><span>Quận/Huyện:</span>{orderItem.user?.address?.state}</p>
                            <p><span>Thành phố:</span>{orderItem.user?.address?.city}</p>
                            <p><span>Đường:</span>{orderItem.user?.address?.street}</p>
                        </div>
                    </div>

                    {/* Row 2: status change */}
                    <div className="status-change">
                        <h4>Cập nhật trạng thái</h4>
                        <select
                            className="status-option"
                            value={selectedStatus[orderItem.id] || orderItem.status}
                            onChange={(e) => handleStatusChange(orderItem.id, e.target.value)}
                        >
                            {OrderStatus.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button className="update-status-button" onClick={() => handleSubmitStatusChange(orderItem.id)}>
                            Cập nhật
                        </button>
                    </div>

                </div>
            )) : (
                <p className="loading-text">Đang tải chi tiết đơn hàng...</p>
            )}
        </div>
    );
};

export default AdminOrderDetailsPage;
