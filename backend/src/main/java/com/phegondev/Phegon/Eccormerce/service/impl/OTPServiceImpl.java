package com.phegondev.Phegon.Eccormerce.service.impl;

import com.phegondev.Phegon.Eccormerce.dto.Response;
import com.phegondev.Phegon.Eccormerce.entity.OTP;
import com.phegondev.Phegon.Eccormerce.entity.User;
import com.phegondev.Phegon.Eccormerce.entity.Order;
import com.phegondev.Phegon.Eccormerce.repository.OTPRepository;
import com.phegondev.Phegon.Eccormerce.repository.OrderRepo;
import com.phegondev.Phegon.Eccormerce.repository.PaymentRepository;
import com.phegondev.Phegon.Eccormerce.repository.UserRepo;
import com.phegondev.Phegon.Eccormerce.service.interf.OTPService;
import com.phegondev.Phegon.Eccormerce.service.interf.UserService;
import com.phegondev.Phegon.Eccormerce.service.interf.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class  OTPServiceImpl implements OTPService {

    private final OTPRepository otpRepository;
    private final UserService userService;
    private final OrderRepo orderRepository;
    private final PaymentRepository paymentRepository;
    private final EmailService emailService;

    @Override
    public void generateOTPForOrder(User user, Order order) {
        otpRepository.findByOrderAndIsUsedFalse(order).ifPresent(otpRepository::delete);

        String code = String.format("%06d", new Random().nextInt(1000000));

        OTP otp = OTP.builder()
                .user(user)
                .order(order)
                .code(code)
                .isUsed(false)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .build();

        otpRepository.save(otp);

        emailService.sendOTPEmail(user, code);

    }
    @Override
    public Response verifyOTPForOrder(String code, Order order) {
        var otp = otpRepository.findByCodeAndOrderAndIsUsedFalse(code, order);
        if (otp.isEmpty()) {
            return Response.builder()
                    .status(400)
                    .message("OTP không đúng hoặc đã hết hạn")
                    .build();
        }
        OTP otpEntity = otp.get();
        if (LocalDateTime.now().isAfter(otpEntity.getExpiresAt())) {
            return Response.builder()
                    .status(400)
                    .message("OTP đã hết hạn")
                    .build();
        }
        otpEntity.setIsUsed(true);
        otpEntity.setUsedAt(LocalDateTime.now());
        otpRepository.save(otpEntity);

        return Response.builder()
                .status(200)
                .message("OTP xác thực thành công")
                .build();
    }
    @Override
    public Response requestPaymentOTP(Long orderId) {
        User user = userService.getLoginUser();
        if (user == null) {
            return Response.builder()
                    .status(401)
                    .message("Vui lòng đăng nhập")
                    .build();
        }
        try {
            var order = orderRepository.findById(orderId);
            if (order.isEmpty()) {
                return Response.builder()
                        .status(404)
                        .message("Đơn hàng không tồn tại")
                        .build();
            }
            Order orderEntity = order.get();

            var payment = paymentRepository.findByOrderId(orderId);
            if (payment.isPresent() && "SUCCESS".equals(payment.get().getStatus())) {
                return Response.builder()
                        .status(400)
                        .message("Đơn hàng này đã được thanh toán rồi")
                        .build();
            }
            
            generateOTPForOrder(user, orderEntity);
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
