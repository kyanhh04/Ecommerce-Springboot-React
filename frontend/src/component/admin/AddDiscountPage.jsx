import React, { useState, useEffect } from "react";
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
    const [minOrderAmount, setMinOrderAmount] = useState(0);
    const [maxDiscountAmount, setMaxDiscountAmount] = useState('');
    const [autoAssignNewUser, setAutoAssignNewUser] = useState(false);
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [applyToAllCategories, setApplyToAllCategories] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    // Fetch categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await ApiService.getAllCategory();
                setCategories(response.categoryList || []);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    const handleCategoryToggle = (categoryId) => {
        setSelectedCategories(prev => {
            if (prev.includes(categoryId)) {
                return prev.filter(id => id !== categoryId);
            } else {
                return [...prev, categoryId];
            }
        });
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

        if (!applyToAllCategories && selectedCategories.length === 0) {
            setError('Vui lòng chọn ít nhất một danh mục hoặc chọn "Áp dụng cho tất cả danh mục"');
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
                minOrderAmount: parseFloat(minOrderAmount) || 0,
                maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
                autoAssignNewUser: autoAssignNewUser,
                applicableCategoryIds: applyToAllCategories ? null : selectedCategories,
                startDate: new Date(startDate).toISOString().slice(0, 19),
                endDate: new Date(endDate).toISOString().slice(0, 19),
                isActive: true
            };

            const response = await ApiService.createDiscount(discountDTO);
            navigate('/admin/discounts', { 
                state: { message: response.message || 'Tạo mã giảm giá thành công' } 
            });

        } catch (error) {
            setError(error.response?.data?.message || error.message || 'Unable to create discount')
            setTimeout(() => setError(''), 3000);
        }
    }

    return(
        <div>
            <form onSubmit={handleSubmit} className="product-form">
                <button type="button" className="back-btn" onClick={() => navigate('/admin/discounts')}>← Quay lại</button>
                <h2>Thêm Mã Giảm Giá</h2>
                {message && <div className="message success">{message}</div>}
                {error && <div className="message error">{error}</div>}

                <input
                    type="text"
                    placeholder="Mã giảm giá (ví dụ: SUMMER2024)"
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
                    <option value="PERCENTAGE">Phần trăm (%)</option>
                    <option value="FIXED_AMOUNT">Số tiền cố định (VND)</option>
                </select>

                <input
                    type="number"
                    placeholder={type === 'PERCENTAGE' ? 'Giá trị (0-100)' : 'Giá trị (VND)'}
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

                <label>Đơn hàng tối thiểu (VND)</label>
                <input
                    type="number"
                    placeholder="Giá trị đơn hàng tối thiểu để áp dụng"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value)}
                    min="0"
                    step="1000"
                />

                <label>Giảm tối đa (VND) - Chỉ áp dụng cho % giảm giá</label>
                <input
                    type="number"
                    placeholder="Số tiền giảm tối đa (để trống nếu không giới hạn)"
                    value={maxDiscountAmount}
                    onChange={(e) => setMaxDiscountAmount(e.target.value)}
                    min="0"
                    step="1000"
                    disabled={type === 'FIXED_AMOUNT'}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                    <input
                        type="checkbox"
                        id="autoAssign"
                        checked={autoAssignNewUser}
                        onChange={(e) => setAutoAssignNewUser(e.target.checked)}
                        style={{ width: 'auto', margin: 0 }}
                    />
                    <label htmlFor="autoAssign" style={{ margin: 0, cursor: 'pointer' }}>
                        Tự động cấp cho user mới đăng ký
                    </label>
                </div>

                <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        <input
                            type="checkbox"
                            id="applyToAll"
                            checked={applyToAllCategories}
                            onChange={(e) => setApplyToAllCategories(e.target.checked)}
                            style={{ width: 'auto', margin: 0 }}
                        />
                        <label htmlFor="applyToAll" style={{ margin: 0, cursor: 'pointer', fontWeight: 'bold' }}>
                            Áp dụng cho tất cả danh mục
                        </label>
                    </div>

                    {!applyToAllCategories && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                                Chọn danh mục áp dụng:
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                                {categories.map(category => (
                                    <div key={category.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <input
                                            type="checkbox"
                                            id={`category-${category.id}`}
                                            checked={selectedCategories.includes(category.id)}
                                            onChange={() => handleCategoryToggle(category.id)}
                                            style={{ width: 'auto', margin: 0 }}
                                        />
                                        <label htmlFor={`category-${category.id}`} style={{ margin: 0, cursor: 'pointer' }}>
                                            {category.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                            {selectedCategories.length === 0 && (
                                <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '10px' }}>
                                    Vui lòng chọn ít nhất một danh mục hoặc chọn "Áp dụng cho tất cả danh mục"
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <label>Ngày bắt đầu</label>
                <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e)=> setStartDate(e.target.value)}
                    required
                />

                <label>Ngày kết thúc</label>
                <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e)=> setEndDate(e.target.value)}
                    required
                />

                <button type="submit">Thêm Mã Giảm Giá</button>
                <button type="button" onClick={() => navigate('/admin/discounts')} className="cancel-btn">
                    Hủy
                </button>
            </form>
        </div>
    )
}

export default AddDiscountPage;
