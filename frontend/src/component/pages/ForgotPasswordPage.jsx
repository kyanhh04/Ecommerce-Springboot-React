import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import "../../style/register.css";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Gửi OTP
      const response = await ApiService.sendForgotPasswordOTP(email);
      
      if (response.status === 200) {
        setMessage("Đã gửi mã OTP đến email của bạn");
        setIsError(false);
        
        setTimeout(() => {
          navigate("/forgot-password/otp", { state: { email } });
        }, 800);
      } else {
        setMessage(response.message || "Không thể gửi mã OTP");
        setIsError(true);
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Không thể gửi email khôi phục. Vui lòng thử lại.");
      setIsError(true);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="register-page">
        <form onSubmit={handleSubmit}>
          <div className="back-button-container">
            <button
              type="button"
              className="back-button"
              onClick={() => navigate("/login")}
            >
              ← Quay lại
            </button>
          </div>

          <h2>Quên mật khẩu</h2>
          <p className="forgot-description">
            Nhập email của bạn để nhận mã OTP khôi phục mật khẩu
          </p>
          
          {message && <p className={`message ${isError ? 'error' : ''}`}>{message}</p>}
          
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập email của bạn"
            required
          />

          <button type="submit">Gửi mã OTP</button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
