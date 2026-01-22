package com.phegondev.Phegon.Eccormerce.controller;

import com.phegondev.Phegon.Eccormerce.dto.PaymentOTPVerifyRequest;
import com.phegondev.Phegon.Eccormerce.dto.PaymentRequest;
import com.phegondev.Phegon.Eccormerce.dto.Response;
import com.phegondev.Phegon.Eccormerce.service.interf.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/initialize")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    public ResponseEntity<Response> initializePayment(@RequestBody PaymentRequest paymentRequest) {
        return ResponseEntity.ok(paymentService.initializePayment(paymentRequest));
    }

    @PostMapping("/verify-otp")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    public ResponseEntity<Response> verifyPaymentOTP(@RequestBody PaymentOTPVerifyRequest request) {
        return ResponseEntity.ok(paymentService.verifyPaymentOTP(request.getOrderId(), request.getOtpCode()));
    }

    @PostMapping("/process/{orderId}")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    public ResponseEntity<Response> processPayment(@PathVariable Long orderId) {
        return ResponseEntity.ok(paymentService.processPayment(orderId));
    }

    @GetMapping("/status/{orderId}")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    public ResponseEntity<Response> getPaymentStatus(@PathVariable Long orderId) {
        return ResponseEntity.ok(paymentService.getPaymentStatus(orderId));
    }
}
