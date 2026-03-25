import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import '../../style/register.css'


const RegisterPage = () => {

    const [formData, setFormData] = useState({
        email: '',
        name: '',
        phoneNumber: '',
        password: ''
    });

    const [message, setMessage] = useState(null);
    const navigate = useNavigate();


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await ApiService.registerUser(formData);
            if (response.status === 200) {
                setMessage("User Successfully Registerd");
                setTimeout(() => {
                    navigate("/login")
                }, 4000)
            }
        } catch (error) {
            setMessage(error.response?.data.message || error.message || "unable to register a user");
        }
    }

    return (
        <div className="auth-wrapper">
            <div className="register-page">
                <form onSubmit={handleSubmit}>
                    <h2>Register</h2>
                    {message && <p className="message">{message}</p>}
                    
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required />

                    <label>Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required />

                    <label>Phone Number</label>
                    <input
                        type="text"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        required />

                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required />

                    <button type="submit">Register</button>
                    
                    <p className="register-link">
                        Đã có tài khoản? <a href="/login">Đăng nhập</a>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default RegisterPage;