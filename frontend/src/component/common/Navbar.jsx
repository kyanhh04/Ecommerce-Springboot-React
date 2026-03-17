import React, { useState } from "react";
import "../../style/navbar.css";
import { NavLink, useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";

import { FaUser, FaShoppingCart, FaHeart, FaSignOutAlt } from "react-icons/fa";
import { MdCategory } from "react-icons/md";
import { RiAdminFill } from "react-icons/ri";
import { FiSearch } from "react-icons/fi";

const Navbar = () => {

    const [searchValue, setSearchValue] = useState("");
    const navigate = useNavigate();

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

                navigate(`/category/${foundCategory.id}`);

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
                <NavLink to="/">⚡ TechNova</NavLink>
            </div>

            {/* SEARCH */}
            <form className="search-box" onSubmit={handleSearchSubmit}>

                <FiSearch className="search-icon" />

                <input
                    type="text"
                    placeholder="Search products, brands..."
                    value={searchValue}
                    onChange={handleSearchChange}
                />

            </form>


            <div className="menu">

                <NavLink to="/categories">
                    Categories
                </NavLink>

                <NavLink to="/support">
                    Support
                </NavLink>

            </div>

            {/* ICONS */}
            <div className="icons">

                {isAuthenticated && (
                    <NavLink to="/profile">
                        <FaUser />
                    </NavLink>
                )}

                <NavLink to="/wishlist">
                    <FaHeart />
                </NavLink>

                <NavLink to="/cart" className="cart">
                    <FaShoppingCart />

                </NavLink>

                {isAdmin && (
                    <NavLink to="/admin">
                        <RiAdminFill />
                    </NavLink>
                )}

                {/* LOGOUT */}
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