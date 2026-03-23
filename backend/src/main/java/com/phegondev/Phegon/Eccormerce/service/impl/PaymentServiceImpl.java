    package com.phegondev.Phegon.Eccormerce.service.impl;

import com.phegondev.Phegon.Eccormerce.dto.PaymentRequest;
import com.phegondev.Phegon.Eccormerce.dto.Response;
import com.phegondev.Phegon.Eccormerce.entity.Order;
import com.phegondev.Phegon.Eccormerce.entity.Payment;
import com.phegondev.Phegon.Eccormerce.entity.User;
import com.phegondev.Phegon.Eccormerce.enums.OrderStatus;
import com.phegondev.Phegon.Eccormerce.enums.PaymentStatus;
import com.phegondev.Phegon.Eccormerce.repository.OrderRepo;
import com.phegondev.Phegon.Eccormerce.repository.PaymentRepository;
import com.phegondev.Phegon.Eccormerce.service.interf.DiscountService;
import com.phegondev.Phegon.Eccormerce.service.interf.EmailService;
import com.phegondev.Phegon.Eccormerce.service.interf.PaymentService;
import com.phegondev.Phegon.Eccormerce.service.interf.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepo orderRepository;
    private final UserService userService;
    private final EmailService emailService;
    private final DiscountService discountService;

    @Override
    @Transactional
    public Response initializePayment(PaymentRequest paymentRequest) {
        User user = userService.getLoginUser();
        if (user == null) {
            return Response.builder().status(401).message("Vui lòng đăng nhập để thanh toán").build();
        }

        var orderOpt = orderRepository.findById(paymentRequest.getOrderId());
        if (orderOpt.isEmpty()) {
            return Response.builder().status(404).message("Đơn hàng không tồn tại").build();
        }

        Order order = orderOpt.get();

        if (!isUserAuthorizedForOrder(user, order)) {
            return Response.builder().status(403).message("Bạn không có quyền thanh toán đơn hàng này").build();
        }

        if (paymentRequest.getAmount().compareTo(order.getTotalPrice()) != 0) {
            return Response.builder().status(400).message("Số tiền không khớp với đơn hàng").build();
        }

        var existingPayment = paymentRepository.findByOrderId(paymentRequest.getOrderId());
        if (existingPayment.isPresent() && PaymentStatus.COMPLETED.equals(existingPayment.get().getStatus())) {
            return Response.builder().status(400).message("Đơn hàng này đã được thanh toán rồi").build();
        }

        PaymentStatus paymentStatus;
        OrderStatus orderStatus;
        String responseMessage;
        
        if ("CASH".equals(paymentRequest.getMethod())) {
            paymentStatus = PaymentStatus.PENDING;
            orderStatus = OrderStatus.PENDING;
            responseMessage = "Đơn hàng đã được đặt thành công. Vui lòng thanh toán khi nhận hàng.";
        } else {
            paymentStatus = PaymentStatus.COMPLETED;
            orderStatus = OrderStatus.PENDING;
            responseMessage = "Thanh toán thành công. Cảm ơn bạn đã đặt hàng!";
        }

        Payment payment = Payment.builder()
                .amount(paymentRequest.getAmount())
                .method(paymentRequest.getMethod())
                .status(paymentStatus)
                .order(order)
                .build();
        paymentRepository.save(payment);
        order.setStatus(orderStatus);
        orderRepository.save(order);

        if (order.getDiscountCode() != null && !order.getDiscountCode().isEmpty()) {
            try {
                discountService.decreaseDiscountUsage(order.getDiscountCode());
            } catch (Exception e) {
                System.err.println("Lỗi khi giảm usage limit: " + e.getMessage());
            }
        }

        if (PaymentStatus.COMPLETED.equals(paymentStatus)) {
            emailService.sendOrderConfirmationEmail(user, order);
            System.out.println("✅ Đã gửi email xác nhận thanh toán cho: " + user.getEmail());
        } else {
            emailService.sendCODOrderConfirmationEmail(user, order);
            System.out.println("✅ Đã gửi email COD cho: " + user.getEmail());
        }

        return Response.builder().status(200).message(responseMessage).build();
    }

    @Override
    public Response getPaymentStatus(Long orderId) {
        try {
            var payment = paymentRepository.findByOrderId(orderId);
            if (payment.isEmpty()) {
                return Response.builder().status(404).message("Thanh toán không tồn tại").build();
            }
            return Response.builder()
                    .status(200)
                    .message("Trạng thái thanh toán: " + payment.get().getStatus())
                    .build();
        } catch (Exception e) {
            return Response.builder().status(500).message("Lỗi khi lấy trạng thái thanh toán: " + e.getMessage()).build();
        }
    }

    private boolean isUserAuthorizedForOrder(User user, Order order) {
        if (order.getOrderItemList() == null || order.getOrderItemList().isEmpty()) return false;
        return order.getOrderItemList().stream()
                .anyMatch(item -> item.getUser() != null && item.getUser().getId().equals(user.getId()));
    }
}
