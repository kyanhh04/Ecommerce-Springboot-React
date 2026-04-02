import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const fromResetPassword = location.state?.fromResetPassword;

  // Ngăn user back về các trang reset password sau khi đã reset password thành công
  useEffect(() => {
    if (fromResetPassword) {
      const handlePopState = (e) => {
        e.preventDefault();
        // Push lại state để không cho back
        window.history.pushState(null, '', '/login');
      };

      // Push initial state
      window.history.pushState(null, '', '/login');
      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [fromResetPassword]);

  const handleGoogleResponse = useCallback(async (response) => {
    try {
      const result = await ApiService.googleLogin(response.credential);
      if (result.status === 200) {
        setMessage("Đăng nhập Google thành công!");
        setIsError(false);
        localStorage.setItem("token", result.token);
        localStorage.setItem("role", result.role);
        
        // Trigger cart reload for user-specific cart
        window.dispatchEvent(new Event('userChanged'));
        
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 500);
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
        
        // Trigger cart reload for user-specific cart
        window.dispatchEvent(new Event('userChanged'));
        
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 800);
      } else {
        // Xử lý trường hợp response có status khác 200
        setMessage(response.message || "Đăng nhập thất bại");
        setIsError(true);
        setTimeout(() => {
          setMessage(null);
        }, 3000);
      }
    } catch (error) {
      // Hiển thị message từ backend
      const errorMessage = error.response?.data?.message || error.message || "Đăng nhập thất bại";
      setMessage(errorMessage);
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

          <p className="register-link">
            Chưa có tài khoản? <a href="/register">Đăng ký</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
