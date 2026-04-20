import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ApiService from "../../service/ApiService";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import '../../style/address.css';

const AddressPage = () => {
    useDocumentTitle("Địa Chỉ");

    const [address, setAddress] = useState({
        street: '',
        city: '',
        state: ''
    });

    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();


    useEffect(() => {

        if (location.pathname === '/edit-address') {
            fetchUserInfo();
        }
    }, [location.pathname]);


    const fetchUserInfo = async()=>{
        try {
            const response = await ApiService.getLoggedInUserInfo();
            if (response.user.address) {
                setAddress(response.user.address)
            }
        } catch (error) {
            setError(error.response?.data?.message || error.message || "unable to fetch user information")
        }
    } ;

    const handleChange = (e) =>{
        const {name, value} = e.target;
        setAddress((prevAddress) => ({
            ...prevAddress,
            [name]: value
        }))
    }

    const handSubmit = async (e) =>{
        e.preventDefault();
        try {
            await ApiService.saveAddress(address);
            navigate("/profile")
        } catch (error) {
            setError(error.response?.data?.message || error.message || "Failed to save/update address")
        }
    }


    return(
        <div className="address-page">
            <h2>{location.pathname === '/edit-address' ? 'Chỉnh sửa địa chỉ' : "Thêm địa chỉ"}</h2>
            {error && <p className="error-message">{error}</p>}
            
            <form onSubmit={handSubmit}>
                <label>
                    Địa chỉ:
                    <input 
                        type="text"
                        name="street"
                        value={address.street}
                        onChange={handleChange}
                        placeholder="Nhập số nhà, tên đường..."
                        required
                    />
                </label>
                <label>
                    Thành phố:
                    <input 
                        type="text"
                        name="city"
                        value={address.city}
                        onChange={handleChange}
                        placeholder="Nhập tên thành phố..."
                        required
                    />
                </label>
                <label>
                    Quận/Huyện:
                    <input 
                        type="text"
                        name="state"
                        value={address.state}
                        onChange={handleChange}
                        placeholder="Nhập quận/huyện..."
                        required
                    />
                </label>

                <button type="submit">
                    {location.pathname === '/edit-address' ? 'Cập nhật địa chỉ' : "Lưu địa chỉ"}
                </button>

            </form>
        </div>
    )
}

export default AddressPage;