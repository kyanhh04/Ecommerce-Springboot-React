import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import { useCart } from "../context/CartContext";
import "../../style/cart.css";
const CartPage = () => {
  const { cart, dispatch } = useCart();
  const [message, setMessage] = useState(null);
  const [discountCode, setDiscountCode] = useState("");
  const [discount, setDiscount] = useState(null);
  const [discountError, setDiscountError] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [displayCount, setDisplayCount] = useState(5);
  const hasUserInteractedRef = useRef(false);
  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (cart.length === 0) {
      setSelectedIds([]);
      hasUserInteractedRef.current = false;
      return;
    }

    const cartIdSet = new Set(cart.map((i) => i.id));
    if (!hasUserInteractedRef.current) {
      setSelectedIds(cart.map((i) => i.id));
      return;
    }

    // Keep only selected ids that still exist in cart
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
        setMessage("Áp dụng mã giảm giá thành công!");
        setTimeout(() => setMessage(""), 3000);
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
    setMessage("Đã xóa mã giảm giá");
    setTimeout(() => setMessage(""), 2000);
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
      setMessage("Bạn chưa chọn sản phẩm nào để xóa");
      setTimeout(() => setMessage(""), 2000);
      return;
    }

    dispatch({ type: "REMOVE_ITEMS", payload: { ids: selectedIds } });
    setSelectedIds([]);
    hasUserInteractedRef.current = true;
    setMessage("Đã xóa sản phẩm đã chọn");
    setTimeout(() => setMessage(""), 2000);
  };

  const handleEditToggle = () => {
    setEditMode((prev) => !prev);
  };

  const handleCheckout = async () => {
    if (!ApiService.isAuthenticated()) {
      setMessage("Bạn cần đăng nhập trước khi đặt hàng");
      setTimeout(() => {
        setMessage("");
        navigate("/login");
      }, 3000);
      return;
    }

    if (selectedItems.length === 0) {
      setMessage("Vui lòng chọn ít nhất 1 sản phẩm để đặt hàng");
      setTimeout(() => setMessage(""), 2500);
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
    };
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
      } else {
        setMessage("Đặt hàng thất bại");
      }
    } catch (error) {
      setMessage("Đặt hàng thất bại");
      setTimeout(() => setMessage(""), 3000);
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
        {message && <p className="response-message">{message}</p>}
        {cart.length === 0 ? (
          <div className="empty-cart-wrapper">
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
                  {!editMode ? (
                    <button
                      type="button"
                      className="edit-button"
                      onClick={handleEditToggle}
                    >
                      Chỉnh sửa
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="remove-selected-button"
                        onClick={handleRemoveSelected}
                        disabled={selectedIds.length === 0}
                      >
                        Xóa đã chọn
                      </button>
                      <button
                        type="button"
                        className="cancel-button"
                        onClick={handleEditToggle}
                      >
                        Hủy
                      </button>
                    </>
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
              <div className="discount-section">
                {!discount ? (
                  <div className="discount-input-group">
                    <input
                      type="text"
                      placeholder="Nhập mã"
                      value={discountCode}
                      onChange={(e) =>
                        setDiscountCode(e.target.value.toUpperCase())
                      }
                    />
                    <button onClick={applyDiscount}>Áp dụng</button>
                  </div>
                ) : (
                  <div className="discount-input-group">
                    <span>{discount.code}</span>
                    <button onClick={removeDiscount}>Xóa</button>
                  </div>
                )}
                {discountError && <p className="error-text">{discountError}</p>}
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
