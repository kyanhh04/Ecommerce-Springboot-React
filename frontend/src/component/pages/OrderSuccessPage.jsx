import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../style/orderSuccess.css";
import ApiService from "../../service/ApiService";

const OrderSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderSuccess = location.state?.orderSuccess;
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderSuccess?.orderId) return;
      try {
        const response = await ApiService.getMyOrder(orderSuccess.orderId);
        if (response.status === 200 && response.order) {
          setOrder(response.order);
        } else {
          setError(response.message || "Không thể tải chi tiết đơn hàng");
        }
      } catch (e) {
        setError(
          e.response?.data?.message ||
          e.message ||
          "Không thể tải chi tiết đơn hàng"
        );
      }
    };

    fetchOrder();
  }, [orderSuccess]);

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
        <p>Tổng thanh toán: <strong>{orderSuccess.amount.toLocaleString()}đ</strong></p>

        {error && (
          <p className="order-success-note error">
            {error}
          </p>
        )}

        {order && order.orderItemList && (
          <div className="order-items-summary">
            <h3>Chi tiết sản phẩm</h3>
            {order.orderItemList.map((item) => (
              <div key={item.id} className="order-item-row">
                <div className="order-item-main">
                  <div className="order-item-name">{item.product.name}</div>
                  <div className="order-item-meta">
                    Số lượng: x{item.quantity} · Đơn giá:{" "}
                    {item.product.price.toLocaleString()}đ
                  </div>
                </div>
                <div className="order-item-total">
                  {(item.price).toLocaleString()}đ
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="order-success-actions">
          <button onClick={() => navigate("/")}>Tiếp tục mua sắm</button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;

