import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import '../../style/register.css'


const RegisterEmailPage = () => {
    useDocumentTitle("Đăng Ký Email");

    const [email, setEmail] = useState('');
    const [message, setMessage] = useState(null);
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate email format
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            setMessage("Định dạng email không hợp lệ");
            setIsError(true);
            setTimeout(() => {
                setMessage(null);
            }, 3000);
            return;
        }
        
        setIsLoading(true);

        try {
            // Kiểm tra email đã tồn tại chưa
            const checkResponse = await ApiService.checkEmailExists(email);
            
            if (checkResponse.exists) {
                setMessage("Email này đã được đăng ký. Vui lòng đăng nhập hoặc sử dụng email khác.");
                setIsError(true);
                setIsLoading(false);
                setTimeout(() => {
                    setMessage(null);
                }, 3000);
                return;
            }

            // Gọi API gửi OTP đến email
            const otpResponse = await ApiService.sendRegistrationOTP(email);
            
            if (otpResponse.status === 200) {
                setMessage("Mã OTP đã được gửi đến email của bạn!");
                setIsError(false);
                
                setTimeout(() => {
                    // Chuyển đến trang nhập OTP
                    navigate("/register/otp", { state: { email } });
                }, 500);
            } else {
                setMessage(otpResponse.message || "Không thể gửi mã OTP");
                setIsError(true);
                setTimeout(() => {
                    setMessage(null);
                }, 3000);
            }
            
        } catch (error) {
            setMessage(error.response?.data.message || error.message || "Không thể gửi mã OTP");
            setIsError(true);
            setTimeout(() => {
                setMessage(null);
            }, 3000);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="auth-wrapper">
            <div className="register-page">
                <form onSubmit={handleSubmit}>
                    <div className="back-button-container">
                        <button type="button" className="back-button" onClick={() => navigate('/register')}>
                            ← Quay lại
                        </button>
                    </div>
                    <h2>Đăng ký bằng Email</h2>
                    <p className="subtitle">Nhập địa chỉ email của bạn để nhận mã xác nhận</p>
                    
                    {message && <p className={`message ${isError ? 'error' : ''}`}>{message}</p>}
                    
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Nhập email của bạn"
                        required 
                        disabled={isLoading}
                    />

                    <button type="submit" disabled={isLoading}>
                        {isLoading ? "Đang gửi..." : "Tiếp tục"}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default RegisterEmailPage;