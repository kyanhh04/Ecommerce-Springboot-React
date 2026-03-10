import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../style/paymentDemo.css';

/**
 * Payment Demo Component
 * Để test giao diện thanh toán mà không cần đăng nhập
 */
const PaymentDemo = () => {
  const navigate = useNavigate();

  const demoOrderItems = [
    {
      id: 1,
      product: {
        name: 'Áo thun cao cấp',
        imageUrl: 'https://via.placeholder.com/100'
      },
      quantity: 2,
      price: 599000
    },
    {
      id: 2,
      product: {
        name: 'Quần jeans slim fit',
        imageUrl: 'https://via.placeholder.com/100'
      },
      quantity: 1,
      price: 899000
    },
    {
      id: 3,
      product: {
        name: 'Ví da thật',
        imageUrl: 'https://via.placeholder.com/100'
      },
      quantity: 1,
      price: 499000
    }
  ];

  const handleGoToPayment = () => {
    // Tạm thời set token để bypass authentication check
    localStorage.setItem('token', 'demo-token');
    
    navigate('/payment', {
      state: {
        orderId: 'DEMO-12345',
        orderItems: demoOrderItems,
        totalPrice: 2596000,
        discountCode: 'SUMMER2024',
        discountAmount: 200000
      }
    });
  };

  return (
    <div className="payment-demo-container">
      <div className="demo-card">
        <h1>🎨 Demo Giao Diện Thanh Toán</h1>
        <p>Click vào nút bên dưới để xem giao diện thanh toán bảo mật</p>
        
        <div className="demo-order-preview">
          <h3>Đơn hàng mẫu:</h3>
          <ul>
            {demoOrderItems.map(item => (
              <li key={item.id}>
                {item.product.name} x{item.quantity} - {(item.price * item.quantity).toLocaleString()}đ
              </li>
            ))}
          </ul>
          <div className="demo-discount">
            <span>Mã giảm giá: SUMMER2024</span>
            <span className="discount-value">-200.000đ</span>
          </div>
          <div className="demo-total">
            <strong>Tổng cộng: 2.396.000đ</strong>
          </div>
        </div>

        <button className="btn-demo" onClick={handleGoToPayment}>
          🚀 Xem Giao Diện Thanh Toán
        </button>

        <div className="demo-note">
          <p>💡 Lưu ý: Đây là chế độ demo, không thực hiện thanh toán thật</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentDemo;
