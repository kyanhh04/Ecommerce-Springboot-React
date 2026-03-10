import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../service/ApiService';

/**
 * Secure Payment Component
 * 3-step payment process with OTP verification
 */
const SecurePaymentComponent = ({ orderId, amount, token }) => {
  const [step, setStep] = useState(1); // 1: Initialize, 2: OTP, 3: Confirm
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Step 1: Initialize Payment
  const handleInitializePayment = async () => {
    try {
      setLoading(true);
      setError('');
      setMessage('');

      const paymentRequest = {
        orderId,
        amount,
        method: 'CREDIT_CARD',
        encryptedCardData: cardData.cardNumber
      };

      const response = await ApiService.initializePayment(paymentRequest);

      if (response.status === 200) {
        setMessage('✅ ' + response.message);
        setStep(2); // Move to OTP verification step
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError('❌ Lỗi: ' + errorMsg);
      console.error('Payment initialization failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async () => {
    try {
      if (otp.length !== 6) {
        setError('❌ OTP phải là 6 chữ số');
        return;
      }

      setLoading(true);
      setError('');
      setMessage('');

      const verifyRequest = {
        orderId,
        otpCode: otp
      };

      const response = await ApiService.verifyPaymentOTP(verifyRequest);

      if (response.status === 200) {
        setMessage('✅ ' + response.message);
        setStep(3); // Move to confirmation step
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError('❌ Lỗi: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Process Payment
  const handleProcessPayment = async () => {
    try {
      setLoading(true);
      setError('');
      setMessage('');

      const response = await ApiService.processPayment(orderId);

      if (response.status === 200) {
        setMessage('✅ ' + response.message);
        setStep(4); // Thanh toán hoàn tất

        // Tự động quay về trang Home với thông tin đơn hàng để hiển thị banner
        navigate('/', {
          state: {
            orderSuccess: {
              orderId,
              amount
            }
          }
        });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError('❌ Lỗi: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    setCardData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="secure-payment-container">
      <div className="payment-card">
        <h2>💳 Thanh Toán Bảo Mật</h2>
        <p>Đơn hàng: #{orderId} | Tổng: {amount}đ</p>

        {/* Messages */}
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {/* STEP 1: Card Input */}
        {step === 1 && (
          <div className="form-group">
            <h3>Thông Tin Thẻ Thanh Toán</h3>
            
            <div className="input-group">
              <label>Số Thẻ</label>
              <input
                type="text"
                name="cardNumber"
                placeholder="4111 1111 1111 1111"
                value={cardData.cardNumber}
                onChange={handleCardInputChange}
                maxLength="19"
                disabled={loading}
              />
            </div>

            <div className="input-group">
              <label>Chủ Thẻ</label>
              <input
                type="text"
                name="cardHolder"
                placeholder="JOHN DOE"
                value={cardData.cardHolder}
                onChange={handleCardInputChange}
                disabled={loading}
              />
            </div>

            <div className="input-row">
              <div className="input-group">
                <label>Ngày Hết Hạn</label>
                <input
                  type="text"
                  name="expiryDate"
                  placeholder="MM/YY"
                  value={cardData.expiryDate}
                  onChange={handleCardInputChange}
                  maxLength="5"
                  disabled={loading}
                />
              </div>
              <div className="input-group">
                <label>CVV</label>
                <input
                  type="password"
                  name="cvv"
                  placeholder="***"
                  value={cardData.cvv}
                  onChange={handleCardInputChange}
                  maxLength="4"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleInitializePayment}
              disabled={
                loading ||
                !cardData.cardNumber ||
                !cardData.cardHolder ||
                !cardData.expiryDate ||
                !cardData.cvv
              }
            >
              {loading ? '⏳ Đang xử lý...' : '➡️ Tiếp tục'}
            </button>
          </div>
        )}

        {/* STEP 2: OTP Verification */}
        {step === 2 && (
          <div className="form-group">
            <h3>🔐 Xác Minh OTP</h3>
            <p>Mã OTP 6 chữ số đã được gửi đến email của bạn</p>

            <div className="input-group">
              <label>Nhập Mã OTP</label>
              <input
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                maxLength="6"
                disabled={loading}
                autoFocus
                className="otp-input"
              />
            </div>

            <div className="button-group">
              <button
                className="btn btn-secondary"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                ← Quay Lại
              </button>
              <button
                className="btn btn-primary"
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
              >
                {loading ? '⏳ Đang xác minh...' : '✓ Xác Minh'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Confirmation */}
        {step === 3 && (
          <div className="form-group">
            <h3>✅ Xác Nhận Thanh Toán</h3>
            
            <div className="summary">
              <div className="summary-item">
                <span>Đơn Hàng:</span>
                <strong>#{orderId}</strong>
              </div>
              <div className="summary-item">
                <span>Số Tiền:</span>
                <strong>{amount.toLocaleString()}đ</strong>
              </div>
              <div className="summary-item">
                <span>Phương Thức:</span>
                <strong>💳 Thẻ Tín Dụng</strong>
              </div>
              <div className="summary-item">
                <span>Thẻ:</span>
                <strong>****{cardData.cardNumber.slice(-4)}</strong>
              </div>
            </div>

            <div className="warning">
              ⚠️ Tiền sẽ được tính từ tài khoản ngân hàng của bạn
            </div>

            <div className="button-group">
              <button
                className="btn btn-secondary"
                onClick={() => setStep(2)}
                disabled={loading}
              >
                ← Quay Lại
              </button>
              <button
                className="btn btn-danger"
                onClick={handleProcessPayment}
                disabled={loading}
              >
                {loading ? '⏳ Đang xử lý...' : '💰 Thanh Toán Ngay'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Success */}
        {step === 4 && (
          <div className="success-container">
            <div className="success-icon">✓</div>
            <h3>Thanh Toán Thành Công!</h3>
            <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>
            <p className="order-number">Đơn hàng: #{orderId}</p>
            <button
              className="btn btn-primary"
              onClick={() =>
                navigate('/', {
                  state: {
                    orderSuccess: {
                      orderId,
                      amount
                    }
                  }
                })
              }
            >
              Về trang chủ
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .secure-payment-container {
          max-width: 500px;
          margin: 20px auto;
        }

        .payment-card {
          background: white;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        h2 {
          margin-top: 0;
          color: #333;
        }

        .alert {
          padding: 12px;
          border-radius: 5px;
          margin-bottom: 15px;
          font-size: 14px;
        }

        .alert-success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .alert-error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .input-group {
          margin-bottom: 15px;
        }

        label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          color: #333;
        }

        input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 14px;
          box-sizing: border-box;
          transition: border-color 0.3s;
        }

        input:focus {
          outline: none;
          border-color: #4CAF50;
          box-shadow: 0 0 5px rgba(76, 175, 80, 0.3);
        }

        input:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }

        .input-row {
          display: flex;
          gap: 15px;
        }

        .input-row .input-group {
          flex: 1;
        }

        .otp-input {
          text-align: center;
          font-size: 24px;
          letter-spacing: 10px;
          font-weight: bold;
        }

        .button-group {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }

        button {
          flex: 1;
          padding: 12px;
          border: none;
          border-radius: 5px;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-primary {
          background: #4CAF50;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #45a049;
        }

        .btn-secondary {
          background: #f0f0f0;
          color: #333;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #e0e0e0;
        }

        .btn-danger {
          background: #f44336;
          color: white;
        }

        .btn-danger:hover:not(:disabled) {
          background: #da190b;
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .summary {
          background: #f9f9f9;
          padding: 15px;
          border-radius: 5px;
          margin: 15px 0;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }

        .summary-item:last-child {
          border-bottom: none;
        }

        .warning {
          background: #fff3cd;
          padding: 10px;
          border-radius: 5px;
          color: #856404;
          font-size: 13px;
          margin: 15px 0;
        }

        .success-container {
          text-align: center;
          padding: 30px 0;
        }

        .success-icon {
          font-size: 60px;
          color: #4CAF50;
          margin-bottom: 15px;
        }

        .success-container h3 {
          color: #4CAF50;
          margin: 10px 0;
        }

        .order-number {
          font-size: 12px;
          color: #999;
        }
      `}</style>
    </div>
  );
};

export default SecurePaymentComponent;
