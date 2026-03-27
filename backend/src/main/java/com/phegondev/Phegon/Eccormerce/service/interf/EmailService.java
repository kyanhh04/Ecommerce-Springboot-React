package com.phegondev.Phegon.Eccormerce.service.interf;

import com.phegondev.Phegon.Eccormerce.entity.Order;
import com.phegondev.Phegon.Eccormerce.entity.User;

public interface EmailService {
    void sendRegistrationOTP(String email, String otp);
    void sendForgotPasswordOTP(String email, String otp);
    void sendOrderConfirmationEmail(User user, Order order);
    void sendCODOrderConfirmationEmail(User user, Order order);
}

