import React, { useState, useEffect, useRef } from "react";
import "../../style/navbar.css";
import { NavLink, useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";

import { FaUser, FaShoppingCart, FaHeart } from "react-icons/fa";
import { RiAdminFill } from "react-icons/ri";
import { FiSearch } from "react-icons/fi";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);

  const userMenuRef = useRef();
  const navigate = useNavigate();
  const { cart } = useCart();
  const cartItemCount = cart.length;

  const isAdmin = ApiService.isAdmin();
  const isAuthenticated = ApiService.isAuthenticated();

  // Lấy số lượng wishlist khi mount
  useEffect(() => {
    const fetchWishlistCount = async () => {
      if (isAuthenticated) {
        try {
          const response = await ApiService.getLoggedInUserInfo();
          setWishlistCount(response.user.wishlist?.length || 0);
        } catch (error) {
          setWishlistCount(0);
        }
      }
    };
    fetchWishlistCount();
  }, [isAuthenticated]);

  // Search product
  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchValue(value);

    if (value.trim().length > 0) {
      try {
        const response = await ApiService.searchProducts(value.trim());
        setSearchResults(response.productList || []);
        setShowDropdown(true);
      } catch (error) {
        setSearchResults([]);
        setShowDropdown(false);
      }
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const handleSearchFocus = () => {
    if (searchValue.trim().length > 0 && searchResults.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const keyword = searchValue.trim();
    if (!keyword) return;

    navigate(`/?search=${encodeURIComponent(keyword)}`);
    setSearchValue("");
    setShowDropdown(false);
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
    setSearchValue("");
    setShowDropdown(false);
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Bạn có chắc muốn đăng xuất không?");
    if (confirmLogout) {
      ApiService.logout();
      setShowUserMenu(false);
      navigate("/login");
    }
  };

  // Click outside để đóng user menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <div className="logo">
        <NavLink to="/">TechNova</NavLink>
      </div>

      <form className="search-box" onSubmit={handleSearchSubmit}>
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm ..."
          value={searchValue}
          onChange={handleSearchChange}
          onFocus={handleSearchFocus}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        />
        {showDropdown && searchResults.length > 0 && (
          <div className="search-dropdown">
            {searchResults.slice(0, 5).map((product) => (
              <div
                key={product.id}
                className="search-item"
                onClick={() => handleProductClick(product.id)}
              >
                <img src={product.imageUrl} alt={product.name} />
                <div className="search-item-info">
                  <p className="search-item-name">{product.name}</p>
                  <p className="search-item-price">{product.price.toLocaleString()} ₫</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </form>

      <div className="menu">
        <NavLink to="/">Trang chủ</NavLink>
        <NavLink to="/categories">Danh mục</NavLink>
      </div>

      <div className="icons">
        {isAuthenticated && (
          <div className="user-menu" ref={userMenuRef}>
            <FaUser
              className="user-icon"
              onClick={() => setShowUserMenu(!showUserMenu)}
            />
            {showUserMenu && (
              <div className="user-dropdown">
                <div onClick={() => { navigate("/profile"); setShowUserMenu(false); }}>Tài khoản cá nhân</div>
                <div onClick={() => { navigate("/my-orders"); setShowUserMenu(false); }}>Đơn hàng của tôi</div>
                <div onClick={handleLogout}>Đăng xuất</div>
              </div>
            )}
          </div>
        )}

        <NavLink to="/wishlist" className="wishlist">
          <FaHeart />
          {wishlistCount > 0 && (
            <span className="wishlist-count">{wishlistCount}</span>
          )}
        </NavLink>

        <NavLink to="/cart" className="cart">
          <FaShoppingCart />
          {cartItemCount > 0 && (
            <span className="cart-count">{cartItemCount}</span>
          )}
        </NavLink>

        {isAdmin && <NavLink to="/admin"><RiAdminFill /></NavLink>}
      </div>
    </nav>
  );
};

export default Navbar;