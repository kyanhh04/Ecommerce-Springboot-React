package com.phegondev.Phegon.Eccormerce.service.impl;

import com.phegondev.Phegon.Eccormerce.dto.PaymentRequest;
import com.phegondev.Phegon.Eccormerce.dto.Response;
import com.phegondev.Phegon.Eccormerce.entity.Order;
import com.phegondev.Phegon.Eccormerce.entity.Payment;
import com.phegondev.Phegon.Eccormerce.entity.User;
import com.phegondev.Phegon.Eccormerce.repository.OrderRepo;
import com.phegondev.Phegon.Eccormerce.repository.PaymentRepository;
import com.phegondev.Phegon.Eccormerce.service.interf.OTPService;
import com.phegondev.Phegon.Eccormerce.service.interf.PaymentService;
import com.phegondev.Phegon.Eccormerce.service.interf.UserService;
import com.phegondev.Phegon.Eccormerce.service.interf.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepo orderRepository;
    private final OTPService otpService;
    private final UserService userService;
    private final EmailService emailService;

    @Override
    public Response initializePayment(PaymentRequest paymentRequest) {
            User user = userService.getLoginUser();
            if (user == null) {
                return Response.builder()
                        .status(401)
                        .message("Vui lòng đăng nhập để thanh toán")
                        .build();
            }
            var order = orderRepository.findById(paymentRequest.getOrderId());
            if (order.isEmpty()) {
                return Response.builder()
                        .status(404)
                        .message("Đơn hàng không tồn tại")
                        .build();
            }
            Order orderEntity = order.get();
            if (isUserAuthorizedForOrder(user, orderEntity)) {
                return Response.builder()
                        .status(403)
                        .message("Bạn không có quyền thanh toán đơn hàng này")
                        .build();
            }

            if (paymentRequest.getAmount().compareTo(orderEntity.getTotalPrice()) != 0) {
                return Response.builder()
                        .status(400)
                        .message("Số tiền không khớp với đơn hàng")
                        .build();
            }

            Payment payment = Payment.builder()
                    .amount(paymentRequest.getAmount())
                    .method(paymentRequest.getMethod())
                    .status("PENDING_OTP")
                    .order(orderEntity)
                    .build();

            paymentRepository.save(payment);

            otpService.generateOTP(user, "PAYMENT");

            return Response.builder()
                    .status(200)
                    .message("Vui lòng xác nhận OTP được gửi đến email của bạn")
                    .build();

    }

    @Override
    public Response verifyPaymentOTP(Long orderId, String otpCode) {
        try {
            User user = userService.getLoginUser();
            if (user == null) {
                return Response.builder()
                        .status(401)
                        .message("Vui lòng đăng nhập")
                        .build();
            }
            Response otpResponse = otpService.verifyOTP(otpCode, user);
            if (otpResponse.getStatus() != 200) {
                return otpResponse;
            }
            var order = orderRepository.findById(orderId);
            if (order.isEmpty()) {
                return Response.builder()
                        .status(404)
                        .message("Đơn hàng không tồn tại")
                        .build();
            }
            if (isUserAuthorizedForOrder(user, order.get())) {
                return Response.builder()
                        .status(403)
                        .message("Không có quyền xác nhận thanh toán cho đơn hàng này")
                        .build();
            }
            var payment = paymentRepository.findByOrderId(orderId);
            if (payment.isPresent()) {
                Payment paymentEntity = payment.get();
                paymentEntity.setStatus("OTP_VERIFIED");
                paymentEntity.setOtpVerified(true);
                paymentRepository.save(paymentEntity);
            }
            return Response.builder()
                    .status(200)
                    .message("OTP xác thực thành công. Đang xử lý thanh toán...")
                    .build();
        } catch (Exception e) {
            return Response.builder()
                    .status(500)
                    .message("Lỗi khi xác minh OTP: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public Response processPayment(Long orderId) {
        try {
            User user = userService.getLoginUser();
            if (user == null) {
                return Response.builder()
                        .status(401)
                        .message("Vui lòng đăng nhập")
                        .build();
            }

            var order = orderRepository.findById(orderId);
            if (order.isEmpty()) {
                return Response.builder()
                        .status(404)
                        .message("Đơn hàng không tồn tại")
                        .build();
            }

            if (isUserAuthorizedForOrder(user, order.get())) {
                return Response.builder()
                        .status(403)
                        .message("Không có quyền xử lý thanh toán")
                        .build();
            }

            var payment = paymentRepository.findByOrderId(orderId);
            if (payment.isEmpty()) {
                return Response.builder()
                        .status(404)
                        .message("Thanh toán không tồn tại")
                        .build();
            }

            Payment paymentEntity = payment.get();
            if (!"OTP_VERIFIED".equals(paymentEntity.getStatus())) {
                return Response.builder()
                        .status(400)
                        .message("Vui lòng xác nhận OTP trước khi thanh toán")
                        .build();
            }

            boolean paymentSuccess = processPaymentGateway(paymentEntity);
            if (paymentSuccess) {
                paymentEntity.setStatus("SUCCESS");
                paymentRepository.save(paymentEntity);
                emailService.sendPaymentConfirmationEmail(user, orderId, "SUCCESS");
                return Response.builder()
                        .status(200)
                        .message("Thanh toán thành công")
                        .build();
            } else {
                paymentEntity.setStatus("FAILED");
                paymentRepository.save(paymentEntity);
                emailService.sendPaymentConfirmationEmail(user, orderId, "FAILED");
                return Response.builder()
                        .status(400)
                        .message("Thanh toán thất bại")
                        .build();
            }
        } catch (Exception e) {
            return Response.builder()
                    .status(500)
                    .message("Lỗi khi xử lý thanh toán: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public Response getPaymentStatus(Long orderId) {
        try {
            var payment = paymentRepository.findByOrderId(orderId);
            if (payment.isEmpty()) {
                return Response.builder()
                        .status(404)
                        .message("Thanh toán không tồn tại")
                        .build();
            }

            Payment paymentEntity = payment.get();
            return Response.builder()
                    .status(200)
                    .message("Trạng thái thanh toán: " + paymentEntity.getStatus())
                    .build();

        } catch (Exception e) {
            return Response.builder()
                    .status(500)
                    .message("Lỗi khi lấy trạng thái thanh toán: " + e.getMessage())
                    .build();
        }
    }

    private boolean isUserAuthorizedForOrder(User user, Order order) {
        if (order.getOrderItemList() == null || order.getOrderItemList().isEmpty()) {
            return true;
        }

        return order.getOrderItemList().stream()
                .noneMatch(item -> item.getUser() != null && item.getUser().getId().equals(user.getId()));
    }

    private boolean processPaymentGateway(Payment payment) {
        return true;
    }
}
