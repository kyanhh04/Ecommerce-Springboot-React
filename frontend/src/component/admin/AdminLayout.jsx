import React from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import '../../style/adminPage.css';

const NAV_ITEMS = [
    {
        label: "Báo cáo doanh thu", path: "/admin",
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
    },
    {
        label: "Quản lý danh mục", path: "/admin/categories",
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
    },
    {
        label: "Quản lý sản phẩm", path: "/admin/products",
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
    },
    {
        label: "Quản lý đơn hàng", path: "/admin/orders",
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
    },
    {
        label: "Quản lý giảm giá", path: "/admin/discounts",
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
    },
    {
        label: "Quản lý đánh giá", path: "/admin/reviews",
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    },
];

// Form pages that should be centered
const CENTERED_PATHS = [
    "/admin/add-category", "/admin/edit-category",
    "/admin/add-product",  "/admin/edit-product",
    "/admin/add-discount", "/admin/edit-discount",
];

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => {
        if (path === "/admin") return location.pathname === "/admin";
        return location.pathname.startsWith(path);
    };

    const isCentered = CENTERED_PATHS.some(p => location.pathname.startsWith(p));

    return (
        <div className="admin-page">
            <div className="admin-layout">
                <aside className="admin-sidebar">
                    <div className="admin-sidebar-nav">
                        <h1 className="admin-logo" onClick={() => navigate("/")}>TechNova</h1>
                        {NAV_ITEMS.map(({ label, path, icon }) => (
                            <button
                                key={path}
                                className={isActive(path) ? "active" : ""}
                                onClick={() => navigate(path)}
                            >
                                <span className="nav-icon">{icon}</span>
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="sidebar-banner">
                        <svg viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg">
                            {/* Laptop body */}
                            <rect x="20" y="15" width="120" height="75" rx="6" fill="#1f2937"/>
                            <rect x="26" y="20" width="108" height="62" rx="3" fill="#f68b1e" opacity="0.15"/>
                            <rect x="26" y="20" width="108" height="62" rx="3" fill="none" stroke="#f68b1e" strokeWidth="1.5"/>
                            {/* Screen content */}
                            <rect x="34" y="27" width="92" height="8" rx="2" fill="#f68b1e" opacity="0.6"/>
                            <rect x="34" y="40" width="60" height="4" rx="2" fill="#6b7280" opacity="0.5"/>
                            <rect x="34" y="48" width="80" height="4" rx="2" fill="#6b7280" opacity="0.4"/>
                            <rect x="34" y="56" width="50" height="4" rx="2" fill="#6b7280" opacity="0.3"/>
                            <rect x="34" y="64" width="40" height="10" rx="3" fill="#f68b1e" opacity="0.8"/>
                            {/* Base */}
                            <rect x="10" y="90" width="140" height="6" rx="3" fill="#374151"/>
                            <rect x="55" y="88" width="50" height="4" rx="2" fill="#4b5563"/>
                        </svg>
                        <p className="banner-title">TechNova Admin</p>
                        <p className="banner-sub">Laptop & Phụ kiện</p>
                    </div>
                </aside>
                <main className="admin-main">
                    <div className={isCentered ? "admin-content-centered" : ""}>
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
