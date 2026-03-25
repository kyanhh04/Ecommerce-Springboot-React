import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import "../../style/register.css";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await ApiService.loginUser(formData);
      if (response.status === 200) {
        setMessage("Đăng nhập thành công!");
        localStorage.setItem("token", response.token);
        localStorage.setItem("role", response.role);
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (error) {
      setMessage(
        error.response?.data.message ||
          error.message ||
          "unable to Login a user",
      );
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="register-page">
        <form onSubmit={handleSubmit}>
          <h2>Login</h2>
          {message && <p className="message">{message}</p>}
          
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <div className="forgot-password-link">
            <a href="/forgot-password">Quên mật khẩu?</a>
          </div>

          <button type="submit">Login</button>

          <p className="register-link">
            Chưa có tài khoản? <a href="/register">Đăng ký</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
