import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import "../../style/orderDetail.css";

const OrderDetailPage = () => {
  useDocumentTitle("Chi Tiết Đơn Hàng");
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    ApiService.getMyOrder(orderId)
      .then((res) => {
        if (res.order) setOrder(res.order);
        else setError(res.message || "Không thể tải đơn hàng");
      })
      .catch((e) => setError(e.response?.data?.message || e.message));
  }, [orderId]);

  if (error) return <div className="order-detail-page"><p className="error">{error}</p></div>;
  if (!order) return <div className="order-detail-page"><p>Đang tải...</p></div>;

  return (
    <div className="order-detail-page">
      <button className="btn-back" onClick={() => navigate(-1)}>← Quay lại</button>

      <h2>Chi tiết đơn hàng #{order.id}</h2>
      <p className="order-date">Ngày đặt: {new Date(order.createdAt).toLocaleDateString("vi-VN")}</p>

      <div className="order-items-list">
        {order.orderItemList?.map((item) => (
          <div key={item.id} className="order-item-card">
            <img src={item.product?.imageUrl || "/placeholder.png"} alt={item.product?.name} />
            <div className="item-info">
              <h4>{item.product?.name}</h4>
              <p>Số lượng: {item.quantity}</p>
              <p>Trạng thái: <span className={`status ${item.status?.toLowerCase()}`}>{item.status}</span></p>
            </div>
            <div className="item-price">{item.price?.toLocaleString()}đ</div>
          </div>
        ))}
      </div>

      <div className="order-summary">
        {order.discountCode && (
          <div className="summary-row">
            <span>Mã giảm giá ({order.discountCode})</span>
            <span>-{order.discountAmount?.toLocaleString()}đ</span>
          </div>
        )}
        <div className="summary-total">
          <span>Tổng cộng</span>
          <span>{order.totalPrice?.toLocaleString()}đ</span>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
