import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ApiService from '../../service/ApiService';
import { useCart } from '../context/CartContext';
import '../../style/securePayment.css';

const SecurePaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { dispatch } = useCart();
  const { orderId } = location.state || {};

  const [orderDetails, setOrderDetails] = useState(null);
  const [orderInfo, setOrderInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!orderId || !ApiService.isAuthenticated()) {
      navigate('/cart');
      return;
    }
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching order details for orderId:', orderId);
      
      // Use getMyOrder API which returns order with items
      const response = await ApiService.getMyOrder(orderId);
      
      console.log('API Response:', response);
      
      if (response && response.order) {
        console.log('Found order in response:', response.order);
        setOrderInfo(response.order);
        
        if (response.order.orderItemList) {
          console.log('Found orderItemList:', response.order.orderItemList);
          setOrderDetails(response.order.orderItemList);
        } else {
          console.log('No orderItemList in order');
          setOrderDetails([]);
        }
      } else if (response && response.orderItemList) {
        console.log('Found orderItemList in response:', response.orderItemList);
        setOrderDetails(response.orderItemList);
      } else {
        console.log('No order data found, using location state');
        // Fallback: use location state
        const items = location.state?.orderItems || [];
        setOrderDetails(items);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      console.log('Using location state as fallback');
      // Use location state as fallback
      const items = location.state?.orderItems || [];
      setOrderDetails(items);
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\s/g, '');
    if (value.length <= 16 && /^\d*$/.test(value)) {
      setCardData({ ...cardData, cardNumber: formatCardNumber(value) });
      setErrors({ ...errors, cardNumber: '' });
    }
  };

  const handleExpiryChange = (e) => {
    let inputType = e.nativeEvent.inputType;
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2 && inputType !== 'deleteContentBackward') {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    } else if (value.length > 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    setCardData({ ...cardData, expiryDate: value });
    setErrors({ ...errors, expiryDate: '' });
  };




  const handleCvvChange = (e) => {
    const value = e.target.value;
    if (value.length <= 3 && /^\d*$/.test(value)) {
      setCardData({ ...cardData, cvv: value });
      setErrors({ ...errors, cvv: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!cardData.cardNumber || cardData.cardNumber.replace(/\s/g, '').length !== 16) {
      newErrors.cardNumber = 'Số thẻ không hợp lệ';
    }
    
    if (!cardData.cardHolder || cardData.cardHolder.length < 3) {
      newErrors.cardHolder = 'Tên chủ thẻ không hợp lệ';
    }
    
    if (!cardData.expiryDate || cardData.expiryDate.length !== 5) {
      newErrors.expiryDate = 'Ngày hết hạn không hợp lệ';
    }
    
    if (!cardData.cvv || cardData.cvv.length !== 3) {
      newErrors.cvv = 'CVV không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    try {
      setProcessing(true);
      
      const paymentRequest = {
        orderId,
        amount: calculateTotal(),
        method: 'CREDIT_CARD',
        encryptedCardData: cardData.cardNumber.replace(/\s/g, '')
      };

      // Directly process payment without OTP
      const response = await ApiService.initializePayment(paymentRequest);
      
      if (response.status === 200) {
        // Clear cart after successful payment
        dispatch({ type: 'CLEAR_CART' });
        
        // Success - redirect to home with notification
        navigate('/', { 
          state: { 
            orderSuccess: {
              orderId,
              amount: calculateTotal(),
              paymentMethod: 'CREDIT_CARD'
            }
          } 
        });
      }
    } catch (error) {
      alert('Thanh toán thất bại: ' + (error.response?.data?.message || error.message));
    } finally {
      setProcessing(false);
    }
  };

  const calculateSubtotal = () => {
    if (!orderDetails || orderDetails.length === 0) return 0;
    return orderDetails.reduce((sum, item) => sum + item.price, 0);
  };

  const getDiscountAmount = () => {
    if (orderInfo && orderInfo.discountAmount) {
      console.log('Discount amount from orderInfo:', orderInfo.discountAmount);
      return orderInfo.discountAmount;
    }
    // Fallback to location state
    if (location.state?.discountAmount) {
      console.log('Discount amount from location.state:', location.state.discountAmount);
      return location.state.discountAmount;
    }
    console.log('No discount amount found');
    return 0;
  };

  const getDiscountCode = () => {
    if (orderInfo && orderInfo.discountCode) {
      console.log('Discount code from orderInfo:', orderInfo.discountCode);
      return orderInfo.discountCode;
    }
    // Fallback to location state
    if (location.state?.discountCode) {
      console.log('Discount code from location.state:', location.state.discountCode);
      return location.state.discountCode;
    }
    console.log('No discount code found');
    return null;
  };

  const calculateTotal = () => {
    // If we have orderInfo from API with totalPrice, use it
    if (orderInfo && orderInfo.totalPrice) {
      return orderInfo.totalPrice;
    }
    
    // Otherwise calculate from items minus discount plus shipping
    const subtotal = calculateSubtotal();
    const discount = getDiscountAmount();
    const shipping = 25000;
    return subtotal - discount + shipping;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">⏳</div>
        <p>Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  if (!orderDetails || orderDetails.length === 0) {
    return (
      <div className="loading-container">
        <div className="error-icon">⚠️</div>
        <h2>Không tìm thấy sản phẩm</h2>
        <p>Đơn hàng của bạn chưa có sản phẩm hoặc đã bị lỗi.</p>
        <button 
          className="btn-back"
          onClick={() => navigate('/cart')}
        >
          ← Quay lại giỏ hàng
        </button>
      </div>
    );
  }

  return (
    <div className="secure-payment-page">
      <h1 className="page-title">Thanh Toán Bảo Mật</h1>
      
      <div className="payment-layout">
        {/* Left Side - Payment Form */}
        <div className="payment-section">
          {/* Credit Card Display */}
          <div className="credit-card">
            <div className="card-chip"></div>
            <div className="card-logo">
              <div className="card-icon"></div>
            </div>
            <div className="card-number">
              {cardData.cardNumber || '•••• •••• •••• ••••'}
            </div>
            <div className="card-details">
              <div className="card-holder">
                <div className="card-label">CHỦ THẺ</div>
                <div className="card-value">
                  {cardData.cardHolder || 'TÊN CHỦ THẺ'}
                </div>
              </div>
              <div className="card-expiry">
                <div className="card-label">HẾT HẠN</div>
                <div className="card-value">
                  {cardData.expiryDate || 'MM/YY'}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="payment-form-section">
            <div className="form-header">
              <div className="form-icon">💳</div>
              <h2>Thông Tin Thẻ Thanh Toán</h2>
            </div>

            <div className="form-group">
              <label>Số Thẻ</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  placeholder="4111 1111 1111 1111"
                  value={cardData.cardNumber}
                  onChange={handleCardNumberChange}
                  className={errors.cardNumber ? 'error' : ''}
                />
                <span className="input-icon">💳</span>
              </div>
              {errors.cardNumber && <span className="error-text">{errors.cardNumber}</span>}
            </div>

            <div className="form-group">
              <label>Chủ Thẻ</label>
              <input
                type="text"
                placeholder="NGUYEN VAN A"
                value={cardData.cardHolder}
                onChange={(e) => {
                  setCardData({ ...cardData, cardHolder: e.target.value.toUpperCase() });
                  setErrors({ ...errors, cardHolder: '' });
                }}
                className={errors.cardHolder ? 'error' : ''}
              />
              {errors.cardHolder && <span className="error-text">{errors.cardHolder}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Ngày Hết Hạn</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={cardData.expiryDate}
                    onChange={handleExpiryChange}
                    className={errors.expiryDate ? 'error' : ''}
                  />
                </div>
                {errors.expiryDate && <span className="error-text">{errors.expiryDate}</span>}
              </div>

              <div className="form-group">
                <label>CVV</label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    placeholder="•••"
                    value={cardData.cvv}
                    onChange={handleCvvChange}
                    className={errors.cvv ? 'error' : ''}
                    maxLength="3"
                  />
                  <span className="input-icon">🔒</span>
                </div>
                {errors.cvv && <span className="error-text">{errors.cvv}</span>}
              </div>
            </div>

            <button 
              className="btn-payment"
              onClick={handlePayment}
              disabled={processing}
            >
              {processing ? ' Đang xử lý...' : ' Tiếp tục thanh toán →'}
            </button>

            <div className="security-badges">
              <div className="badge-item">
                <span className="badge-icon">🔒</span>
                <span>SSL Secured</span>
              </div>
              <div className="badge-item">
                <span className="badge-icon">🛡️</span>
                <span>PCI DSS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Order Summary */}
        <div className="summary-section">
          <div className="summary-header">
            <h3>Sản phẩm ({orderDetails?.length || 0})</h3>
          </div>

          <div className="payment-product-list">
            {orderDetails?.map((item, index) => (
              <div key={index} className="payment-product-item">
                <img 
                  src={item.product?.imageUrl || '/placeholder.png'} 
                  alt={item.product?.name}
                  className="product-image"
                />
                <div className="product-info">
                  <h4>{item.product?.name}</h4>
                  <p>Số lượng: {item.quantity}</p>
                </div>
                <div className="product-price">
                  {item.price?.toLocaleString()}đ
                </div>
              </div>
            ))}
          </div>

          <div className="summary-details">
            <div className="summary-row">
              <span>Tạm tính</span>
              <span>{calculateSubtotal().toLocaleString()}đ</span>
            </div>
            <div className="summary-row">
              <span>Phí vận chuyển</span>
              <span>25,000đ</span>
            </div>
            <div className="summary-total">
              <span>Tổng cộng</span>
              <span className="total-amount">{calculateTotal().toLocaleString()}đ</span>
            </div>
          </div>

          <div className="security-info">
            <div className="security-icon">✓</div>
            <div className="security-text">
              <h4>Cam kết bảo mật</h4>
              <p>Thông tin thanh toán của bạn được mã hóa và bảo vệ an toàn tuyệt đối.</p>
            </div>
          </div>

          <div className="payment-methods">
            <p>Phương thức thanh toán được hỗ trợ</p>
            <div className="method-icons">
              <div className="method-icon visa">VISA</div>
              <div className="method-icon mastercard">MC</div>
              <div className="method-icon amex">AMEX</div>
              <div className="method-icon atm">ATM</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurePaymentPage;
