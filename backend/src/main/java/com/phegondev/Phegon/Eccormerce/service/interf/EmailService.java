package com.phegondev.Phegon.Eccormerce.service.interf;

import com.phegondev.Phegon.Eccormerce.entity.Order;
import com.phegondev.Phegon.Eccormerce.entity.User;

public interface EmailService {
    void sendOTPEmail(User user, String otp);
    void sendOrderConfirmationEmail(User user, Order order);
}
