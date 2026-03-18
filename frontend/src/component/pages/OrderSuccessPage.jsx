import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../style/orderSuccess.css";

const OrderSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderSuccess = location.state?.orderSuccess;

  if (!orderSuccess) {
    return (
      <div className="order-success-page">
        <div className="order-success-card">
          <h2>Không tìm thấy thông tin đơn hàng</h2>
          <button onClick={() => navigate("/")}>Về trang chủ</button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-success-page">
      <div className="order-success-card">
        <div className="order-success-icon">✓</div>
        <h2>Thanh toán thành công!</h2>
        <p>Mã đơn hàng: <strong>#{orderSuccess.orderId}</strong></p>
        <p>Tổng thanh toán: <strong>{orderSuccess.amount?.toLocaleString()}đ</strong></p>
        <p className="order-success-note">Cảm ơn bạn đã tin tưởng và đặt hàng tại cửa hàng của chúng tôi. Đơn hàng của bạn đang được xử lý và sẽ sớm được giao đến tay bạn! </p>
        <div className="order-success-actions">
          <button onClick={() => navigate("/")}>Tiếp tục mua sắm</button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
