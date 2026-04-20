import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import '../../style/adminOrderPage.css'
import Pagination from "../common/Pagination";
import ApiService from "../../service/ApiService";

const AdminOrdersPage = () => {
    useDocumentTitle("Quản Lý Đơn Hàng");
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [searchStatus, setSearchStatus] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [error, setError] = useState(null);
    const itemsPerPage = 10;
    const navigate = useNavigate();

    const OrderStatus = ["PENDING", "CONFIRMED", "SHIPPED", "CANCELLED", "RETURNED"];

    useEffect(() => { fetchOrders(); }, [searchStatus, currentPage]);

    const fetchOrders = async () => {
        try {
            let response;
            if (searchStatus) {
                response = await ApiService.getAllOrderItemsByStatus(searchStatus);
            } else {
                response = await ApiService.getAllOrders();
            }
            const orderList = response.orderItemList || [];
            setTotalPages(Math.ceil(orderList.length / itemsPerPage));
            setOrders(orderList);
            setFilteredOrders(orderList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage));
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'Không thể tải đơn hàng');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleStatusChange = (e) => {
        setSearchStatus(e.target.value);
        setCurrentPage(1);
    };

    const handleOrderDetails = (id) => navigate(`/admin/order-details/${id}`);

    return (
        <div className="admin-orders-page">
            <h2>Quản lý đơn hàng</h2>
            {error && <p className="error-msg">{error}</p>}
            
            <div className="search-bar">
                <label>Tìm kiếm theo trạng thái:</label>
                <select value={searchStatus} onChange={handleStatusChange}>
                    <option value="">Tất cả</option>
                    {OrderStatus.map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>

            <table className="orders-table">
                <thead>
                    <tr>
                        <th>Mã đơn</th>
                        <th>Khách hàng</th>
                        <th>Trạng thái</th>
                        <th>Giá</th>
                        <th>Ngày đặt</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredOrders.map(order => (
                        <tr key={order.id}>
                            <td>{order.id}</td>
                            <td>{order.user?.name}</td>
                            <td>{order.status}</td>
                            <td>{order.price?.toLocaleString('vi-VN')}₫</td>
                            <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                            <td>
                                <button onClick={() => handleOrderDetails(order.id)}>Chi tiết</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {filteredOrders.length === 0 && (
                <p className="empty-msg">Không có đơn hàng nào</p>
            )}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)} />
        </div>
    );
};

export default AdminOrdersPage;