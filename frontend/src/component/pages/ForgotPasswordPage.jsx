import React, { useState } from "react";
import "../../style/register.css";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Placeholder for forgot password logic
    try {
      // TODO: Implement forgot password API call
      setMessage("Đã gửi email khôi phục mật khẩu. Vui lòng kiểm tra hộp thư của bạn.");
      setIsError(false);
    } catch (error) {
      setMessage("Không thể gửi email khôi phục. Vui lòng thử lại.");
      setIsError(true);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="register-page">
        <form onSubmit={handleSubmit}>
          <h2>Quên mật khẩu</h2>
          <p className="forgot-description">
            Nhập email của bạn để nhận liên kết khôi phục mật khẩu
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

          <button type="submit">Gửi email khôi phục</button>
          
          <p className="register-link">
            Nhớ mật khẩu? <a href="/login">Đăng nhập</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
