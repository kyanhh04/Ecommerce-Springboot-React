import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import '../../style/addProduct.css'
import ApiService from "../../service/ApiService";

const EditDiscountPage = () => {
    const { discountId } = useParams();
    const [code, setCode] = useState('');
    const [type, setType] = useState('PERCENTAGE');
    const [value, setValue] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [active, setActive] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (discountId) {
            ApiService.getDiscountById(discountId).then((response) => {
                const discount = response.discount;
                setCode(discount.code);
                setType(discount.type);
                setValue(discount.value);
                // Format datetime-local input
                setStartDate(formatDateTimeLocal(discount.startDate));
                setEndDate(formatDateTimeLocal(discount.endDate));
                setActive(discount.active);
            }).catch((error) => {
                setError(error.response?.data?.message || 'Unable to load discount');
            });
        }
    }, [discountId]);

    const formatDateTimeLocal = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

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
                type,
                value: parseFloat(value),
                startDate,
                endDate,
                active
            };

            const response = await ApiService.updateDiscount(discountId, discountDTO);
            if (response.status === 200) {
                setMessage(response.message);
                setTimeout(() => {
                    setMessage('');
                    navigate('/admin/discounts');
                }, 2000);
            }

        } catch (error) {
            setError(error.response?.data?.message || error.message || 'Unable to update discount');
            setTimeout(() => setError(''), 3000);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="product-form">
            <h2>Edit Discount Code</h2>
            {message && <div className="message success">{message}</div>}
            {error && <div className="message error">{error}</div>}

            <input
                type="text"
                placeholder="Discount Code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
            />

            <select value={type} onChange={(e) => setType(e.target.value)} required>
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED_AMOUNT">Fixed Amount (VND)</option>
            </select>

            <input
                type="number"
                placeholder={type === 'PERCENTAGE' ? 'Value (0-100)' : 'Value (VND)'}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                min="0"
                step={type === 'PERCENTAGE' ? '0.01' : '1000'}
                required
            />

            <label>Start Date</label>
            <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
            />

            <label>End Date</label>
            <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
            />

            <label className="checkbox-label">
                <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                />
                Active
            </label>

            <button type="submit">Update Discount</button>
            <button type="button" onClick={() => navigate('/admin/discounts')} className="cancel-btn">
                Cancel
            </button>
        </form>
    );
}

export default EditDiscountPage;
