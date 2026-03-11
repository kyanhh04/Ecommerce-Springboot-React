import React, { useState } from "react";
import "../../style/navbar.css";
import { NavLink, useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";

import { FaUser, FaShoppingCart } from "react-icons/fa";
import { MdFavoriteBorder } from "react-icons/md";
import { IoFlash } from "react-icons/io5";

const Navbar = () => {

    const [searchValue, setSearchValue] = useState("");
    const navigate = useNavigate();

    const isAuthenticated = ApiService.isAuthenticated();

    const handleSearchSubmit = async (e) => {

        e.preventDefault();

        const keyword = searchValue.toLowerCase().trim();
        const words = keyword.split(" ");

        try {

            const response = await ApiService.getAllCategory();
            const categories = response.categoryList || [];

            let bestMatch = null;
            let maxScore = 0;

            categories.forEach(cat => {

                const categoryName = cat.name.toLowerCase();
                let score = 0;

                words.forEach(word => {
                    if (categoryName.includes(word)) {
                        score++;
                    }
                });

                if (score > maxScore) {
                    maxScore = score;
                    bestMatch = cat;
                }

            });

            if (bestMatch && maxScore > 0) {
                navigate(`/category/${bestMatch.id}`);
            } else {
                navigate(`/categories?search=${searchValue}`);
            }

            setSearchValue("");

        } catch (error) {

            navigate(`/categories?search=${searchValue}`);
            setSearchValue("");

        }

    };

    return (

        <nav className="navbar">

            <NavLink
                to="/"
                className="nav-logo"
                onClick={() => setSearchValue("")}
            >
                <IoFlash className="logo-icon"/>
                <span>TechNova</span>
            </NavLink>

            <form className="nav-search" onSubmit={handleSearchSubmit}>
                <input
                    type="text"
                    placeholder="Tìm sản phẩm, thương hiệu..."
                    value={searchValue}
                    onChange={(e)=>setSearchValue(e.target.value)}
                />
            </form>

            <div className="nav-menu">

                <NavLink to="/categories">Danh mục</NavLink>
                <NavLink to="/deals">Khuyến mãi</NavLink>
                <NavLink to="/support">Hỗ trợ</NavLink>

                {isAuthenticated && (
                    <NavLink to="/profile">
                        <FaUser/>
                    </NavLink>
                )}

                <NavLink>
                    <MdFavoriteBorder/>
                </NavLink>

                <NavLink to="/cart" className="cart-icon">
                    <FaShoppingCart/>
                </NavLink>

            </div>

        </nav>
    );
};

export default Navbar;