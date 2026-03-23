import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import { useCart } from "../context/CartContext";
import "../../style/cart.css";
const CartPage = () => {
  const { cart, dispatch } = useCart();
  // Đã bỏ message/thông báo
  const [discountCode, setDiscountCode] = useState("");
  const [discount, setDiscount] = useState(null);
  const [discountError, setDiscountError] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [displayCount, setDisplayCount] = useState(5);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const hasUserInteractedRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (cart.length === 0) {
      setSelectedIds([]);
      hasUserInteractedRef.current = false;
      return;
    }

    const cartIdSet = new Set(cart.map((i) => i.id));
    // Không tự động chọn sản phẩm khi vào giỏ hàng nữa
    setSelectedIds((prev) => prev.filter((id) => cartIdSet.has(id)));
  }, [cart]);

  const selectedItems = cart.filter((i) => selectedIds.includes(i.id));
  const selectedTotalPrice = selectedItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const isAllSelected = cart.length > 0 && selectedIds.length === cart.length;

  const toggleSelect = (id) => {
    hasUserInteractedRef.current = true;
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSelectAllChange = () => {
    hasUserInteractedRef.current = true; 
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(cart.map((i) => i.id));
    }
  };

  const incrementItem = (product) => {
    dispatch({ type: "INCREMENT_ITEM", payload: product });
  };
  const decrementItem = (product) => {
    const cartItem = cart.find((item) => item.id === product.id);
    if (cartItem && cartItem.quantity > 1) {
      dispatch({ type: "DECREMENT_ITEM", payload: product });
    } else {
      dispatch({ type: "REMOVE_ITEM", payload: product });
    }
  };
  const applyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountError("Vui lòng nhập mã giảm giá");
      return;
    }
    try {
      const response = await ApiService.getDiscountByCode(
        discountCode.toUpperCase(),
      );
      if (response.status === 200) {
        setDiscount(response.discount);
        setDiscountError("");
      }
    } catch (error) {
      setDiscountError("Mã giảm giá không hợp lệ");
      setDiscount(null);
      setTimeout(() => setDiscountError(""), 3000);
    }
  };
  const removeDiscount = () => {
    setDiscount(null);
    setDiscountCode("");
  };
  const discountAmount = discount
    ? discount.discountType === "PERCENTAGE"
      ? (selectedTotalPrice * (discount.discountValue || 0)) / 100
      : discount.discountValue || 0
    : 0;
  const shippingFee = selectedItems.length > 0 ? 25000 : 0;
  const finalPrice = Math.max(0, selectedTotalPrice - discountAmount + shippingFee);

  const handleRemoveSelected = () => {
    if (selectedIds.length === 0) {
      return;
    }

    dispatch({ type: "REMOVE_ITEMS", payload: { ids: selectedIds } });
    setSelectedIds([]);
    hasUserInteractedRef.current = true;
  };

  const handleCheckout = async () => {
    if (!ApiService.isAuthenticated()) {
      navigate("/login");
      return;
    }

    if (selectedItems.length === 0) {
      return;
    }

    const orderItems = selectedItems.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
    }));
    const orderRequest = {
      totalPrice: finalPrice,
      items: orderItems,
      discountCode: discount?.code || null,
      paymentMethod: paymentMethod,
    };

    if (paymentMethod === "cash") {
      try {
        const response = await ApiService.createOrder(orderRequest);
        if (response.status === 200 && response.order) {
          const newOrderId = response.order.id;
          
          // Clear selected items from cart
          dispatch({ type: "REMOVE_ITEMS", payload: { ids: selectedIds } });
          
          // Navigate to home with success notification
          navigate("/", {
            state: {
              orderSuccess: {
                orderId: newOrderId,
                amount: finalPrice,
                paymentMethod: "CASH"
              }
            }
          });
        }
      } catch (error) {
        console.error("Đặt hàng thất bại:", error);
      }
    } else {
      // Chuyển khoản: chuyển đến trang thanh toán
      try {
        const response = await ApiService.createOrder(orderRequest);
        if (response.status === 200 && response.order) {
          const newOrderId = response.order.id;
          navigate("/payment", {
            state: {
              orderId: newOrderId,
              totalPrice: finalPrice,
              discountCode: discount?.code || null,
              discountAmount: discountAmount || 0,
            },
          });
        }
        // Không hiển thị thông báo
      } catch (error) {
        // Không hiển thị thông báo
      }
    }
  };

  const loadMore = () => {
    setDisplayCount(prev => prev + 5);
  };

  const displayedCart = cart.slice(0, displayCount);
  const hasMore = displayCount < cart.length;
  return (
    <div className="cart-page">
      <div className="cart-wrapper">

        {cart.length === 0 ? (
          <div className="empty-cart-wrapper">
            <div className="empty-cart-icon">
              {/* SVG icon giỏ hàng trống */}
              <svg width="90" height="90" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="45" cy="45" r="45" fill="#f3f6fb"/>
                <path d="M28 65c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4zm34 0c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4zM28.2 57l-2.7-6.2c-.2-.5-.5-1.1-.5-1.8 0-1.7 1.3-3 3-3h36.2c1.3 0 2.5.9 2.9 2.2l3.7 11.1c.2.5.2 1.1.2 1.7 0 2.2-1.8 4-4 4H32.1c-1.6 0-3-1.1-3.6-2.7l-.3-.7zm2.3-7.2l2.2 5.2h29.7l-2.2-5.2H30.5z" fill="#a0aec0"/>
                <path d="M32 38c0-7.2 5.8-13 13-13s13 5.8 13 13v2H32v-2zm13-15c-8.3 0-15 6.7-15 15v2c0 1.1.9 2 2 2h26c1.1 0 2-.9 2-2v-2c0-8.3-6.7-15-15-15z" fill="#a0aec0"/>
              </svg>
            </div>
            <p className="empty-cart">Giỏ hàng của bạn đang trống</p>
            <button
              className="continue-shopping-btn"
              onClick={() => navigate("/")}
            >
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <div className="cart-grid">
            <div className="cart-items">
              <div className="select-all-row">
                <div className="cart-select">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAllChange}
                  />
                </div>
                <div className="select-all-label">Chọn tất cả</div>
                <div className="select-actions">
                  {selectedIds.length > 0 && (
                    <button
                      type="button"
                      className="remove-selected-button"
                      onClick={handleRemoveSelected}
                    >
                      Xóa sản phẩm đã chọn
                    </button>
                  )}
                </div>
              </div>
              {displayedCart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <div className="cart-select">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                    />
                  </div>
                  <img src={item.imageUrl} alt={item.name} />
                  <div className="cart-info">
                    <h2>{item.name}</h2>
                    <p>{item.description}</p>
                  </div>
                  <div className="quantity-controls">
                    <button onClick={() => decrementItem(item)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => incrementItem(item)}>+</button>
                  </div>
                  <div className="cart-price">
                    {item.price.toLocaleString()} ₫
                  </div>
                </div>
              ))}
              {hasMore && (
                <div className="load-more-container">
                  <button className="load-more-btn" onClick={loadMore}>
                    Tải thêm ({cart.length - displayCount} sản phẩm)
                  </button>
                </div>
              )}
            </div>
            <div className="cart-summary">
              <h3>
                Order Summary ({selectedItems.length}/{cart.length})
              </h3>
              <div className="summary-row">
                <span>Tạm tính</span>
                <span>{selectedTotalPrice.toLocaleString()} ₫</span>
              </div>
              <div className="summary-row">
                <span>Phí vận chuyển</span>
                <span>{shippingFee.toLocaleString()} ₫</span>
              </div>
              <div className="discount-section">
                <div className="summary-row voucher-row">
                  <span>Voucher</span>
                  <span className="voucher-name">{discount ? discount.code : "Chưa áp dụng"}</span>
                </div>
                {!discount ? (
                  <div className="discount-input-group">
                    <input
                      type="text"
                      placeholder="Nhập mã giảm giá"
                      value={discountCode}
                      onChange={(e) =>
                        setDiscountCode(e.target.value.toUpperCase())
                      }
                    />
                    <button onClick={applyDiscount}>Áp dụng</button>
                  </div>
                ) : (
                  <div className="discount-applied-group">
                    <button className="remove-discount-btn" onClick={removeDiscount}>Xóa</button>
                  </div>
                )}
                {discountError && <p className="error-text">{discountError}</p>}
              </div>
              {discount && (
                <div className="summary-row discount-row">
                  <span>Giảm giá</span>
                  <span className="discount-amount">-{discountAmount.toLocaleString()} ₫</span>
                </div>
              )}
              <div className="summary-row total-row">
                <strong>Tổng</strong>
                <strong>{finalPrice.toLocaleString()} ₫</strong>
              </div>
              {/* Hình thức thanh toán */}
              <div className="payment-method-section">
                <label className="payment-method-label">Hình thức thanh toán:</label>
                <div className="payment-method-options">
                  <label>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={paymentMethod === "cash"}
                      onChange={() => setPaymentMethod("cash")}
                    />
                    Tiền mặt khi nhận hàng
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank"
                      checked={paymentMethod === "bank"}
                      onChange={() => setPaymentMethod("bank")}
                    />
                    Chuyển khoản ngân hàng
                  </label>
                </div>
              </div>
              <div className="cart-actions">
                <button
                  className="checkout-button"
                  onClick={handleCheckout}
                  disabled={selectedItems.length === 0}
                  type="button"
                >
                  Đặt hàng đã chọn
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default CartPage;
