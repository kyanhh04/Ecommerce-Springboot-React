import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ApiService from "../../service/ApiService";
import "../../style/register.css";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const otpCode = location.state?.otpCode;

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Regex for password validation
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  // Redirect nếu không có email hoặc otpCode
  React.useEffect(() => {
    if (!email || !otpCode) {
      navigate("/forgot-password");
    }
  }, [email, otpCode, navigate]);

  const validateField = (name, value) => {
    let error = "";

    if (name === "password") {
      if (!value) {
        error = "Mật khẩu không được để trống";
      } else if (!passwordRegex.test(value)) {
        error = "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt";
      }
    }

    if (name === "confirmPassword") {
      if (!value) {
        error = "Vui lòng xác nhận mật khẩu";
      } else if (value !== formData.password) {
        error = "Mật khẩu xác nhận không khớp";
      }
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear errors when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Show first error message
      const firstError = Object.values(newErrors)[0];
      setMessage(firstError);
      setIsError(true);
      setTimeout(() => {
        setMessage(null);
        setErrors({});
      }, 3000);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await ApiService.resetPassword(email, formData.password, otpCode);

      if (response.status === 200) {
        setMessage("Đặt lại mật khẩu thành công!");
        setIsError(false);
        
        setTimeout(() => {
          // Clear history và navigate về login
          window.history.replaceState(null, '', '/login');
          navigate("/login", { replace: true, state: { fromResetPassword: true } });
        }, 800);
      } else {
        setMessage(response.message || "Không thể đặt lại mật khẩu");
        setIsError(true);
        setTimeout(() => setMessage(null), 3000);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setMessage(
        error.response?.data?.message ||
          error.message ||
          "Không thể đặt lại mật khẩu"
      );
      setIsError(true);
      setTimeout(() => setMessage(null), 3000);
      setIsSubmitting(false);
    }
  };

  if (!email || !otpCode) return null;

  return (
    <div className="auth-wrapper">
      <div className="register-page">
        <form onSubmit={handleSubmit}>
          <div className="back-button-container">
            <button
              type="button"
              className="back-button"
              onClick={() => navigate("/forgot-password")}
            >
              ← Quay lại
            </button>
          </div>

          <h2>Đặt lại mật khẩu</h2>
          <p className="subtitle">
            Nhập mật khẩu mới cho tài khoản của bạn
          </p>

          {message && (
            <p className={`message ${isError ? "error" : ""}`}>{message}</p>
          )}

          <label>Mật khẩu mới</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Nhập mật khẩu mới"
            required
            disabled={isSubmitting}
            autoComplete="off"
          />

          <label>Xác nhận mật khẩu</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Nhập lại mật khẩu"
            required
            disabled={isSubmitting}
            autoComplete="off"
          />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Đang xử lý..." : "Đặt lại mật khẩu"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
