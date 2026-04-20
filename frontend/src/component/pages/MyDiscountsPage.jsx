import React, { useState, useEffect, useCallback } from 'react';
import ApiService from '../../service/ApiService';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import '../../style/myDiscounts.css';

const MyDiscountsPage = () => {
  useDocumentTitle("Mã Giảm Giá");
  
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const normalizeDiscountList = (response) => {
    return response?.userDiscountList || response?.discountList || response?.data?.userDiscountList || [];
  };

  const fetchMyDiscounts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ApiService.getMyDiscounts();
      if (response.status === 200) {
        setDiscounts(normalizeDiscountList(response));
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Không thể tải danh sách mã giảm giá');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyDiscounts();
  }, [fetchMyDiscounts]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatDiscount = (discount) => {
    if (discount.discountType === 'PERCENTAGE') {
      return `${discount.discountValue}%`;
    } else {
      return `${discount.discountValue.toLocaleString('vi-VN')}đ`;
    }
  };

  const getDiscountStatus = (userDiscount) => {
    if (userDiscount.isUsed) {
      return { label: 'Đã sử dụng', className: 'used' };
    }

    const discount = userDiscount.discount || userDiscount;
    if (discount.endDate && new Date(discount.endDate) < new Date()) {
      return { label: 'Hết hạn', className: 'expired' };
    }

    if (discount.isActive === false) {
      return { label: 'Tạm khóa', className: 'inactive' };
    }

    return { label: 'Còn hiệu lực', className: 'active' };
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setToastMessage('Đã sao chép!');
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="my-discounts-page">
        <div className="loading">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="my-discounts-page">
      {showToast && (
        <div className="toast-notification">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="discounts-header">
        <h2>Mã giảm giá của tôi</h2>
      </div>

      {error && <div className="error-message">{error}</div>}

      {discounts.length === 0 ? (
        <div className="empty-state">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 22V12M12 12L3 7M12 12l9-5" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p>Bạn chưa có mã giảm giá nào</p>
        </div>
      ) : (
        <div className="discounts-list">
          {discounts.map((userDiscount) => {
            const discount = userDiscount.discount || userDiscount;
            if (!discount) {
              return null;
            }

            const status = getDiscountStatus(userDiscount);
            return (
              <div key={userDiscount.id} className="discount-card">
                <div className="discount-left">
                  <div className="discount-value">
                    {formatDiscount(discount)}
                  </div>
                  <div className="discount-type">
                    {discount.discountType === 'PERCENTAGE' ? 'Giảm giá' : 'Giảm tiền'}
                  </div>
                </div>
                
                <div className="discount-divider"></div>
                
                <div className="discount-right">
                  <div className="discount-info">
                                    <div className="discount-title-row">
                                      <h3>{discount.description || 'Mã giảm giá'}</h3>
                                      <span className={`discount-status ${status.className}`}>
                                        {status.label}
                                      </span>
                                    </div>
                    <div className="discount-code">
                      <span className="code-text">{discount.code}</span>
                      <button 
                        className="copy-button" 
                        onClick={() => copyCode(discount.code)}
                        title="Sao chép mã"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M8 4v12a2 2 0 002 2h8a2 2 0 002-2V7.242a2 2 0 00-.602-1.43L16.083 2.57A2 2 0 0014.685 2H10a2 2 0 00-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16 18v2a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                    <div className="discount-dates">
                      <span>HSD: {discount.endDate ? formatDate(discount.endDate) : 'Không giới hạn'}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyDiscountsPage;
