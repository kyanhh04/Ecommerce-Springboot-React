package com.phegondev.Phegon.Eccormerce.service.impl;

import com.phegondev.Phegon.Eccormerce.dto.Response;
import com.phegondev.Phegon.Eccormerce.entity.OTP;
import com.phegondev.Phegon.Eccormerce.repository.OTPRepository;
import com.phegondev.Phegon.Eccormerce.service.interf.OTPService;
import com.phegondev.Phegon.Eccormerce.service.interf.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class OTPServiceImpl implements OTPService {

    private final OTPRepository otpRepository;
    private final EmailService emailService;

    @Override
    @Transactional
    public Response sendRegistrationOTP(String email) {
        try {
            // Delete any existing OTP for this email
            otpRepository.deleteByEmail(email);

            // Generate 6-digit OTP
            String code = String.format("%06d", new Random().nextInt(1000000));

            // Create OTP entity
            OTP otp = OTP.builder()
                    .email(email)
                    .code(code)
                    .isUsed(false)
                    .createdAt(LocalDateTime.now())
                    .expiresAt(LocalDateTime.now().plusSeconds(60))
                    .build();

            otpRepository.save(otp);

            // Send email
            emailService.sendRegistrationOTP(email, code);

            return Response.builder()
                    .status(200)
                    .message("Mã OTP đã được gửi đến email: " + email)
                    .build();

        } catch (Exception e) {
            return Response.builder()
                    .status(500)
                    .message("Lỗi khi gửi OTP: " + e.getMessage())
                    .build();
        }
    }

    @Override
    @Transactional
    public Response verifyRegistrationOTP(String email, String code) {
        try {
            var otpOptional = otpRepository.findByEmailAndCodeAndIsUsedFalse(email, code);

            if (otpOptional.isEmpty()) {
                return Response.builder()
                        .status(400)
                        .message("Mã OTP không đúng")
                        .build();
            }

            OTP otp = otpOptional.get();

            // Check if expired
            if (LocalDateTime.now().isAfter(otp.getExpiresAt())) {
                return Response.builder()
                        .status(400)
                        .message("Mã OTP đã hết hạn")
                        .build();
            }

            // Mark as used
            otp.setIsUsed(true);
            otp.setUsedAt(LocalDateTime.now());
            otpRepository.save(otp);

            return Response.builder()
                    .status(200)
                    .message("Xác thực OTP thành công")
                    .build();

        } catch (Exception e) {
            return Response.builder()
                    .status(500)
                    .message("Lỗi khi xác thực OTP: " + e.getMessage())
                    .build();
        }
    }

    @Override
    @Transactional
    public Response sendForgotPasswordOTP(String email) {
        try {
            // Delete any existing OTP for this email
            otpRepository.deleteByEmail(email);

            // Generate 6-digit OTP
            String code = String.format("%06d", new Random().nextInt(1000000));

            // Create OTP entity
            OTP otp = OTP.builder()
                    .email(email)
                    .code(code)
                    .isUsed(false)
                    .createdAt(LocalDateTime.now())
                    .expiresAt(LocalDateTime.now().plusSeconds(60))
                    .build();

            otpRepository.save(otp);

            // Send email
            emailService.sendForgotPasswordOTP(email, code);

            return Response.builder()
                    .status(200)
                    .message("Mã OTP đã được gửi đến email: " + email)
                    .build();

        } catch (Exception e) {
            return Response.builder()
                    .status(500)
                    .message("Lỗi khi gửi OTP: " + e.getMessage())
                    .build();
        }
    }

    @Override
    @Transactional
    public Response verifyForgotPasswordOTP(String email, String code) {
        try {
            var otpOptional = otpRepository.findByEmailAndCodeAndIsUsedFalse(email, code);

            if (otpOptional.isEmpty()) {
                return Response.builder()
                        .status(400)
                        .message("Mã OTP không đúng")
                        .build();
            }

            OTP otp = otpOptional.get();

            // Check if expired
            if (LocalDateTime.now().isAfter(otp.getExpiresAt())) {
                return Response.builder()
                        .status(400)
                        .message("Mã OTP đã hết hạn")
                        .build();
            }

            // KHÔNG đánh dấu là used ở đây, sẽ đánh dấu khi reset password thành công

            return Response.builder()
                    .status(200)
                    .message("Xác thực OTP thành công")
                    .build();

        } catch (Exception e) {
            return Response.builder()
                    .status(500)
                    .message("Lỗi khi xác thực OTP: " + e.getMessage())
                    .build();
        }
    }
}