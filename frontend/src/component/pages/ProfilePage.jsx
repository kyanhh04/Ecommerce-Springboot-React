import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import Toast from "../common/Toast";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import "../../style/profile.css";

const ProfilePage = () => {
  useDocumentTitle("Tài Khoản");
  
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: ""
  });
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await ApiService.getLoggedInUserInfo();
      setUserInfo(response.user);
      setFormData({
        name: response.user.name || "",
        email: response.user.email || "",
        phoneNumber: response.user.phoneNumber || ""
      });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to fetch user info"
      );
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setFormData({
        name: userInfo.name || "",
        email: userInfo.email || "",
        phoneNumber: userInfo.phoneNumber || ""
      });
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber
      };

      const response = await ApiService.updateUser(updateData);
      
      if (response.status === 200) {
        setToast({ message: "Cập nhật thông tin thành công!", type: "success" });
        setIsEditing(false);
        fetchUserInfo();
      } else {
        setToast({ message: response.message || "Cập nhật thất bại", type: "error" });
      }
    } catch (error) {
      setToast({
        message: error.response?.data?.message || error.message || "Lỗi khi cập nhật thông tin",
        type: "error"
      });
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
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <h2>Xin chào, {userInfo.name}</h2>

      {error ? (
        <p className="error-message">{error}</p>
      ) : (
        <div>
          <div className="user-details">
            {!isEditing ? (
              <>
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
                <div className="profile-act">
                  <button className="profile-button" onClick={handleEditToggle}>
                    Chỉnh sửa thông tin
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleUpdateProfile} className="profile-edit-form">
                <div className="form-group">
                  <label>Họ tên:</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Số điện thoại:</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="profile-act">
                  <button type="submit" className="profile-button">
                    Lưu thay đổi
                  </button>
                  <button
                    type="button"
                    className="profile-button-cancel"
                    onClick={handleEditToggle}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            )}

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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;