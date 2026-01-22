package com.phegondev.Phegon.Eccormerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PaymentRequest {
    private Long orderId;
    private BigDecimal amount;
    private String method;
    private String cardNumber;
    private String cardName;
    private String expiryDate;
    private String cvv;
}
