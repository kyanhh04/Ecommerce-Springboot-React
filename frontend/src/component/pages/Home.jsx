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

        setFeaturedProducts(allProducts.slice(0,4));

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
          "Không thể tải sản phẩm"
        );

      }

    };

    fetchProducts();

  }, [location.search,currentPage]);


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
                state: { orderSuccess }
              })
            }
          >
            Xem chi tiết đơn hàng
          </button>

        </div>

      )}


      {/* HERO */}

      <section className="hero-section">

        <div className="hero-content">

          <span className="hero-tag">
            Sản phẩm mới
          </span>

          <h1>
            Tương lai của công nghệ <span>đã đến.</span>
          </h1>

          <p>
            Trải nghiệm hiệu năng mạnh mẽ với chip thế hệ mới và thiết kế cao cấp.
            Laptop gaming, học tập, làm việc – tất cả đều có tại đây.
          </p>

          <div className="hero-buttons">

            <button
              className="hero-btn primary"
              onClick={() =>
                window.scrollTo({
                  top: 800,
                  behavior: "smooth"
                })
              }
            >
              Mua ngay
            </button>

            <button className="hero-btn secondary">
              Tìm hiểu thêm
            </button>

          </div>

        </div>

        <div className="hero-image">

          <img
            src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800"
            alt="Laptop"
          />

        </div>

      </section>



      {/* HÃNG LAPTOP */}

      <section className="brand-section">

        <h2>CÁC HÃNG LAPTOP NỔI BẬT</h2>

        <div className="brand-grid">

          <div className="brand-card">
            <img src="https://images.unsplash.com/photo-1593642702749-b7d2a804fbcf?w=800" />
            <div className="brand-overlay">
              <h3>ASUS VIVOBOOK</h3>
            </div>
          </div>

          <div className="brand-card">
            <img src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800" />
            <div className="brand-overlay">
              <h3>MACBOOK AIR</h3>
            </div>
          </div>

          <div className="brand-card">
            <img src="https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800" />
            <div className="brand-overlay">
              <h3>LENOVO LOQ</h3>
            </div>
          </div>

          <div className="brand-card">
            <img src="https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800" />
            <div className="brand-overlay">
              <h3>DELL XPS</h3>
            </div>
          </div>

        </div>

      </section>



      {/* DANH MỤC */}

      <section className="category-section">

        <h2>Mua sắm theo danh mục</h2>

        <div className="category-grid">

          <div className="category-card" onClick={()=>navigate("/category/1")}>
            <div className="category-icon"><FaLaptop/></div>
            <p>Laptop</p>
          </div>

          <div className="category-card" onClick={()=>navigate("/category/2")}>
            <div className="category-icon"><BsMouse/></div>
            <p>Chuột máy tính</p>
          </div>

          <div className="category-card" onClick={()=>navigate("/category/3")}>
            <div className="category-icon"><FaKeyboard/></div>
            <p>Bàn phím</p>
          </div>

          <div className="category-card" onClick={()=>navigate("/category/4")}>
            <div className="category-icon"><FaHeadphones/></div>
            <p>Tai nghe</p>
          </div>

          <div className="category-card" onClick={()=>navigate("/category/5")}>
            <div className="category-icon"><FaHdd/></div>
            <p>Ổ cứng / SSD</p>
          </div>

        </div>

      </section>



      {/* SẢN PHẨM NỔI BẬT */}

      <section className="featured-section">

        <h2>Sản phẩm nổi bật</h2>

        <ProductList products={featuredProducts}/>

      </section>



      {/* TẤT CẢ SẢN PHẨM */}

      <section className="product-section">

        <h2>Tất cả sản phẩm</h2>

        {error ? (

          <p className="error-message">{error}</p>

        ) : (

          <>

            <ProductList products={products}/>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page)=>setCurrentPage(page)}
            />

          </>

        )}

      </section>

    </div>

  );

};

export default Home;