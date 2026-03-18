import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import "../../style/wishlist.css";

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await ApiService.getWishlist();
      setWishlist(res.wishlistList || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await ApiService.removeFromWishlist(productId);
      setWishlist((prev) => prev.filter((item) => item.product.id !== productId));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="wishlist-page"><p>Đang tải...</p></div>;

  return (
    <div className="wishlist-page">
      <h2>Sản phẩm yêu thích</h2>
      {wishlist.length === 0 ? (
        <p className="empty">Bạn chưa có sản phẩm yêu thích nào.</p>
      ) : (
        <div className="wishlist-grid">
          {wishlist.map((item) => (
            <div key={item.id} className="wishlist-card">
              <img
                src={item.product.imageUrl || "/placeholder.png"}
                alt={item.product.name}
                onClick={() => navigate(`/product/${item.product.id}`)}
              />
              <div className="wishlist-info">
                <h4 onClick={() => navigate(`/product/${item.product.id}`)}>{item.product.name}</h4>
                <p>{item.product.price?.toLocaleString()}đ</p>
              </div>
              <button className="btn-remove" onClick={() => handleRemove(item.product.id)}>
                ✕ Xóa
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
