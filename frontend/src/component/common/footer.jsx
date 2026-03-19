import React from "react";
import "../../style/footer.css";
import { NavLink } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Logo + mô tả */}
        <div className="footer-col">
          <h2 className="footer-logo">TechNova</h2>
          <p>
            Chuyên cung cấp laptop chính hãng, giá tốt, bảo hành uy tín. Cam kết
            chất lượng và dịch vụ tốt nhất cho khách hàng.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h3>Quick Links</h3>
          <ul>
            <li>
              <NavLink to="/about">About Us</NavLink>
            </li>
            <li>
              <NavLink to="/faqs">FAQs</NavLink>
            </li>
          </ul>
        </div>

        {/* Policies */}
        <div className="footer-col">
          <h3>Policies</h3>
          <ul>
            <li>
              <NavLink to="/terms">Terms & Conditions</NavLink>
            </li>
            <li>
              <NavLink to="/privacy">Privacy Policy</NavLink>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-col">
          <h3>Contact Info</h3>
          <p>Email: support@laptopstore.com</p>
          <p>Phone: 0123 456 789</p>
          <p>Address: Hà Nội, Việt Nam</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
