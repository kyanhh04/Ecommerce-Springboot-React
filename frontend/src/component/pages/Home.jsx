import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProductList from "../common/ProductList";
import Pagination from "../common/Pagination";
import ApiService from "../../service/ApiService";
import { FaLaptop, FaKeyboard, FaHeadphones, FaHdd, FaCheckCircle } from "react-icons/fa";
import { BsMouse } from "react-icons/bs";
import { HiX } from "react-icons/hi";
import "../../style/home.css";

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState(null);

  const itemsPerPage = 8;

  const slides = [
    {
      title: "Chuột gaming",
      subtitle: "Độ chính xác tuyệt đối",
      img: "https://images.unsplash.com/photo-1527814050087-3793815479db",
      categoryId: 2, // Chuột
    },
    {
      title: "Bàn phím cơ",
      subtitle: "Nâng tầm trải nghiệm gõ phím",
      img: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae",
      categoryId: 3, // Bàn phím
    },
    {
      title: "Tai nghe cao cấp",
      subtitle: "Trải nghiệm âm thanh đỉnh cao",
      img: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800",
      categoryId: 4, // Tai nghe
    },
    {
      title: "Ổ cứng SSD",
      subtitle: "Tốc độ vượt trội",
      img: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1600",
      categoryId: 5, // Ổ cứng
    },
    {
      title: "Laptop Gaming",
      subtitle: "Hiệu năng mạnh mẽ",
      img: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1600",
      categoryId: 1, // Laptop
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    if (location.state?.orderSuccess) {
      setOrderSuccessData(location.state.orderSuccess);
      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 8000);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    setCurrentPage(1);
  }, [location.search]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let allProducts = [];
        const queryParams = new URLSearchParams(location.search);
        const searchItem = queryParams.get("search");

        if (searchItem) {
          const response = await ApiService.searchProducts(searchItem);
          allProducts = response.productList || [];
        } else {
          const response = await ApiService.getAllProducts();
          allProducts = response.productList || [];
        }

        setFeaturedProducts(allProducts.slice(0, 4));
        setTotalPages(Math.ceil(allProducts.length / itemsPerPage));
        setProducts(
          allProducts.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage,
          ),
        );
      } catch (error) {
        setError(
          error.response?.data?.message ||
            error.message ||
            "Không thể tải sản phẩm",
        );
      }
    };
    fetchProducts();
  }, [location.search, currentPage]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await ApiService.getAllCategory();
        setCategories(response.categoryList || []);
      } catch (error) {
        console.error("Không thể tải danh mục:", error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="home">
      {showSuccessNotification && orderSuccessData && (
        <div className="success-notification">
          <div className="success-card">
            <button 
              className="close-btn"
              onClick={() => setShowSuccessNotification(false)}
              aria-label="Đóng thông báo"
            >
              <HiX />
            </button>
            
            <div className="success-icon">
              <FaCheckCircle />
            </div>
            
            <h3>Đặt hàng thành công!</h3>
            <p className="success-message">
              Cảm ơn bạn đã tin tưởng. Đơn hàng đang được xử lý.
            </p>
            
            <div className="order-info">
              <div className="info-row">
                <span className="label">Mã đơn hàng</span>
                <span className="value">#{orderSuccessData.orderId}</span>
              </div>
              <div className="info-row">
                <span className="label">Tổng tiền</span>
                <span className="value">{orderSuccessData.amount?.toLocaleString()}đ</span>
              </div>
            </div>

            {orderSuccessData.paymentMethod === "CASH" ? (
              <p className="payment-note">Vui lòng chuẩn bị tiền mặt khi nhận hàng</p>
            ) : (
              <p className="payment-note">Thanh toán đã được xác nhận</p>
            )}
          </div>
        </div>
      )}

      <section className="hero-section">
        <div className="hero-slider">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`hero-slide ${index === currentSlide ? "active" : ""}`}
            >
              <img src={slide.img} alt={slide.title} className="hero-bg" />
              <div className="hero-overlay">
                <div className="hero-content">
                  <span className="hero-label">Bộ sưu tập mới</span>
                  <h1 className="hero-title">{slide.title}</h1>
                  <p className="hero-subtitle">{slide.subtitle}</p>
                  <button
                    className="hero-btn"
                    onClick={() => {
                      const productSection = document.getElementById('product-section');
                      if (productSection) {
                        productSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                  >
                    Khám phá ngay
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="slider-dots">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentSlide ? "active" : ""}`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Chuyển đến slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="category-section" id="category-section">
        <div className="section-header">
          <h2>Danh mục sản phẩm</h2>
          <p>Khám phá các danh mục phổ biến</p>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <div
              key={category.id}
              className="category-card"
              onClick={() => navigate(`/category/${category.id}`)}
            >
              <div className="category-icon">
                {category.id === 1 && <FaLaptop />}
                {category.id === 2 && <BsMouse />}
                {category.id === 3 && <FaKeyboard />}
                {category.id === 4 && <FaHeadphones />}
                {category.id === 5 && <FaHdd />}
              </div>
              <h3>{category.name}</h3>
            </div>
          ))}
        </div>
      </section>

      <section className="featured-section">
        <div className="section-header">
          <h2>Sản phẩm nổi bật</h2>
          <p>Tuyển chọn những sản phẩm chất lượng cao</p>
        </div>
        <ProductList products={featuredProducts} />
      </section>

      <section className="product-section" id="product-section">
        <div className="section-header">
          <h2>Tất cả sản phẩm</h2>
        </div>

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
