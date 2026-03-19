import React, { useState } from "react";
import "../../style/navbar.css";
import { NavLink, useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";

import { FaUser, FaShoppingCart, FaHeart, FaSignOutAlt } from "react-icons/fa";
import { RiAdminFill } from "react-icons/ri";
import { FiSearch } from "react-icons/fi";

import { useCart } from "../context/CartContext"; // import cart context

const Navbar = () => {
    const [searchValue, setSearchValue] = useState("");
    const navigate = useNavigate();

    const { cart } = useCart(); // lấy giỏ hàng từ context
    // Số loại sản phẩm khác nhau trong giỏ
    const cartItemCount = cart.length;

    const isAdmin = ApiService.isAdmin();
    const isAuthenticated = ApiService.isAuthenticated();

    const handleSearchChange = (e) => {
        setSearchValue(e.target.value);
    };

    const handleSearchSubmit = async (e) => {
        e.preventDefault();

        const keyword = searchValue.trim().toLowerCase();
        if (!keyword) return;

        try {
            const response = await ApiService.getAllCategory();
            const categories = response.categoryList || [];

            const foundCategory = categories.find(cate =>
                cate.name.toLowerCase().includes(keyword)
            );

            if (foundCategory) {
                navigate(`/category/${foundCategory.id}?search=${searchValue}`);
            } else {
                alert("Không tìm thấy danh mục phù hợp");
            }
        } catch (error) {
            console.log("Search error:", error);
        }

        setSearchValue("");
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
                />
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