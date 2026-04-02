package com.phegondev.Phegon.Eccormerce.service.impl;

import com.phegondev.Phegon.Eccormerce.entity.Order;
import com.phegondev.Phegon.Eccormerce.entity.OrderItem;
import com.phegondev.Phegon.Eccormerce.entity.User;
import com.phegondev.Phegon.Eccormerce.service.interf.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import jakarta.mail.internet.MimeMessage;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender javaMailSender;

    @Async
    @Override
    public void sendRegistrationOTP(String email, String otp) {
        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(email);
            helper.setSubject("Mã OTP đăng ký tài khoản");
            
            String html = buildRegistrationOTPEmailHtml(email, otp);
            helper.setText(html, true);
            
            javaMailSender.send(mimeMessage);
        } catch (Exception e) {
            System.err.println("Lỗi khi gửi email OTP đăng ký: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Async
    @Override
    public void sendOrderConfirmationEmail(User user, Order order) {
        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(user.getEmail());
            helper.setSubject("✓ Đặt hàng thành công - Đơn hàng #" + order.getId());
            String html = buildOrderEmailHtml(user, order, false);
            helper.setText(html, true);
            javaMailSender.send(mimeMessage);
        } catch (Exception e) {
            System.err.println("Lỗi khi gửi email xác nhận đặt hàng: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Async
    @Override
    public void sendCODOrderConfirmationEmail(User user, Order order) {
        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            
            helper.setTo(user.getEmail());
            helper.setSubject("✓ Đặt hàng thành công - Đơn hàng #" + order.getId());

            String html = buildOrderEmailHtml(user, order, true);
            helper.setText(html, true);
            javaMailSender.send(mimeMessage);
        } catch (Exception e) {
            System.err.println("Lỗi khi gửi email xác nhận đơn hàng COD: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private String buildOrderEmailHtml(User user, Order order, boolean isCOD) {
        StringBuilder html = new StringBuilder();
        
        // Header color based on payment method
        String headerColor = isCOD ? "#fb923c" : "#7c3aed";
        String accentColor = isCOD ? "#fb923c" : "#7c3aed";
        String bgColor = isCOD ? "#fff7ed" : "#f5f3ff";
        
        html.append("<!DOCTYPE html>");
        html.append("<html><head>");
        html.append("<meta charset='UTF-8'>");
        html.append("<meta name='viewport' content='width=device-width, initial-scale=1.0'>");
        html.append("<style>");
        html.append("* { margin: 0; padding: 0; box-sizing: border-box; }");
        html.append("body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f0f2f5; padding: 20px; line-height: 1.6; }");
        html.append(".container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }");
        html.append(".header { background: ").append(headerColor).append("; color: #ffffff; padding: 40px 30px; text-align: center; }");
        html.append(".header h1 { margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }");
        html.append(".content { padding: 35px 30px; }");
        html.append(".greeting { font-size: 16px; color: #333; margin-bottom: 10px; }");
        html.append(".greeting strong { color: ").append(accentColor).append("; }");
        html.append(".intro-text { color: #666; margin-bottom: 25px; font-size: 15px; }");
        
        if (isCOD) {
            html.append(".notice { background: #fef3c7; border-left: 5px solid #fbbf24; padding: 20px; margin: 25px 0; border-radius: 12px; }");
            html.append(".notice strong { color: #92400e; font-size: 16px; display: block; margin-bottom: 8px; }");
            html.append(".notice-text { color: #92400e; font-size: 14px; line-height: 1.6; }");
            html.append(".status-badge { display: inline-block; padding: 6px 14px; background: #fbbf24; color: #92400e; border-radius: 20px; font-size: 13px; font-weight: 600; margin-left: 8px; }");
        }
        
        html.append(".order-info { background: ").append(bgColor).append("; padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 4px solid ").append(accentColor).append("; }");
        html.append(".order-info strong { color: #333; font-weight: 600; }");
        html.append(".order-info br { line-height: 2; }");
        html.append(".section-title { font-size: 18px; font-weight: 700; color: #333; margin: 30px 0 15px; padding-bottom: 10px; border-bottom: 2px solid #e9ecef; }");
        html.append(".product-list { background: #fafbfc; border-radius: 12px; padding: 10px; margin: 20px 0; }");
        html.append(".product-item { display: flex; align-items: center; padding: 15px; background: #fff; border-radius: 10px; margin-bottom: 10px; }");
        html.append(".product-item:last-child { margin-bottom: 0; }");
        html.append(".product-img { width: 90px; height: 90px; object-fit: cover; border-radius: 10px; margin-right: 18px; border: 2px solid #f0f2f5; }");
        html.append(".product-info { flex: 1; padding-right: 30px; }");
        html.append(".product-name { font-weight: 700; font-size: 16px; margin: 0 0 8px; color: #2d3748; }");
        html.append(".product-meta { color: #718096; font-size: 14px; margin: 0; }");
        html.append(".product-price { font-weight: 700; font-size: 17px; color: ").append(accentColor).append("; white-space: nowrap; }");
        html.append(".summary { background: ").append(bgColor).append("; padding: 25px; border-radius: 12px; margin-top: 25px; }");
        html.append(".summary-table { width: 100%; border-collapse: collapse; }");
        html.append(".summary-table td { padding: 10px 0; font-size: 15px; color: #4a5568; }");
        html.append(".summary-table td:first-child { text-align: left; }");
        html.append(".summary-table td:last-child { text-align: right; font-weight: 600; color: #2d3748; white-space: nowrap; }");
        html.append(".discount-row td { color: #10b981 !important; font-weight: 600; }");
        html.append(".summary-total td { font-size: 20px; font-weight: 700; color: ").append(accentColor).append(" !important; border-top: 2px solid #cbd5e0; padding-top: 15px; }");
        html.append(".note-text { margin-top: 30px; padding: 20px; background: #f7fafc; border-left: 4px solid ").append(accentColor).append("; border-radius: 8px; color: #2d3748; font-size: 16px; line-height: 1.8; font-weight: 500; }");
        
        if (isCOD) {
            html.append(".info-box { background: #dbeafe; padding: 18px; border-radius: 10px; margin-top: 20px; border-left: 4px solid #3b82f6; }");
            html.append(".info-box strong { color: #1e40af; display: block; margin-bottom: 6px; }");
            html.append(".info-box-text { color: #1e40af; font-size: 14px; line-height: 1.7; }");
        }
        
        html.append(".signature { margin-top: 30px; color: #718096; font-size: 15px; }");
        html.append(".signature strong { color: ").append(accentColor).append("; }");
        html.append(".footer { text-align: center; padding: 25px; background: #f8f9fa; color: #a0aec0; font-size: 13px; }");
        html.append("@media only screen and (max-width: 600px) {");
        html.append("  .container { border-radius: 0; }");
        html.append("  .content { padding: 25px 20px; }");
        html.append("  .header { padding: 30px 20px; }");
        html.append("  .product-img { width: 70px; height: 70px; margin-right: 12px; }");
        html.append("  .product-name { font-size: 14px; }");
        html.append("  .product-price { font-size: 15px; }");
        html.append("}");
        html.append("</style></head><body>");

        html.append("<div class='container'>");
        html.append("<div class='header'><h1>✓ Đặt hàng thành công!</h1></div>");
        html.append("<div class='content'>");
        html.append("<p class='greeting'>Xin chào <strong>").append(user.getName()).append("</strong>,</p>");
        html.append("<p class='intro-text'>Cảm ơn bạn đã tin tưởng và đặt hàng tại cửa hàng của chúng tôi! Đơn hàng của bạn đã được tiếp nhận").append(isCOD ? "." : " và đang được xử lý.").append("</p>");

        if (isCOD) {
            html.append("<div class='notice'>");
            html.append("<strong> Thanh toán khi nhận hàng (COD)</strong>");
            html.append("<div class='notice-text'>Bạn sẽ thanh toán bằng tiền mặt khi nhận được hàng. Vui lòng chuẩn bị đủ số tiền.</div>");
            html.append("</div>");
        }

        html.append("<div class='order-info'>");
        html.append("<strong>Mã đơn hàng:</strong> #").append(order.getId()).append("<br>");
        html.append("<strong>Ngày đặt:</strong> ").append(java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
        if (isCOD) {
            html.append("<br><strong>Trạng thái:</strong> <span class='status-badge'> Chờ xác nhận</span>");
        }
        html.append("</div>");

        html.append("<h3 class='section-title'> Chi tiết sản phẩm</h3>");
        html.append("<div class='product-list'>");

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
                html.append("<div class='product-price'>").append(String.format("%,d", item.getPrice().longValue())).append(" đ</div>");
                html.append("</div>");
            }
        }
        html.append("</div>");

        html.append("<div class='summary'>");
        html.append("<table class='summary-table'>");
        if (order.getDiscountCode() != null && !order.getDiscountCode().isEmpty()) {
            html.append("<tr class='discount-row'>");
            html.append("<td> Mã giảm giá (").append(order.getDiscountCode()).append(")</td>");
            html.append("<td>-").append(String.format("%,d", order.getDiscountAmount().longValue())).append(" đ</td>");
            html.append("</tr>");
        }
        html.append("<tr class='summary-total'>");
        html.append("<td> Tổng thanh toán").append(isCOD ? " khi nhận hàng" : "").append("</td>");
        html.append("<td>").append(String.format("%,d", order.getTotalPrice().longValue())).append(" đ</td>");
        html.append("</tr>");
        html.append("</table>");
        html.append("</div>");

        html.append("<div class='note-text'>Đơn hàng của bạn đang được xử lý").append(isCOD ? ". Chúng tôi sẽ liên hệ với bạn để xác nhận và giao hàng trong thời gian sớm nhất." : " và sẽ sớm được giao đến tay bạn. Chúng tôi sẽ thông báo ngay khi đơn hàng được vận chuyển.").append("</div>");
        
        if (isCOD) {
            html.append("<div class='info-box'>");
            html.append("<strong> Lưu ý quan trọng</strong>");
            html.append("<div class='info-box-text'>Vui lòng kiểm tra kỹ sản phẩm trước khi thanh toán cho shipper. Đảm bảo sản phẩm đúng như đơn hàng và không bị hư hỏng.</div>");
            html.append("</div>");
        }
        
        html.append("<p class='signature'>Trân trọng,<br><strong>Đội ngũ hỗ trợ</strong></p>");
        html.append("</div>");
        html.append("<div class='footer'>© 2026 Ecommerce. All rights reserved.</div>");
        html.append("</div>");
        html.append("</body></html>");

        return html.toString();
    }

    private String buildRegistrationOTPEmailHtml(String email, String otp) {
        StringBuilder html = new StringBuilder();
        
        html.append("<!DOCTYPE html>");
        html.append("<html><head>");
        html.append("<meta charset='UTF-8'>");
        html.append("<style>");
        html.append("body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }");
        html.append(".container { max-width: 500px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }");
        html.append(".header { background: #0369A1; color: #fff; padding: 30px; text-align: center; }");
        html.append(".header h1 { margin: 0; font-size: 24px; }");
        html.append(".content { padding: 30px; }");
        html.append(".otp-box { background: #f0f9ff; border: 2px dashed #0369A1; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }");
        html.append(".otp-code { font-size: 32px; font-weight: bold; color: #0369A1; letter-spacing: 8px; }");
        html.append(".info { color: #666; font-size: 14px; line-height: 1.6; margin: 15px 0; }");
        html.append(".warning { background: #fef3c7; border-left: 4px solid #fbbf24; padding: 15px; margin: 20px 0; color: #92400e; font-size: 13px; }");
        html.append(".footer { text-align: center; padding: 20px; background: #f8f9fa; color: #999; font-size: 12px; }");
        html.append("</style></head><body>");
        
        html.append("<div class='container'>");
        html.append("<div class='header'><h1>Xác nhận đăng ký tài khoản</h1></div>");
        html.append("<div class='content'>");
        html.append("<p>Xin chào,</p>");
        html.append("<p class='info'>Bạn đã yêu cầu đăng ký tài khoản với email: <strong>").append(email).append("</strong></p>");
        html.append("<p class='info'>Vui lòng sử dụng mã OTP dưới đây để hoàn tất đăng ký:</p>");
        
        html.append("<div class='otp-box'>");
        html.append("<div class='otp-code'>").append(otp).append("</div>");
        html.append("</div>");
        
        html.append("<p class='info'>Mã OTP này có hiệu lực trong <strong>10 phút</strong>.</p>");
        
        html.append("<div class='warning'>");
        html.append("<strong> Lưu ý bảo mật:</strong><br>");
        html.append("Không chia sẻ mã OTP này với bất kỳ ai. Nếu bạn không yêu cầu đăng ký, vui lòng bỏ qua email này.");
        html.append("</div>");
        
        html.append("<p class='info'>Trân trọng,<br><strong>Đội ngũ Ecommerce</strong></p>");
        html.append("</div>");
        html.append("<div class='footer'>© 2026 Ecommerce. All rights reserved.</div>");
        html.append("</div>");
        html.append("</body></html>");
        
        return html.toString();
    }

    @Async
    @Override
    public void sendForgotPasswordOTP(String email, String otp) {
        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(email);
            helper.setSubject("Mã OTP khôi phục mật khẩu");
            
            String html = buildForgotPasswordOTPEmailHtml(email, otp);
            helper.setText(html, true);
            
            javaMailSender.send(mimeMessage);
        } catch (Exception e) {
            System.err.println("Lỗi khi gửi email OTP khôi phục mật khẩu: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private String buildForgotPasswordOTPEmailHtml(String email, String otp) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><meta charset='UTF-8'></head>" +
                "<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>" +
                "<div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;'>" +
                "<h2 style='color: #0369A1; text-align: center;'>Khôi phục mật khẩu</h2>" +
                "<p>Xin chào,</p>" +
                "<p>Bạn đã yêu cầu khôi phục mật khẩu cho tài khoản: <strong>" + email + "</strong></p>" +
                "<p>Mã OTP của bạn là:</p>" +
                "<div style='background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 5px;'>" +
                otp +
                "</div>" +
                "<p style='color: #dc2626;'><strong>Lưu ý:</strong> Mã OTP này có hiệu lực trong 10 phút.</p>" +
                "<p>Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này.</p>" +
                "<hr style='margin: 30px 0; border: none; border-top: 1px solid #ddd;'>" +
                "<p style='font-size: 12px; color: #666; text-align: center;'>Email này được gửi tự động, vui lòng không trả lời.</p>" +
                "</div>" +
                "</body>" +
                "</html>";
    }
}
