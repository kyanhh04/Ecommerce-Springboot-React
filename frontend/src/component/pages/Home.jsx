import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProductList from "../common/ProductList";
import Pagination from "../common/Pagination";
import ApiService from "../../service/ApiService";
import "../../style/home.css";

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const itemsPerPage = 8;

  useEffect(() => {
    setCurrentPage(1);
  }, [location.search]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let allProducts = [];
        const queryparams = new URLSearchParams(location.search);
        const searchItem = queryparams.get("search");

        if (searchItem) {
          const response = await ApiService.searchProducts(searchItem);
          allProducts = response.productList || [];
        } else {
          const response = await ApiService.getAllProducts();
          allProducts = response.productList || [];
        }

        // 4 sản phẩm nổi bật
        setFeaturedProducts(allProducts.slice(0, 4));

        setTotalPages(Math.ceil(allProducts.length / itemsPerPage));

        setProducts(
          allProducts.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
          )
        );
      } catch (error) {
        setError(
          error.response?.data?.message ||
            error.message ||
            "Unable to fetch products"
        );
      }
    };

    fetchProducts();
  }, [location.search, currentPage]);

  const orderSuccess = location.state?.orderSuccess;

  return (
    <div className="home">

      {orderSuccess && (
        <div className="order-success-banner">
          <div className="order-success-text">
            <div className="order-success-title">
              Đặt hàng thành công! 
            </div>
            <div className="order-success-subtitle">
              Mã đơn: <strong>#{orderSuccess.orderId}</strong> · Tổng thanh toán{" "}
              <strong>{orderSuccess.amount.toLocaleString()}đ</strong>
            </div>
          </div>
          <button
            className="order-success-button"
            onClick={() =>
              navigate("/order-success", {
                state: { orderSuccess },
              })
            }
          >
            Xem chi tiết đơn hàng
          </button>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Laptop Chính Hãng - Giá Tốt Nhất</h1>
          <p>Gaming | Văn phòng | Sinh viên | Đồ họa</p>
          <button onClick={() => window.scrollTo({ top: 800, behavior: "smooth" })}>
            Khám phá ngay
          </button>
        </div>
      </section>

      {/* BRAND BANNER SECTION */}
      <section className="brand-section">
        <h2>CÁC HÃNG LAPTOP NỔI BẬT</h2>

        <div className="brand-grid">

          <div className="brand-card">
            <img src="https://images.unsplash.com/photo-1593642702749-b7d2a804fbcf?w=500&q=80" alt="ASUS" />
            <div className="brand-overlay">
              <h3>ASUS VIVOBOOK </h3>

            </div>
          </div>

          <div className="brand-card">
            <img src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80" alt="Macbook" />
            <div className="brand-overlay">
              <h3>MACBOOK AIR </h3>

            </div>
          </div>

          <div className="brand-card">
            <img src="https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&q=80" alt="Lenovo" />
            <div className="brand-overlay">
              <h3>LENOVO LOQ </h3>

            </div>
          </div>

          <div className="brand-card">
            <img src="https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500&q=80" alt="Dell" />
            <div className="brand-overlay">
              <h3>DELL 15 2025</h3>

            </div>
          </div>

        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="featured-section">
        <h2>Sản phẩm nổi bật</h2>
        <ProductList products={featuredProducts} />
      </section>

      {/* ALL PRODUCTS */}
      <section className="product-section">
        <h2>Tất cả sản phẩm</h2>

        {error ? (
          <p className="error-message">{error}</p>
        ) : (
          <>
            <ProductList products={products} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </>
        )}
      </section>

    </div>
  );
};

export default Home;