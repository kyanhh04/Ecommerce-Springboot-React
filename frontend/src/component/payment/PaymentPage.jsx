import React, { useState } from 'react';
import SecurePaymentComponent from './SecurePaymentComponent';

/**
 * Payment Page - Trang Thanh Toán
 * Integration point cho Secure Payment Component
 */
const PaymentPage = () => {
  const [order, setOrder] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  React.useEffect(() => {
    // Giả sử lấy order ID từ URL params
    const orderId = new URLSearchParams(window.location.search).get('orderId');
    
    if (!orderId) {
      setError('❌ Không tìm thấy đơn hàng');
      setLoading(false);
      return;
    }

    // Fetch order details từ API
    fetchOrderDetails(orderId);
  }, []);

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      } else {
        setError('❌ Không thể tải thông tin đơn hàng');
      }
    } catch (err) {
      setError(`❌ Lỗi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="payment-page">
        <div className="alert alert-error">
          ❌ Vui lòng đăng nhập để thanh toán
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="payment-page">
        <div className="loading">⏳ Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-page">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="payment-page">
        <div className="alert alert-error">❌ Không tìm thấy đơn hàng</div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="page-header">
        <h1>Thanh Toán Đơn Hàng</h1>
        <p>Đơn hàng: #{order.id}</p>
      </div>

      <div className="payment-layout">
        <div className="order-summary">
          <h2>Thông Tin Đơn Hàng</h2>
          <div className="order-items">
            {order.orderItems && order.orderItems.map(item => (
              <div key={item.id} className="order-item">
                <div className="item-info">
                  <span className="item-name">{item.product.name}</span>
                  <span className="item-quantity">x{item.quantity}</span>
                </div>
                <span className="item-price">
                  {(item.price * item.quantity).toLocaleString()}đ
                </span>
              </div>
            ))}
          </div>

          <div className="order-totals">
            <div className="total-row">
              <span>Tạm tính:</span>
              <span>{order.totalPrice?.toLocaleString() || 0}đ</span>
            </div>
            <div className="total-row">
              <span>Phí vận chuyển:</span>
              <span>0đ</span>
            </div>
            <div className="total-row discount">
              <span>Giảm giá:</span>
              <span>0đ</span>
            </div>
            <div className="total-row final">
              <span>Tổng cộng:</span>
              <strong>{order.totalPrice?.toLocaleString() || 0}đ</strong>
            </div>
          </div>
        </div>

        <div className="payment-form">
          <SecurePaymentComponent
            orderId={order.id}
            amount={order.totalPrice}
            token={token}
          />
        </div>
      </div>

      <style jsx>{`
        .payment-page {
          background: #f5f5f5;
          min-height: 100vh;
          padding: 20px;
        }

        .page-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .page-header h1 {
          color: #333;
          margin: 0 0 10px 0;
        }

        .page-header p {
          color: #666;
          margin: 0;
        }

        .payment-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .order-summary {
          background: white;
          padding: 25px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .order-summary h2 {
          margin-top: 0;
          color: #333;
          font-size: 18px;
          margin-bottom: 20px;
        }

        .order-items {
          margin-bottom: 20px;
          max-height: 300px;
          overflow-y: auto;
        }

        .order-item {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #eee;
        }

        .order-item:last-child {
          border-bottom: none;
        }

        .item-info {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .item-name {
          font-weight: 500;
          color: #333;
        }

        .item-quantity {
          font-size: 12px;
          color: #999;
        }

        .item-price {
          font-weight: 600;
          color: #f44336;
        }

        .order-totals {
          background: #f9f9f9;
          padding: 15px;
          border-radius: 5px;
          margin-top: 20px;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
          color: #666;
        }

        .total-row.discount span:last-child {
          color: #4CAF50;
        }

        .total-row.final {
          border-top: 2px solid #ddd;
          padding-top: 12px;
          margin-top: 12px;
          font-size: 16px;
          color: #333;
        }

        .total-row.final strong {
          color: #f44336;
          font-size: 18px;
        }

        .payment-form {
          position: sticky;
          top: 20px;
        }

        .alert {
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }

        .alert-error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .loading {
          text-align: center;
          padding: 40px;
          background: white;
          border-radius: 10px;
          color: #666;
        }

        @media (max-width: 768px) {
          .payment-layout {
            grid-template-columns: 1fr;
          }

          .payment-form {
            position: static;
          }
        }
      `}</style>
    </div>
  );
};

export default PaymentPage;
