import React, { useState } from "react";
import "../../style/navbar.css";
import { NavLink, useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import { useCart } from "../context/CartContext";
import logo from "../../asset/logo.png";

import { FaHome, FaUser, FaShoppingCart, FaSignOutAlt, FaSignInAlt } from "react-icons/fa";
import { MdCategory } from "react-icons/md";
import { RiAdminFill } from "react-icons/ri";

const Navbar = () => {

    const [searchValue, setSearchValue] = useState("");
    const navigate = useNavigate();
    const { cart } = useCart();

    const isAdmin = ApiService.isAdmin();
    const isAuthenticated = ApiService.isAuthenticated();
    
    const cartItemCount = cart.length;

    const handleSearchChange = (e) => {
        setSearchValue(e.target.value);
    };

    const handleSearchSubmit = async (e) => {
        e.preventDefault();

        if (!searchValue.trim()) return;

        try {

            const response = await ApiService.searchProducts(searchValue);
            const products = response.productList || [];

            if (products.length > 0) {

                const categoryId = products[0].category?.id || products[0].categoryId;

                navigate(`/category/${categoryId}?search=${searchValue}`);

            } else {

                alert("Không tìm thấy sản phẩm");

            }

        } catch (error) {

            console.log("Search error:", error);

        }

        setSearchValue("");
    };

    const handleLogout = () => {
        const confirm = window.confirm("Are you sure you want to logout?");
        if (confirm) {
            ApiService.logout();
            setTimeout(() => {
                navigate("/login");
            }, 500);
        }
    };

    return (
        <nav className="navbar">

            <div className="navbar-brand">
                <NavLink to="/">
                    <span>TechNova</span>
                </NavLink>
            </div>

            <form className="navbar-search" onSubmit={handleSearchSubmit}>
                <input
                    type="text"
                    placeholder="Search products"
                    autoComplete="off"
                    value={searchValue}
                    onChange={handleSearchChange}
                />
                <button type="submit">Search</button>
            </form>

            <div className="navbar-link">

                <NavLink to="/" title="Home">
                    <FaHome />
                </NavLink>

                <NavLink to="/categories" title="Categories">
                    <MdCategory />
                </NavLink>

                {isAuthenticated && (
                    <NavLink to="/profile" title="Profile">
                        <FaUser />
                    </NavLink>
                )}

                {isAdmin && (
                    <NavLink to="/admin" title="Admin">
                        <RiAdminFill />
                    </NavLink>
                )}

                {!isAuthenticated && (
                    <NavLink to="/login" title="Login">
                        <FaSignInAlt />
                    </NavLink>
                )}

                {isAuthenticated && (
                    <NavLink onClick={handleLogout} title="Logout">
                        <FaSignOutAlt />
                    </NavLink>
                )}

                <NavLink to="/cart" title="Cart" className="cart-link">
                    <FaShoppingCart />
                    {cartItemCount > 0 && (
                        <span className="cart-badge">{cartItemCount}</span>
                    )}
                </NavLink>

            </div>

        </nav>
    );
};

export default Navbar;