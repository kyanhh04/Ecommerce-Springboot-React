import React, { useEffect, useState } from "react";
import ApiService from "../../service/ApiService";
import Pagination from "../common/Pagination";
import { useNavigate } from "react-router-dom";
import "../../style/myOrder.css";

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [activeTab, setActiveTab] = useState("ALL");
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

  const getStatusText = (status) => {
    switch (status) {
      case "PENDING":
        return "Chờ xác nhận";
      case "CONFIRMED":
        return "Chờ vận chuyển";
      case "SHIPPED":
        return "Đã vận chuyển";
      case "CANCELLED":
        return "Đã hủy";
      case "RETURNED":
        return "Đã trả hàng";
      default:
        return status;
    }
  };

  const filterOrders = () => {
    switch (activeTab) {
      case "ALL":
        return orders;
      case "PENDING":
        return orders.filter(order => order.status === "PENDING");
      case "CONFIRMED":
        return orders.filter(order => order.status === "CONFIRMED");
      case "REVIEW":
        return orders.filter(order => order.status === "SHIPPED");
      case "RETURN":
        return orders.filter(order => order.status === "RETURNED");
      default:
        return orders;
    }
  };

  const filteredOrders = filterOrders();
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  return (
    <div className="profile-page">
      <h2>Đơn hàng của tôi</h2>

      {/* Tab Navigation */}
      <div className="order-tabs">
        <button
          className={`order-tab ${activeTab === "ALL" ? "active" : ""}`}
          onClick={() => handleTabChange("ALL")}
        >
          Tất cả
        </button>
        <button
          className={`order-tab ${activeTab === "PENDING" ? "active" : ""}`}
          onClick={() => handleTabChange("PENDING")}
        >
          Chờ xác nhận
        </button>
        <button
          className={`order-tab ${activeTab === "CONFIRMED" ? "active" : ""}`}
          onClick={() => handleTabChange("CONFIRMED")}
        >
          Chờ vận chuyển
        </button>
        <button
          className={`order-tab ${activeTab === "REVIEW" ? "active" : ""}`}
          onClick={() => handleTabChange("REVIEW")}
        >
          Đánh giá
        </button>
        <button
          className={`order-tab ${activeTab === "RETURN" ? "active" : ""}`}
          onClick={() => handleTabChange("RETURN")}
        >
          Trả hàng
        </button>
      </div>

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

            {/* 🔥 CHI TIẾT SẢN PHẨM */}
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

            {/* 🔥 BUTTON */}
            <div className="order-actions">
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