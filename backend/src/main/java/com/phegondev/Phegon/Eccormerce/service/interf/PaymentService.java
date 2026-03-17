package com.phegondev.Phegon.Eccormerce.service.interf;

import com.phegondev.Phegon.Eccormerce.dto.PaymentRequest;
import com.phegondev.Phegon.Eccormerce.dto.Response;

public interface PaymentService {
    Response initializePayment(PaymentRequest paymentRequest);
    Response getPaymentStatus(Long orderId);
}
