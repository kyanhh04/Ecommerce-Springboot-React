package com.phegondev.Phegon.Eccormerce.service.interf;

import com.phegondev.Phegon.Eccormerce.entity.User;

public interface EmailService {
    void sendOTPEmail(User user, String otp, String type);
    void sendPaymentConfirmationEmail(User user, Long orderId, String status);
}
