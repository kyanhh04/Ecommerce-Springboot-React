import React, { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import "../../style/registerMethod.css";

const RegisterMethodPage = () => {
  useDocumentTitle("Đăng Ký");
  const navigate = useNavigate();

  const handleGoogleResponse = useCallback(async (response) => {
    try {
      const result = await ApiService.googleLogin(response.credential);
      if (result.status === 200) {
        localStorage.setItem("token", result.token);
        localStorage.setItem("role", result.role);
        
        // Trigger cart reload for user-specific cart
        window.dispatchEvent(new Event('userChanged'));
        
        navigate("/", { replace: true });
      }
    } catch (error) {
      alert(error.response?.data.message || "Không thể đăng ký bằng Google");
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

  const handleEmailRegister = () => {
    navigate("/register/email");
  };

  return (
    <div className="auth-wrapper">
      <div className="register-method-page">
        <h2>Chọn phương thức đăng ký</h2>
        <p className="subtitle">Chọn một trong các phương thức bên dưới để tạo tài khoản</p>

        <div className="method-buttons">
          <button className="method-btn email-btn" onClick={handleEmailRegister}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="currentColor"/>
            </svg>
            <span>Tiếp tục sử dụng dịch vụ với email</span>
          </button>

          <div id="googleSignInDiv" style={{ width: '100%' }}></div>
        </div>

        <p className="login-link">
          Đã có tài khoản? <a href="/login">Đăng nhập</a>
        </p>
      </div>
    </div>
  );
};

export default RegisterMethodPage;
