import React, { useEffect, useState } from "react";
import ApiService from "../../service/ApiService";
import Pagination from "../common/Pagination";
import { useNavigate } from "react-router-dom";
import "../../style/myOrder.css";

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ApiService.getLoggedInUserInfo();
      setOrders(response.user.orderList || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to fetch orders"
      );
    }
  };

  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const paginatedOrders = orders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleDetails = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const getStatusText = (status) => {
    switch (status) {
      case "COMPLETED":
        return "Hoàn thành";
      case "PENDING":
        return "Đang xử lý";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  return (
    <div className="profile-page">
      <h2>Đơn hàng của tôi</h2>

      {error && <p className="error-message">{error}</p>}

      <ul className="main-order-list">
        {paginatedOrders.map((order) => (
          <li key={order.id} className="order-card">

            {/* 🔥 DÒNG INFO */}
            <div className="order-row">
              <span>
                Ngày: {new Date(order.createdAt).toLocaleDateString("vi-VN")}
              </span>

              <span className="order-price">
                Tổng tiền: {order.totalPrice?.toLocaleString("vi-VN")}đ
              </span>

              <span className={`order-status ${order.status}`}>
                Trạng thái: {getStatusText(order.status || "PENDING")}
              </span>
            </div>

            {/* 🔥 BUTTON */}
            <div className="order-actions">
              <button
                className="order-btn"
                onClick={() => toggleDetails(order.id)}
              >
                {expandedOrderId === order.id
                  ? "Ẩn chi tiết"
                  : "Xem chi tiết"}
              </button>

              <button
                className="review-btn"
                onClick={() =>
                  navigate(
                    `/product/${order.orderItemList?.[0]?.product?.id}`
                  )
                }
              >
                Đánh giá
              </button>
            </div>

            {/* 🔥 CHI TIẾT */}
            {expandedOrderId === order.id && (
              <ul className="order-items-list">
                {order.orderItemList?.map((item) => (
                  <li key={item.id} className="order-item">
                    <img
                      src={item.product?.imageUrl}
                      alt={item.product?.name}
                    />

                    <div className="order-item-info">
                      <p><strong>{item.product?.name}</strong></p>
                      <p>Số lượng: {item.quantity}</p>
                      <p>Giá: {item.price?.toLocaleString("vi-VN")}đ</p>
                    </div>

                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
};

export default MyOrdersPage;