import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import { useCart } from "../context/CartContext";
import '../../style/cart.css';

const CartPage = () => {

    const { cart, dispatch } = useCart();
    const [message, setMessage] = useState(null);
    const [discountCode, setDiscountCode] = useState('');
    const [discount, setDiscount] = useState(null);
    const [discountError, setDiscountError] = useState('');
    const navigate = useNavigate();

    const incrementItem = (product) => {
        dispatch({ type: 'INCREMENT_ITEM', payload: product });
    };

    const decrementItem = (product) => {
        const cartItem = cart.find(item => item.id === product.id);

        if (cartItem && cartItem.quantity > 1) {
            dispatch({ type: 'DECREMENT_ITEM', payload: product });
        } else {
            dispatch({ type: 'REMOVE_ITEM', payload: product });
        }
    }

    const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

    // Apply discount
    const applyDiscount = async () => {
        if (!discountCode.trim()) {
            setDiscountError('Vui lòng nhập mã giảm giá');
            return;
        }

        try {
            const response = await ApiService.getDiscountByCode(discountCode.toUpperCase());
            console.log('Discount API Response:', response);
            
            if (response.status === 200) {
                console.log('Discount data:', response.discount);
                setDiscount(response.discount);
                setDiscountError('');
                setMessage('✅ Áp dụng mã giảm giá thành công!');
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            console.error('Discount error:', error);
            setDiscountError(error.response?.data?.message || 'Mã giảm giá không hợp lệ');
            setDiscount(null);
            setTimeout(() => setDiscountError(''), 3000);
        }
    };

    const removeDiscount = () => {
        setDiscount(null);
        setDiscountCode('');
        setMessage('Đã xóa mã giảm giá');
        setTimeout(() => setMessage(''), 2000);
    };

    // Calculate discount amount
    const discountAmount = discount
        ? discount.discountType === 'PERCENTAGE'
            ? (totalPrice * (discount.discountValue || 0)) / 100
            : (discount.discountValue || 0)
        : 0;

    const finalPrice = Math.max(0, totalPrice - discountAmount);



    const handleCheckout = async () => {

        if (!ApiService.isAuthenticated()) {
            setMessage("Bạn cần đăng nhập trước khi đặt hàng");
            setTimeout(() => {
                setMessage('');
                navigate("/login");
            }, 3000);
            return;
        }

        const orderItems = cart.map(item => ({
            productId: item.id,
            quantity: item.quantity
        }));

        const orderRequest = {
            totalPrice: finalPrice,
            items: orderItems,
            discountCode: discount?.code || null
        };

        try {
            const response = await ApiService.createOrder(orderRequest);

            if (response.status === 200 && response.order) {
                const newOrderId = response.order.id;

                // Xóa giỏ hàng và chuyển sang trang thanh toán ngay lập tức
                dispatch({ type: 'CLEAR_CART' });

                navigate('/payment', {
                    state: {
                        orderId: newOrderId,
                        totalPrice: finalPrice,
                        discountCode: discount?.code || null,
                        discountAmount: discountAmount || 0
                    }
                });
            } else {
                setMessage(response.message || 'Đặt hàng thất bại');
            }

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                error.message ||
                'Đặt hàng thất bại'
            );

            setTimeout(() => {
                setMessage('');
            }, 3000);
        }
    };

    return (
        <div className="cart-page">
            <h1>Cart</h1>

            {message && <p className="response-message">{message}</p>}

            {cart.length === 0 ? (
                <p>Your cart is empty</p>
            ) : (
                <div>
                    <ul>
                        {cart.map(item => (
                            <li key={item.id}>
                                <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                />

                                <div>
                                    <h2>{item.name}</h2>
                                    <p>{item.description}</p>

                                    <div className="quantity-controls">
                                        <button onClick={() => decrementItem(item)}>-</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => incrementItem(item)}>+</button>
                                    </div>

                                    <span>
                                        {item.price.toLocaleString()} ₫
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>

                    {/* Discount Code Section */}
                    <div className="discount-section">
                        <h3>Mã Giảm Giá</h3>
                        {!discount ? (
                            <div className="discount-input-group">
                                <input
                                    type="text"
                                    placeholder="Nhập mã giảm giá"
                                    value={discountCode}
                                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                                    className="discount-input"
                                />
                                <button onClick={applyDiscount} className="apply-discount-btn">
                                    Áp dụng
                                </button>
                            </div>
                        ) : (
                            <div className="discount-applied">
                                <span className="discount-badge">
                                    ✓ {discount.code} -
                                    {discount.discountType === 'PERCENTAGE'
                                        ? ` ${discount.discountValue || 0}%`
                                        : ` ${(discount.discountValue || 0).toLocaleString()}đ`}
                                </span>
                                <button onClick={removeDiscount} className="remove-discount-btn">
                                    Xóa
                                </button>
                            </div>
                        )}
                        {discountError && <p className="error-text">{discountError}</p>}
                    </div>

                    {/* Price Summary */}
                    <div className="price-summary">
                        <div className="price-row">
                            <span>Tạm tính:</span>
                            <span>${totalPrice.toFixed(2)}</span>
                        </div>
                        {discount && (
                            <div className="price-row discount-row">
                                <span>Giảm giá:</span>
                                <span className="discount-amount">-${discountAmount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="price-row total-row">
                            <strong>Tổng cộng:</strong>
                            <strong>${finalPrice.toFixed(2)}</strong>
                        </div>
                    </div>

                    <button className="checkout-button" onClick={handleCheckout}>Đặt Hàng</button>
                </div>
            )}
        </div>
    );
};

export default CartPage;