import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ApiService from "../../service/ApiService";
import "../../style/register.css";

const RegisterPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const otpCode = location.state?.otpCode;

  const [formData, setFormData] = useState({
    name: "",
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
      navigate("/register/email");
    }
  }, [email, otpCode, navigate]);

  const validateField = (name, value) => {
    let error = "";

    if (name === "name") {
      if (!value) {
        error = "Tên không được để trống";
      } else if (value.length < 2) {
        error = "Tên phải có ít nhất 2 ký tự";
      }
    }

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
      const response = await ApiService.registerUser({
        email,
        name: formData.name,
        phoneNumber: null,
        password: formData.password,
        otpCode,
      });

      if (response.status === 200) {
        setMessage("Đăng ký thành công!");
        setIsError(false);
        
        // Auto login after registration
        localStorage.setItem("token", response.token);
        localStorage.setItem("role", response.role);
        
        // Trigger cart reload for user-specific cart
        window.dispatchEvent(new Event('userChanged'));
        
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 1500);
      }
    } catch (error) {
      setMessage(
        error.response?.data.message ||
          error.message ||
          "Không thể đăng ký tài khoản"
      );
      setIsError(true);
      setTimeout(() => setMessage(null), 3000);
    } finally {
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
              onClick={() => navigate("/register")}
            >
              ← Quay lại
            </button>
          </div>

          <h2>Hoàn tất đăng ký</h2>
          <p className="subtitle">
            Nhập tên và tạo mật khẩu mạnh để bảo vệ tài khoản của bạn
          </p>

          {message && (
            <p className={`message ${isError ? "error" : ""}`}>{message}</p>
          )}

          <label>Tên của bạn</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nhập tên của bạn"
            required
            disabled={isSubmitting}
          />

          <label>Mật khẩu</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Nhập mật khẩu"
            required
            disabled={isSubmitting}
            autoComplete="new-password"
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
            autoComplete="new-password"
          />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Đang xử lý..." : "Hoàn tất đăng ký"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPasswordPage;
