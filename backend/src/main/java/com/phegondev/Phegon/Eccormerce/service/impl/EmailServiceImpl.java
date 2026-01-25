package com.phegondev.Phegon.Eccormerce.service.impl;

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
            
            String emailBody = "Mã OTP xác thực của bạn là: " + otp + 
                               "\n\nMã này có hiệu lực trong 10 phút.\n" +
                               "Nếu bạn không yêu cầu, vui lòng bỏ qua email này.";
            
            message.setText(emailBody);
            javaMailSender.send(message);
            
            System.out.println("Email OTP đã gửi đến: " + user.getEmail());
        } catch (Exception e) {
            System.err.println("Lỗi khi gửi email OTP: " + e.getMessage());
            // Có thể log vào database
        }
    }

    @Override
    public void sendPaymentConfirmationEmail(User user, Long orderId, String status) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(user.getEmail());
            message.setSubject("Xác nhận thanh toán - Đơn hàng #" + orderId);
            
            String emailBody = "Thanh toán cho đơn hàng #" + orderId + " đã " + 
                              ("SUCCESS".equals(status) ? "thành công" : "thất bại") + ".\n\n" +
                              "Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!";
            
            message.setText(emailBody);
            javaMailSender.send(message);
            
            System.out.println("Email xác nhận thanh toán đã gửi đến: " + user.getEmail());
        } catch (Exception e) {
            System.err.println("Lỗi khi gửi email xác nhận: " + e.getMessage());
        }
    }
}
