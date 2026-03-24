import React, { useState } from "react";
import "../../style/navbar.css";
import { NavLink, useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";

import { FaUser, FaShoppingCart, FaHeart, FaSignOutAlt } from "react-icons/fa";
import { RiAdminFill } from "react-icons/ri";
import { FiSearch } from "react-icons/fi";
import { useCart } from "../context/CartContext"; 
const Navbar = () => {
    const [searchValue, setSearchValue] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();

    const { cart } = useCart(); 
    const cartItemCount = cart.length;
    const isAdmin = ApiService.isAdmin();
    const isAuthenticated = ApiService.isAuthenticated();

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
        // Show dropdown if there are existing results
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

    // LOGOUT FUNCTION
    const handleLogout = () => {
        const confirmLogout = window.confirm("Bạn có chắc muốn đăng xuất không?");
        if (confirmLogout) {
            ApiService.logout();
            navigate("/login");
        }
    };

    return (
        <nav className="navbar">

            {/* LOGO */}
            <div className="logo">
                <NavLink to="/">TechNova</NavLink>
            </div>

            {/* SEARCH */}
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

            {/* ICONS */}
            <div className="icons">
                {isAuthenticated && (
                    <NavLink to="/profile"><FaUser /></NavLink>
                )}

                <NavLink to="/wishlist"><FaHeart /></NavLink>

                <NavLink to="/cart" className="cart">
                    <FaShoppingCart />
                    {cartItemCount > 0 && (
                        <span className="cart-count">{cartItemCount}</span>
                    )}
                </NavLink>

                {isAdmin && (
                    <NavLink to="/admin"><RiAdminFill /></NavLink>
                )}

                {isAuthenticated && (
                    <button className="logout-btn" onClick={handleLogout}>
                        <FaSignOutAlt />
                    </button>
                )}
            </div>

        </nav>
    );
};

export default Navbar;