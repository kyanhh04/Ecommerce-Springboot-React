import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import "../../style/profile.css";
import Pagination from "../common/Pagination";

const ProfilePage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await ApiService.getLoggedInUserInfo();
      setUserInfo(response.user);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to fetch user info",
      );
    }
  };

  if (!userInfo) {
    return (
      <div className="profile-page">
        <p>Loading...</p>
      </div>
    );
  }

  const handleAddressClick = () => {
    navigate(userInfo.address ? "/edit-address" : "/add-address");
  };

  const orderList = userInfo.orderList || [];
  const totalPages = Math.ceil(orderList.length / itemsPerPage);
  const paginatedOrders = orderList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="profile-page">
      <h2>Xin chào, {userInfo.name}</h2>

      {error ? (
        <p className="error-message">{error}</p>
      ) : (
        <div>
          <div className="user-details">
            <p>
              <strong>Họ tên: </strong>
              {userInfo.name}
            </p>
            <p>
              <strong>Email: </strong>
              {userInfo.email}
            </p>
            <p>
              <strong>Số điện thoại: </strong>
              {userInfo.phoneNumber}
            </p>

            <h3>Địa chỉ nhận hàng</h3>
            {userInfo.address ? (
              <div>
                <p>
                  <strong>Đường: </strong>
                  {userInfo.address.street}
                </p>
                <p>
                  <strong>Thành phố: </strong>
                  {userInfo.address.city}, {userInfo.address.state}
                </p>
                <p>
                  <strong>Quốc gia: </strong>
                  {userInfo.address.country}
                </p>
              </div>
            ) : (
              <p>Chưa có thông tin địa chỉ</p>
            )}
            <button className="profile-button" onClick={handleAddressClick}>
              {userInfo.address ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ"}
            </button>
          </div>

          <h3>Lịch sử đơn hàng</h3>
          <ul className="main-order-list">
            {paginatedOrders.map((order) => (
              <li key={order.id} className="order-card">
                {/* Thông tin chung của đơn hàng (Nằm trên) */}
                <div className="order-header">
                  <p>
                    <strong>Ngày đặt:</strong>{" "}
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                  <p>
                    <strong>Tổng thanh toán: </strong>
                    <span style={{ color: "#f68b1e", fontWeight: "bold" }}>
                      {order.totalPrice?.toLocaleString()}đ
                    </span>
                  </p>
                  {order.discountCode && (
                    <p>
                      <strong>Ưu đãi: </strong>
                      {order.discountCode} (-{order.discountAmount?.toLocaleString()}đ)
                    </p>
                  )}
                </div>

                {/* Danh sách sản phẩm trong đơn (Nằm dưới) */}
                <ul className="order-items-list">
                  {order.orderItemList?.map((item) => (
                    <li key={item.id} className="order-item">
                      <img
                        src={item.product?.imageUrl}
                        alt={item.product?.name}
                      />
                      <div className="order-item-info">
                        <p>
                          <strong>Sản phẩm: </strong>
                          {item.product?.name}
                        </p>
                        <p>
                          <strong>Trạng thái: </strong>
                          {item.status}
                        </p>
                        <p>
                          <strong>Số lượng: </strong>
                          {item.quantity}
                        </p>
                        <p>
                          <strong>Giá: </strong>
                          {item.price?.toLocaleString()}đ
                        </p>
                      </div>

                      {/* Nút đánh giá */}
                      <div className="order-item-action">
                        <button
                          className="review-btn"
                          onClick={() => navigate(`/product/${item.product?.id}`)}
                        >
                          Đánh giá
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}
    </div>
  );
};

export default ProfilePage;