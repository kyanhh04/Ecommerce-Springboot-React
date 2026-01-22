package com.phegondev.Phegon.Eccormerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PaymentOTPVerifyRequest {
    private Long orderId;
    private String otpCode;
}
