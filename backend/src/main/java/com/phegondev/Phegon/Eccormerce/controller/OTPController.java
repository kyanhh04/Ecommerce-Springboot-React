package com.phegondev.Phegon.Eccormerce.controller;

import com.phegondev.Phegon.Eccormerce.dto.Response;
import com.phegondev.Phegon.Eccormerce.service.interf.OTPService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth/otp")
@RequiredArgsConstructor
public class OTPController {
    private final OTPService otpService;
    
    @PostMapping("/send")
    public ResponseEntity<Response> sendOTP(@RequestParam String email) {
        return ResponseEntity.ok(otpService.sendRegistrationOTP(email));
    }
    
    @PostMapping("/verify")
    public ResponseEntity<Response> verifyOTP(@RequestParam String email, @RequestParam String code) {
        return ResponseEntity.ok(otpService.verifyRegistrationOTP(email, code));
    }
    
    @PostMapping("/forgot-password/send")
    public ResponseEntity<Response> sendForgotPasswordOTP(@RequestParam String email) {
        return ResponseEntity.ok(otpService.sendForgotPasswordOTP(email));
    }
    
    @PostMapping("/forgot-password/verify")
    public ResponseEntity<Response> verifyForgotPasswordOTP(@RequestParam String email, @RequestParam String code) {
        return ResponseEntity.ok(otpService.verifyForgotPasswordOTP(email, code));
    }
}
