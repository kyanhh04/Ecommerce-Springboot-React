import React, { useState, useEffect, useCallback } from 'react';
import ApiService from '../../service/ApiService';
import '../../style/discountModal.css';

const DiscountModal = ({ isOpen, onClose, onSelectDiscount, totalAmount }) => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const normalizeDiscountList = (response) => {
    return response?.userDiscountList || response?.discountList || response?.data?.userDiscountList || [];
  };

  const fetchDiscounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ApiService.getMyDiscounts();
      if (response.status === 200) {
        setDiscounts(normalizeDiscountList(response));
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError('Không thể tải danh sách mã giảm giá');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchDiscounts();
    }
  }, [fetchDiscounts, isOpen]);

  const formatDiscount = (discount) => {
    if (discount.discountType === 'PERCENTAGE') {
      return `${discount.discountValue}%`;
    } else {
      return `${discount.discountValue.toLocaleString('vi-VN')}đ`;
    }
  };

  const getDiscountStatus = (userDiscount) => {
    if (userDiscount.isUsed) {
      return 'Đã sử dụng';
    }

    const discount = userDiscount.discount || userDiscount;
    if (discount.endDate && new Date(discount.endDate) < new Date()) {
      return 'Hết hạn';
    }

    if (discount.isActive === false) {
      return 'Tạm khóa';
    }

    return 'Còn hiệu lực';
  };

  const calculateDiscountAmount = (discount) => {
    if (discount.discountType === 'PERCENTAGE') {
      const amount = (totalAmount * discount.discountValue) / 100;
      // Áp dụng max discount nếu có
      if (discount.maxDiscountAmount && amount > discount.maxDiscountAmount) {
        return discount.maxDiscountAmount;
      }
      return amount;
    } else {
      return discount.discountValue;
    }
  };

  const canUseDiscount = (discount) => {
    const minAmount = discount.minOrderAmount || 0;
    return totalAmount >= minAmount;
  };

  const handleSelectDiscount = (userDiscount) => {
    const discount = userDiscount.discount;
    if (!canUseDiscount(discount)) {
      return;
    }
    onSelectDiscount(discount);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="discount-modal-overlay" onClick={onClose}>
      <div className="discount-modal" onClick={(e) => e.stopPropagation()}>
        <div className="discount-modal-header">
          <h3>Chọn mã giảm giá</h3>
          <button className="close-button" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="discount-modal-body">
          {loading ? (
            <div className="loading-state">Đang tải...</div>
          ) : error ? (
            <div className="error-state">{error}</div>
          ) : discounts.length === 0 ? (
            <div className="empty-state">
              <p>Bạn chưa có mã giảm giá nào</p>
            </div>
          ) : (
            <div className="discounts-list">
              {discounts.map((userDiscount) => {
                const discount = userDiscount.discount || userDiscount;
                if (!discount) {
                  return null;
                }

                const canUse = canUseDiscount(discount);
                const discountAmount = calculateDiscountAmount(discount);
                const minAmount = discount.minOrderAmount || 0;

                return (
                  <div
                    key={userDiscount.id}
                    className={`discount-item ${!canUse ? 'disabled' : ''}`}
                    onClick={() => handleSelectDiscount(userDiscount)}
                  >
                    <div className="discount-item-left">
                      <div className="discount-badge">
                        {formatDiscount(discount)}
                      </div>
                    </div>
                    <div className="discount-item-right">
                        <div className="discount-item-title-row">
                          <h4>{discount.description || 'Mã giảm giá'}</h4>
                          <span className={`discount-item-status ${canUse ? 'active' : 'inactive'}`}>
                            {getDiscountStatus(userDiscount)}
                          </span>
                        </div>
                      <p className="discount-code">Mã: {discount.code}</p>
                      {minAmount > 0 && (
                        <p className="discount-condition">
                          Đơn tối thiểu: {minAmount.toLocaleString('vi-VN')}đ
                        </p>
                      )}
                      {discount.maxDiscountAmount && discount.discountType === 'PERCENTAGE' && (
                        <p className="discount-max">
                          Giảm tối đa: {discount.maxDiscountAmount.toLocaleString('vi-VN')}đ
                        </p>
                      )}
                      {!canUse && (
                        <p className="discount-unavailable">
                          Cần mua thêm {(minAmount - totalAmount).toLocaleString('vi-VN')}đ
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscountModal;
