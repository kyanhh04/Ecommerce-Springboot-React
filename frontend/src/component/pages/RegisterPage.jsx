import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import '../../style/register.css'


const RegisterPage = () => {

    const [formData, setFormData] = useState({
        email: '',
        name: '',
        phoneNumber: '',
        password: '',
        confirmPassword: ''
    });

    const [message, setMessage] = useState(null);
    const [isError, setIsError] = useState(false);
    const navigate = useNavigate();


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Kiểm tra mật khẩu khớp
        if (formData.password !== formData.confirmPassword) {
            setMessage("Mật khẩu xác nhận không khớp!");
            setIsError(true);
            return;
        }

        // Kiểm tra độ dài mật khẩu
        if (formData.password.length < 6) {
            setMessage("Mật khẩu phải có ít nhất 6 ký tự!");
            setIsError(true);
            return;
        }

        try {
            const { confirmPassword, ...dataToSend } = formData;
            const response = await ApiService.registerUser(dataToSend);
            if (response.status === 200) {
                setMessage("Đăng ký thành công! Đang chuyển đến trang đăng nhập...");
                setIsError(false);
                setTimeout(() => {
                    navigate("/login")
                }, 2000)
            }
        } catch (error) {
            setMessage(error.response?.data.message || error.message || "Không thể đăng ký tài khoản");
            setIsError(true);
        }
    }

    return (
        <div className="auth-wrapper">
            <div className="register-page">
                <form onSubmit={handleSubmit}>
                    <h2>Đăng ký</h2>
                    {message && <p className={`message ${isError ? 'error' : ''}`}>{message}</p>}
                    
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Nhập email của bạn"
                        required />

                    <label>Họ và tên</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Nhập họ và tên"
                        required />

                    <label>Số điện thoại</label>
                    <input
                        type="text"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        placeholder="Nhập số điện thoại"
                        required />

                    <label>Mật khẩu</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                        required />

                    <label>Xác nhận mật khẩu</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Nhập lại mật khẩu"
                        required />

                    <button type="submit">Đăng ký</button>
                    
                    <p className="register-link">
                        Đã có tài khoản? <a href="/login">Đăng nhập</a>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default RegisterPage;