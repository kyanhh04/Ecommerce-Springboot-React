import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ApiService from "../../service/ApiService";
import "../../style/register.css";

const RegisterOTPPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef([]);

  // Redirect nếu không có email
  useEffect(() => {
    if (!email) {
      navigate("/register/email");
    }
  }, [email, navigate]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleOtpChange = (index, value) => {
    // Chỉ cho phép số
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit when all 6 digits are filled
    if (value && index === 5) {
      const otpCode = newOtp.join("");
      if (otpCode.length === 6) {
        // Delay slightly to show the last digit
        setTimeout(() => {
          verifyOTP(otpCode);
        }, 300);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    // Backspace: xóa và focus input trước
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData.length; i++) {
      if (/^\d$/.test(pastedData[i])) {
        newOtp[i] = pastedData[i];
      }
    }
    
    setOtp(newOtp);
    
    // Auto submit if all 6 digits are filled after paste
    if (newOtp.every(digit => digit !== "")) {
      setTimeout(() => {
        verifyOTP(newOtp.join(""));
      }, 300);
    }
  };

  const verifyOTP = async (otpCode) => {
    if (isVerifying) return; // Prevent double submission
    
    setIsVerifying(true);

    try {
      const response = await ApiService.verifyRegistrationOTP(email, otpCode);
      
      if (response.status === 200) {
        setMessage("Xác nhận OTP thành công!");
        setIsError(false);
        
        setTimeout(() => {
          // Chuyển đến trang nhập mật khẩu
          navigate("/register/password", { state: { email, otpCode } });
        }, 500);
      } else {
        setMessage(response.message || "Mã OTP không đúng");
        setIsError(true);
        setTimeout(() => setMessage(null), 3000);
        setIsVerifying(false);
      }
      
    } catch (error) {
      setMessage(
        error.response?.data.message ||
          error.message ||
          "Mã OTP không đúng hoặc đã hết hạn"
      );
      setIsError(true);
      setTimeout(() => setMessage(null), 3000);
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setMessage("Vui lòng nhập đầy đủ mã OTP");
      setIsError(true);
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    verifyOTP(otpCode);
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    try {
      setMessage("Đang gửi lại mã OTP...");
      setIsError(false);
      
      const response = await ApiService.sendRegistrationOTP(email);
      
      if (response.status === 200) {
        setMessage("Mã OTP mới đã được gửi đến email của bạn!");
        setIsError(false);
        setCountdown(60);
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage(response.message || "Không thể gửi lại mã OTP");
        setIsError(true);
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage(error.response?.data.message || "Không thể gửi lại mã OTP");
      setIsError(true);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (!email) return null;

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

          <h2>Xác nhận địa chỉ email</h2>
          
          <p className="otp-description">
            Chúng tôi đã gửi mã xác nhận đến <strong>{email}</strong>. Kiểm tra
            hộp thư đến và nhập mã tại đây.
          </p>

          {message && (
            <p className={`message ${isError ? "error" : ""}`}>{message}</p>
          )}

          <div className="otp-container">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="otp-input"
                required
                disabled={isVerifying}
              />
            ))}
          </div>

          <div className="otp-info">
            <p className="otp-validity">
              Mã OTP có hiệu lực trong <span className="countdown-number">{countdown}s</span>
            </p>
          </div>

          <div className="resend-container">
            {canResend ? (
              <button
                type="button"
                className="resend-btn"
                onClick={handleResendOTP}
              >
                Gửi lại mã OTP
              </button>
            ) : (
              <p className="countdown-text">
                Bạn có thể gửi lại mã sau <span className="countdown-number">{countdown}s</span>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterOTPPage;
