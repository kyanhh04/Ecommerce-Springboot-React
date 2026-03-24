import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../../style/addProduct.css'
import ApiService from "../../service/ApiService";

const AddDiscountPage = () => {
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('PERCENTAGE');
    const [value, setValue] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [usageLimit, setUsageLimit] = useState(100);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!code || !value || !startDate || !endDate) {
            setError('All fields are required');
            setTimeout(() => setError(''), 3000);
            return;
        }

        if (type === 'PERCENTAGE' && (value < 0 || value > 100)) {
            setError('Percentage value must be between 0 and 100');
            setTimeout(() => setError(''), 3000);
            return;
        }

        if (new Date(startDate) >= new Date(endDate)) {
            setError('End date must be after start date');
            setTimeout(() => setError(''), 3000);
            return;
        }

        try {
            const discountDTO = {
                code: code.toUpperCase(),
                description,
                discountType: type,
                discountValue: parseFloat(value),
                usageLimit: parseInt(usageLimit) || 100,
                startDate: new Date(startDate).toISOString().slice(0, 19),
                endDate: new Date(endDate).toISOString().slice(0, 19),
                isActive: true
            };

            const response = await ApiService.createDiscount(discountDTO);
            setMessage(response.message || 'Tạo mã giảm giá thành công');
            setTimeout(() => {
                setMessage('');
                navigate('/admin/discounts');
            }, 2000);

        } catch (error) {
            setError(error.response?.data?.message || error.message || 'Unable to create discount')
            setTimeout(() => setError(''), 3000);
        }
    }

    return(
        <div>
            <form onSubmit={handleSubmit} className="product-form">
                <button type="button" className="back-btn" onClick={() => navigate('/admin/discounts')}>← Quay lại</button>
                <h2>Add Discount Code</h2>
                {message && <div className="message success">{message}</div>}
                {error && <div className="message error">{error}</div>}

                <input
                    type="text"
                    placeholder="Discount Code (e.g., SUMMER2024)"
                    value={code}
                    onChange={(e)=> setCode(e.target.value.toUpperCase())}
                    required
                />

                <input
                    type="text"
                    placeholder="Mô tả (không bắt buộc)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <select value={type} onChange={(e) => setType(e.target.value)} required>
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Amount (VND)</option>
                </select>

                <input
                    type="number"
                    placeholder={type === 'PERCENTAGE' ? 'Value (0-100)' : 'Value (VND)'}
                    value={value}
                    onChange={(e)=> setValue(e.target.value)}
                    min="0"
                    step={type === 'PERCENTAGE' ? '0.01' : '1000'}
                    required
                />

                <label>Giới hạn lượt dùng</label>
                <input
                    type="number"
                    placeholder="Số lượt sử dụng tối đa"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    min="1"
                    required
                />

                <label>Start Date</label>
                <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e)=> setStartDate(e.target.value)}
                    required
                />

                <label>End Date</label>
                <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e)=> setEndDate(e.target.value)}
                    required
                />

                <button type="submit">Add Discount</button>
                <button type="button" onClick={() => navigate('/admin/discounts')} className="cancel-btn">
                    Cancel
                </button>
            </form>
        </div>
    )
}

export default AddDiscountPage;
