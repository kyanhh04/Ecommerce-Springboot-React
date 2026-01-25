package com.phegondev.Phegon.Eccormerce.service.interf;

import com.phegondev.Phegon.Eccormerce.dto.Response;
import com.phegondev.Phegon.Eccormerce.entity.User;
import com.phegondev.Phegon.Eccormerce.entity.Order;

public interface OTPService {
    void generateOTPForOrder(User user, Order order);
    Response verifyOTPForOrder(String code, Order order);
    Response requestPaymentOTP(Long orderId);
}
