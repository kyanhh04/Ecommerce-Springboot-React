package com.phegondev.Phegon.Eccormerce.service.impl;

import com.phegondev.Phegon.Eccormerce.dto.Response;
import com.phegondev.Phegon.Eccormerce.entity.OTP;
import com.phegondev.Phegon.Eccormerce.entity.User;
import com.phegondev.Phegon.Eccormerce.repository.OTPRepository;
import com.phegondev.Phegon.Eccormerce.service.interf.OTPService;
import com.phegondev.Phegon.Eccormerce.service.interf.UserService;
import com.phegondev.Phegon.Eccormerce.service.interf.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class OTPServiceImpl implements OTPService {

    private final OTPRepository otpRepository;
    private final UserService userService;
    private final EmailService emailService;

    @Override
    public String generateOTP(User user, String type) {
        // Xóa OTP cũ của người dùng
        otpRepository.findByUserAndTypeAndIsUsedFalse(user, type).ifPresent(otpRepository::delete);

        // Tạo mã OTP 6 chữ số
        String code = String.format("%06d", new Random().nextInt(1000000));

        // Lưu OTP vào database
        OTP otp = OTP.builder()
                .user(user)
                .code(code)
                .type(type)
                .isUsed(false)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(10)) // OTP có hiệu lực 10 phút
                .build();

        otpRepository.save(otp);

        // Gửi OTP qua email
        emailService.sendOTPEmail(user, code, type);

        return code;
    }

    @Override
    public Response verifyOTP(String code, User user) {
        var otp = otpRepository.findByCodeAndUserAndIsUsedFalse(code, user);

        if (otp.isEmpty()) {
            return Response.builder()
                    .status(400)
                    .message("OTP không đúng hoặc đã hết hạn")
                    .build();
        }

        OTP otpEntity = otp.get();

        // Kiểm tra OTP đã hết hạn chưa
        if (LocalDateTime.now().isAfter(otpEntity.getExpiresAt())) {
            otpRepository.delete(otpEntity);
            return Response.builder()
                    .status(400)
                    .message("OTP đã hết hạn")
                    .build();
        }

        // Đánh dấu OTP đã sử dụng
        otpEntity.setIsUsed(true);
        otpEntity.setUsedAt(LocalDateTime.now());
        otpRepository.save(otpEntity);

        return Response.builder()
                .status(200)
                .message("OTP xác thực thành công")
                .build();
    }

    @Override
    public Response requestOTP(String type) {
        User user = userService.getLoginUser();
        if (user == null) {
            return Response.builder()
                    .status(401)
                    .message("Vui lòng đăng nhập")
                    .build();
        }
        try {
            String otp = generateOTP(user, type);

            return Response.builder()
                    .status(200)
                    .message("OTP đã được gửi đến email của bạn: " + user.getEmail())
                    .build();
        } catch (Exception e) {
            return Response.builder()
                    .status(500)
                    .message("Lỗi khi tạo OTP: " + e.getMessage())
                    .build();
        }
    }
}
