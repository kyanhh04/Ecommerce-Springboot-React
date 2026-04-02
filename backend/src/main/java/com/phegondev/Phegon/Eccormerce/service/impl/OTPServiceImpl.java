package com.phegondev.Phegon.Eccormerce.service.impl;

import com.phegondev.Phegon.Eccormerce.dto.Response;
import com.phegondev.Phegon.Eccormerce.entity.OTP;
import com.phegondev.Phegon.Eccormerce.entity.User;
import com.phegondev.Phegon.Eccormerce.entity.UserCredential;
import com.phegondev.Phegon.Eccormerce.repository.OTPRepository;
import com.phegondev.Phegon.Eccormerce.repository.UserCredentialRepo;
import com.phegondev.Phegon.Eccormerce.repository.UserRepo;
import com.phegondev.Phegon.Eccormerce.service.interf.OTPService;
import com.phegondev.Phegon.Eccormerce.service.interf.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class OTPServiceImpl implements OTPService {

    private final OTPRepository otpRepository;
    private final EmailService emailService;
    private final UserRepo userRepo;
    private final UserCredentialRepo userCredentialRepo;

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
            // Kiểm tra user có tồn tại không
            User user = userRepo.findByEmail(email).orElse(null);
            if (user == null) {
                return Response.builder()
                        .status(404)
                        .message("Email này chưa được đăng ký trong hệ thống")
                        .build();
            }
            
            // Kiểm tra xem user có LOCAL credential không
            boolean hasLocalCredential = userCredentialRepo.findByProviderAndProviderId("LOCAL", email)
                    .isPresent();
            
            if (!hasLocalCredential) {
                // Không có LOCAL credential, kiểm tra có provider nào khác không
                List<UserCredential> userCredentials = userCredentialRepo.findByUserId(user.getId());
                
                if (!userCredentials.isEmpty()) {
                    UserCredential firstCredential = userCredentials.get(0);
                    String provider = firstCredential.getProvider();
                    
                    String providerName = switch (provider) {
                        case "GOOGLE" -> "Google";
                        case "FACEBOOK" -> "Facebook";
                        default -> provider;
                    };
                    
                    return Response.builder()
                            .status(400)
                            .message("Tài khoản này được đăng nhập bằng " + providerName + ". Vui lòng sử dụng Đăng nhập với " + providerName + ".")
                            .build();
                }
            }
            
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