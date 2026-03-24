import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import "../../style/profile.css";

const ProfilePage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);
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
          "Unable to fetch user info"
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
                  {userInfo.address.city}
                </p>
                <p>
                  <strong>Quận/Huyện: </strong>
                  {userInfo.address.state}
                </p>
              </div>
            ) : (
              <p>Chưa có thông tin địa chỉ</p>
            )}
           <div className="profile-act">
            <button className="profile-button" onClick={handleAddressClick}>
              {userInfo.address ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ"}
            </button>

            {/* 🔥 NÚT MỚI */}
            <button
              className="profile-button"
              onClick={() => navigate("/my-orders")}
              style={{ marginTop: "10px" }}
            >
              Xem đơn hàng của tôi
            </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;