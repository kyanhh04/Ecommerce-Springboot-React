package com.phegondev.Phegon.Eccormerce.service.impl;

import com.phegondev.Phegon.Eccormerce.entity.Order;
import com.phegondev.Phegon.Eccormerce.entity.OrderItem;
import com.phegondev.Phegon.Eccormerce.entity.User;
import com.phegondev.Phegon.Eccormerce.service.interf.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
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
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(user.getEmail());
            message.setSubject("Đặt hàng thành công - Đơn hàng #" + order.getId());

            StringBuilder body = new StringBuilder();
            body.append("Xin chào ").append(user.getName()).append(",\n\n");
            body.append("Cảm ơn bạn đã đặt hàng tại cửa hàng của chúng tôi!\n\n");
            body.append("Chi tiết đơn hàng #").append(order.getId()).append(":\n");
            body.append("------------------------------------------\n");

            if (order.getOrderItemList() != null) {
                for (OrderItem item : order.getOrderItemList()) {
                    String productName = item.getProduct() != null ? item.getProduct().getName() : "Sản phẩm";
                    body.append("- ").append(productName)
                            .append(" x").append(item.getQuantity())
                            .append(" - ").append(item.getPrice().toPlainString()).append("đ\n");
                }
            }

            body.append("------------------------------------------\n");
            if (order.getDiscountCode() != null && !order.getDiscountCode().isEmpty()) {
                body.append("Mã giảm giá: ").append(order.getDiscountCode())
                        .append(" (-").append(order.getDiscountAmount().toPlainString()).append("đ)\n");
            }
            body.append("Tổng thanh toán: ").append(order.getTotalPrice().toPlainString()).append("đ\n\n");
            body.append("Đơn hàng của bạn đang được xử lý và sẽ sớm được giao đến bạn.\n");
            body.append("Trân trọng,\nĐội ngũ hỗ trợ");

            message.setText(body.toString());
            javaMailSender.send(message);
        } catch (Exception e) {
            System.err.println("Lỗi khi gửi email xác nhận đặt hàng: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
