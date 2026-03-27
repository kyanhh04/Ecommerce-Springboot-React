import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import "../../style/register.css";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleGoogleResponse = useCallback(async (response) => {
    try {
      const result = await ApiService.googleLogin(response.credential);
      if (result.status === 200) {
        setMessage("Đăng nhập Google thành công!");
        setIsError(false);
        localStorage.setItem("token", result.token);
        localStorage.setItem("role", result.role);
        setTimeout(() => {
          navigate("/");
        }, 1500);
      }
    } catch (error) {
      setMessage(
        error.response?.data.message ||
          error.message ||
          "Không thể đăng nhập bằng Google"
      );
      setIsError(true);
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    }
  }, [navigate]);

  // Load Google Sign-In script
  useEffect(() => {
    let initialized = false;
    
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google && !initialized) {
        initialized = true;
        window.google.accounts.id.initialize({
          client_id: '412782290816-bh5i2ek2brcfai0d3thg7gj39osmb4aj.apps.googleusercontent.com',
          callback: handleGoogleResponse,
          auto_select: false
        });
        
        // Render button vào div
        const buttonDiv = document.getElementById('googleSignInDiv');
        if (buttonDiv) {
          window.google.accounts.id.renderButton(
            buttonDiv,
            { 
              theme: 'outline',
              size: 'large',
              text: 'continue_with',
              shape: 'pill',
              logo_alignment: 'left',
              width: buttonDiv.offsetWidth
            }
          );
        }
      }
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [handleGoogleResponse]);

  const handleFacebookLogin = () => {
    alert("Tính năng đăng nhập bằng Facebook đang được phát triển");
  };

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
        setIsError(false);
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
      setIsError(true);
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="register-page">
        <form onSubmit={handleSubmit}>
          <h2>Đăng nhập</h2>
          {message && <p className={`message ${isError ? 'error' : ''}`}>{message}</p>}
          
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Nhập email của bạn"
            required
            autoComplete="email"
          />

          <label>Mật khẩu</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Nhập mật khẩu"
            required
            autoComplete="current-password"
          />

          <div className="forgot-password-link">
            <a href="/forgot-password">Quên mật khẩu?</a>
          </div>

          <button type="submit">Đăng nhập</button>

          <div className="divider">
            <span>HOẶC</span>
          </div>

          <div id="googleSignInDiv" style={{ marginBottom: '12px' }}></div>

          <button type="button" className="method-btn facebook-btn" onClick={handleFacebookLogin}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span>Continue with Facebook</span>
          </button>

          <p className="register-link">
            Chưa có tài khoản? <a href="/register">Đăng ký</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
