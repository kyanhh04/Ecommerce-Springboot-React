import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProductList from "../common/ProductList";
import Pagination from "../common/Pagination";
import ApiService from "../../service/ApiService";
import { FaLaptop, FaKeyboard, FaHeadphones, FaHdd } from "react-icons/fa";
import { BsMouse } from "react-icons/bs";
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

  // 🔥 SLIDER DATA (đã thêm categoryId)
  const slides = [
    {
      title: "Tai nghe cao cấp",
      img: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800",
      categoryId: 4,
    },
    {
      title: "Bàn phím cơ",
      img: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae",
      categoryId: 3,
    },
    {
      title: "Chuột gaming",
      img: "https://images.unsplash.com/photo-1527814050087-3793815479db",
      categoryId: 2,
    },
    {
      title: "Ổ cứng SSD",
      img: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1600",
      categoryId: 5,
    },
    {
      title: "Laptop Gaming",
      img: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800",
      categoryId: 1,
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  // 🔥 AUTO SLIDE
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

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

  return (
    <div className="home">
      <section className="hero-section">
        <div className="hero-slider">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`hero-slide ${index === currentSlide ? "active" : ""}`}
            >
              <img src={slide.img} alt="banner" className="hero-bg" />

              <div className="hero-overlay">
                <span className="hero-subtitle">BỘ SƯU TẬP MỚI</span>
                <h1>{slide.title}</h1>
                <button
                  className="hero-btn primary"
                  onClick={() => navigate(`/category/${slide.categoryId}`)}
                >
                  Khám phá ngay
                </button>
              </div>
            </div>
          ))}

          {/* DOTS */}
          <div className="slider-dots">
            {slides.map((_, index) => (
              <span
                key={index}
                className={index === currentSlide ? "dot active" : "dot"}
                onClick={() => setCurrentSlide(index)}
              ></span>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORY */}
      <section className="category-section">
        <h2>Mua sắm theo danh mục</h2>

        <div className="category-grid">
          <div
            className="category-card"
            onClick={() => navigate("/category/1")}
          >
            <div className="category-icon">
              <FaLaptop />
            </div>
            <p>Laptop</p>
          </div>

          <div
            className="category-card"
            onClick={() => navigate("/category/2")}
          >
            <div className="category-icon">
              <BsMouse />
            </div>
            <p>Chuột</p>
          </div>

          <div
            className="category-card"
            onClick={() => navigate("/category/3")}
          >
            <div className="category-icon">
              <FaKeyboard />
            </div>
            <p>Bàn phím</p>
          </div>

          <div
            className="category-card"
            onClick={() => navigate("/category/4")}
          >
            <div className="category-icon">
              <FaHeadphones />
            </div>
            <p>Tai nghe</p>
          </div>

          <div
            className="category-card"
            onClick={() => navigate("/category/5")}
          >
            <div className="category-icon">
              <FaHdd />
            </div>
            <p>Ổ cứng</p>
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="featured-section">
        <h2>Sản phẩm nổi bật</h2>
        <h4> Tuyển tập những sản phẩm hiện đại, hiệu năng cao</h4>
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
