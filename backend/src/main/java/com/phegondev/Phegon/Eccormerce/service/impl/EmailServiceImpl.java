package com.phegondev.Phegon.Eccormerce.service.impl;

import com.phegondev.Phegon.Eccormerce.entity.Order;
import com.phegondev.Phegon.Eccormerce.entity.OrderItem;
import com.phegondev.Phegon.Eccormerce.entity.User;
import com.phegondev.Phegon.Eccormerce.service.interf.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.javamail.JavaMailSender;
import jakarta.mail.internet.MimeMessage;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender javaMailSender;

    @Override
    public void sendOTPEmail(User user, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(user.getEmail());
            message.setSubject("Mã OTP của bạn - Ecommerce");
            message.setText("Mã OTP xác thực của bạn là: " + otp +
                    "\n\nMã này có hiệu lực trong 10 phút.\n" +
                    "Nếu bạn không yêu cầu, vui lòng bỏ qua email này.");
            javaMailSender.send(message);
        } catch (Exception e) {
            System.err.println("Lỗi khi gửi email OTP: " + e.getMessage());
        }
    }

    @Override
    public void sendOrderConfirmationEmail(User user, Order order) {
        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            
            helper.setTo(user.getEmail());
            helper.setSubject("  Đặt hàng thành công - Đơn hàng #" + order.getId());

            StringBuilder html = new StringBuilder();
            html.append("<!DOCTYPE html><html><head><style>");
            html.append("body{font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px}");
            html.append(".container{max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1)}");
            html.append(".header{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;padding:30px;text-align:center}");
            html.append(".header h1{margin:0;font-size:24px}");
            html.append(".content{padding:30px}");
            html.append(".order-info{background:#f8f9fa;padding:15px;border-radius:8px;margin:20px 0}");
            html.append(".product-item{display:flex;align-items:center;padding:15px;border-bottom:1px solid #eee}");
            html.append(".product-item:last-child{border-bottom:none}");
            html.append(".product-img{width:80px;height:80px;object-fit:cover;border-radius:8px;margin-right:15px}");
            html.append(".product-info{flex:1}");
            html.append(".product-name{font-weight:600;margin:0 0 5px;color:#333}");
            html.append(".product-meta{color:#666;font-size:14px;margin:0}");
            html.append(".product-price{font-weight:700;color:#667eea;white-space:nowrap}");
            html.append(".summary{background:#f8f9fa;padding:20px;border-radius:8px;margin-top:20px}");
            html.append(".summary-row{display:flex;justify-content:space-between;margin:8px 0}");
            html.append(".summary-total{font-size:18px;font-weight:700;color:#667eea;border-top:2px solid #ddd;padding-top:12px;margin-top:12px}");
            html.append(".footer{text-align:center;padding:20px;color:#888;font-size:13px}");
            html.append("</style></head><body>");
            
            html.append("<div class='container'>");
            html.append("<div class='header'><h1> Đặt hàng thành công! </h1></div>");
            html.append("<div class='content'>");
            html.append("<p>Xin chào <strong>").append(user.getName()).append("</strong>,</p>");
            html.append("<p>Cảm ơn bạn đã tin tưởng và đặt hàng tại cửa hàng của chúng tôi!</p>");
            
            html.append("<div class='order-info'>");
            html.append("<strong>Mã đơn hàng:</strong> #").append(order.getId()).append("<br>");
            html.append("<strong>Ngày đặt:</strong> ").append(java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
            html.append("</div>");

            html.append("<h3 style='margin-top:25px'>Chi tiết sản phẩm:</h3>");
            
            if (order.getOrderItemList() != null) {
                for (OrderItem item : order.getOrderItemList()) {
                    String productName = item.getProduct() != null ? item.getProduct().getName() : "Sản phẩm";
                    String imageUrl = item.getProduct() != null && item.getProduct().getImageUrl() != null
                        ? item.getProduct().getImageUrl()
                        : "https://via.placeholder.com/80";
                    
                    html.append("<div class='product-item'>");
                    html.append("<img src='").append(imageUrl).append("' class='product-img' alt='").append(productName).append("'/>");
                    html.append("<div class='product-info'>");
                    html.append("<p class='product-name'>").append(productName).append("</p>");
                    html.append("<p class='product-meta'>Số lượng: ").append(item.getQuantity()).append("</p>");
                    html.append("</div>");
                    html.append("<div class='product-price'>").append(item.getPrice().toPlainString()).append("đ</div>");
                    html.append("</div>");
                }
            }

            html.append("<div class='summary'>");
            if (order.getDiscountCode() != null && !order.getDiscountCode().isEmpty()) {
                html.append("<div class='summary-row'>");
                html.append("<span>Mã giảm giá (").append(order.getDiscountCode()).append(")</span>");
                html.append("<span style='color:#10b981'>-").append(order.getDiscountAmount().toPlainString()).append("đ</span>");
                html.append("</div>");
            }
            html.append("<div class='summary-row summary-total'>");
            html.append("<span>Tổng thanh toán: </span>");
            html.append("<span>").append(order.getTotalPrice().toPlainString()).append("đ</span>");
            html.append("</div>");
            html.append("</div>");

            html.append("<p style='margin-top:25px;color:#666'>Đơn hàng của bạn đang được xử lý và sẽ sớm được giao đến tay bạn. Chúng tôi sẽ thông báo khi đơn hàng được vận chuyển.</p>");
            html.append("<p style='color:#666'>Trân trọng,<br><strong>Đội ngũ hỗ trợ</strong></p>");
            html.append("</div>");
            html.append("<div class='footer'>© 2026 Ecommerce. All rights reserved.</div>");
            html.append("</div>");
            html.append("</body></html>");

            helper.setText(html.toString(), true);
            javaMailSender.send(mimeMessage);
        } catch (Exception e) {
            System.err.println("Lỗi khi gửi email xác nhận đặt hàng: " + e.getMessage());
            e.printStackTrace();
        }
    }
}

    @Override
    public void sendCODOrderConfirmationEmail(User user, Order order) {
        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            
            helper.setTo(user.getEmail());
            helper.setSubject("📦 Xác nhận đơn hàng - Thanh toán khi nhận hàng #" + order.getId());

            StringBuilder html = new StringBuilder();
            html.append("<!DOCTYPE html><html><head><style>");
            html.append("body{font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px}");
            html.append(".container{max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1)}");
            html.append(".header{background:linear-gradient(135deg,#f68b1e 0%,#ff4d1f 100%);color:#fff;padding:30px;text-align:center}");
            html.append(".header h1{margin:0;font-size:24px}");
            html.append(".content{padding:30px}");
            html.append(".notice{background:#fff3cd;border-left:4px solid #ffc107;padding:15px;margin:20px 0;border-radius:4px}");
            html.append(".notice strong{color:#856404}");
            html.append(".order-info{background:#f8f9fa;padding:15px;border-radius:8px;margin:20px 0}");
            html.append(".product-item{display:flex;align-items:center;padding:15px;border-bottom:1px solid #eee}");
            html.append(".product-item:last-child{border-bottom:none}");
            html.append(".product-img{width:80px;height:80px;object-fit:cover;border-radius:8px;margin-right:15px}");
            html.append(".product-info{flex:1}");
            html.append(".product-name{font-weight:600;margin:0 0 5px;color:#333}");
            html.append(".product-meta{color:#666;font-size:14px;margin:0}");
            html.append(".product-price{font-weight:700;color:#f68b1e;white-space:nowrap}");
            html.append(".summary{background:#f8f9fa;padding:20px;border-radius:8px;margin-top:20px}");
            html.append(".summary-row{display:flex;justify-content:space-between;margin:8px 0}");
            html.append(".summary-total{font-size:18px;font-weight:700;color:#f68b1e;border-top:2px solid #ddd;padding-top:12px;margin-top:12px}");
            html.append(".footer{text-align:center;padding:20px;color:#888;font-size:13px}");
            html.append("</style></head><body>");
            
            html.append("<div class='container'>");
            html.append("<div class='header'><h1>📦 Đơn hàng đã được xác nhận!</h1></div>");
            html.append("<div class='content'>");
            html.append("<p>Xin chào <strong>").append(user.getName()).append("</strong>,</p>");
            html.append("<p>Cảm ơn bạn đã đặt hàng tại cửa hàng của chúng tôi!</p>");
            
            html.append("<div class='notice'>");
            html.append("<strong>💵 Thanh toán khi nhận hàng (COD)</strong><br>");
            html.append("Bạn sẽ thanh toán bằng tiền mặt khi nhận được hàng. Vui lòng chuẩn bị đủ số tiền.");
            html.append("</div>");
            
            html.append("<div class='order-info'>");
            html.append("<strong>Mã đơn hàng:</strong> #").append(order.getId()).append("<br>");
            html.append("<strong>Ngày đặt:</strong> ").append(java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))).append("<br>");
            html.append("<strong>Trạng thái:</strong> <span style='color:#ffc107'>Chờ xác nhận</span>");
            html.append("</div>");

            html.append("<h3 style='margin-top:25px'>Chi tiết sản phẩm:</h3>");
            
            if (order.getOrderItemList() != null) {
                for (OrderItem item : order.getOrderItemList()) {
                    String productName = item.getProduct() != null ? item.getProduct().getName() : "Sản phẩm";
                    String imageUrl = item.getProduct() != null && item.getProduct().getImageUrl() != null
                        ? item.getProduct().getImageUrl()
                        : "https://via.placeholder.com/80";
                    
                    html.append("<div class='product-item'>");
                    html.append("<img src='").append(imageUrl).append("' class='product-img' alt='").append(productName).append("'/>");
                    html.append("<div class='product-info'>");
                    html.append("<p class='product-name'>").append(productName).append("</p>");
                    html.append("<p class='product-meta'>Số lượng: ").append(item.getQuantity()).append("</p>");
                    html.append("</div>");
                    html.append("<div class='product-price'>").append(item.getPrice().toPlainString()).append("đ</div>");
                    html.append("</div>");
                }
            }

            html.append("<div class='summary'>");
            if (order.getDiscountCode() != null && !order.getDiscountCode().isEmpty()) {
                html.append("<div class='summary-row'>");
                html.append("<span>Mã giảm giá (").append(order.getDiscountCode()).append(")</span>");
                html.append("<span style='color:#10b981'>-").append(order.getDiscountAmount().toPlainString()).append("đ</span>");
                html.append("</div>");
            }
            html.append("<div class='summary-row summary-total'>");
            html.append("<span>Tổng thanh toán khi nhận hàng:</span>");
            html.append("<span>").append(order.getTotalPrice().toPlainString()).append("đ</span>");
            html.append("</div>");
            html.append("</div>");

            html.append("<p style='margin-top:25px;color:#666'>Đơn hàng của bạn đang được xử lý. Chúng tôi sẽ liên hệ với bạn để xác nhận và giao hàng trong thời gian sớm nhất.</p>");
            html.append("<p style='color:#666;font-size:14px;background:#e3f2fd;padding:12px;border-radius:6px;margin-top:15px'>");
            html.append("ℹ️ <strong>Lưu ý:</strong> Vui lòng kiểm tra kỹ sản phẩm trước khi thanh toán cho shipper.");
            html.append("</p>");
            html.append("<p style='color:#666'>Trân trọng,<br><strong>Đội ngũ hỗ trợ</strong></p>");
            html.append("</div>");
            html.append("<div class='footer'>© 2026 Ecommerce. All rights reserved.</div>");
            html.append("</div>");
            html.append("</body></html>");

            helper.setText(html.toString(), true);
            javaMailSender.send(mimeMessage);
        } catch (Exception e) {
            System.err.println("Lỗi khi gửi email xác nhận đơn hàng COD: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
