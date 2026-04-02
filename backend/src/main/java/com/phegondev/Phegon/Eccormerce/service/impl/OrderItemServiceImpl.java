package com.phegondev.Phegon.Eccormerce.service.impl;

import com.phegondev.Phegon.Eccormerce.dto.OrderItemDto;
import com.phegondev.Phegon.Eccormerce.dto.OrderRequest;
import com.phegondev.Phegon.Eccormerce.dto.Response;
import com.phegondev.Phegon.Eccormerce.entity.*;
import com.phegondev.Phegon.Eccormerce.enums.OrderStatus;
import com.phegondev.Phegon.Eccormerce.enums.PaymentStatus;
import com.phegondev.Phegon.Eccormerce.exception.NotFoundException;
import com.phegondev.Phegon.Eccormerce.exception.OurException;
import com.phegondev.Phegon.Eccormerce.mapper.EntityDtoMapper;
import com.phegondev.Phegon.Eccormerce.repository.DiscountRepository;
import com.phegondev.Phegon.Eccormerce.repository.OrderItemRepo;
import com.phegondev.Phegon.Eccormerce.repository.OrderRepo;
import com.phegondev.Phegon.Eccormerce.repository.ProductRepository;
import com.phegondev.Phegon.Eccormerce.repository.PaymentRepository;
import com.phegondev.Phegon.Eccormerce.service.interf.EmailService;
import com.phegondev.Phegon.Eccormerce.service.interf.OrderItemService;
import com.phegondev.Phegon.Eccormerce.service.interf.UserService;
import com.phegondev.Phegon.Eccormerce.specification.OrderItemSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderItemServiceImpl implements OrderItemService {

    private final OrderRepo orderRepo;
    private final OrderItemRepo orderItemRepo;
    private final ProductRepository productRepository;
    private final UserService userService;
    private final EntityDtoMapper entityDtoMapper;
    private final DiscountRepository discountRepository;
    private final EmailService emailService;
    private final PaymentRepository paymentRepository;


    @Transactional
    @Override
    public Response placeOrder(OrderRequest orderRequest) {
        try {
            User user = userService.getLoginUser();

            if (user.getPhoneNumber() == null || user.getPhoneNumber().trim().isEmpty()) {
                return Response.builder()
                        .status(400)
                        .message("Vui lòng cập nhật số điện thoại trước khi đặt hàng")
                        .build();
            }

            List<Long> productIds = orderRequest.getItems().stream()
                    .map(item -> item.getProductId())
                    .collect(Collectors.toList());
            List<Product> products = productRepository.findAllById(productIds);
            
            if (products.size() != productIds.size()) {
                throw new NotFoundException("One or more products not found");
            }

            var productMap = products.stream()
                    .collect(Collectors.toMap(Product::getId, p -> p));
            
            List<OrderItem> orderItems = orderRequest.getItems().stream().map(orderItemRequest -> {
                Product product = productMap.get(orderItemRequest.getProductId());
                if (product == null) {
                    throw new NotFoundException("Product Not Found: " + orderItemRequest.getProductId());
                }
                OrderItem orderItem = new OrderItem();
                orderItem.setProduct(product);
                orderItem.setQuantity(orderItemRequest.getQuantity());
                orderItem.setPrice(product.getPrice().multiply(BigDecimal.valueOf(orderItemRequest.getQuantity())));
                orderItem.setUser(user);
                return orderItem;
            }).collect(Collectors.toList());
            
            BigDecimal totalPrice = orderItems.stream().map(OrderItem::getPrice).reduce(BigDecimal.ZERO, BigDecimal::add);
            
            BigDecimal discountAmount = BigDecimal.ZERO;
            Discount discount = null;
            
            if (orderRequest.getDiscountCode() != null && !orderRequest.getDiscountCode().isEmpty()) {
                Optional<Discount> discountOpt = discountRepository.findByCode(orderRequest.getDiscountCode().toUpperCase());
                if (discountOpt.isEmpty()) {
                    throw new OurException("Mã giảm giá không tồn tại");
                }
                
                discount = discountOpt.get();
                LocalDateTime now = LocalDateTime.now();
                if (!discount.getIsActive()) {
                    throw new OurException("Mã giảm giá không còn hoạt động");
                }
                if (now.isBefore(discount.getStartDate())) {
                    throw new OurException("Mã giảm giá chưa bắt đầu");
                }
                if (now.isAfter(discount.getEndDate())) {
                    throw new OurException("Mã giảm giá đã hết hạn");
                }
                if (discount.getCurrentUsage() >= discount.getUsageLimit()) {
                    throw new OurException("Mã giảm giá đã hết lượt sử dụng");
                }

                if (discount.getMinOrderAmount() != null && totalPrice.compareTo(discount.getMinOrderAmount()) < 0) {
                    throw new OurException("Đơn hàng tối thiểu để áp dụng mã này là " + discount.getMinOrderAmount() + " VND");
                }

                if (discount.getApplicableCategories() != null && !discount.getApplicableCategories().isEmpty()) {
                    List<Long> applicableCategoryIds = discount.getApplicableCategories().stream()
                            .map(Category::getId)
                            .toList();

                    boolean hasApplicableProduct = orderItems.stream()
                            .anyMatch(item -> item.getProduct().getCategory() != null && 
                                    applicableCategoryIds.contains(item.getProduct().getCategory().getId()));
                    
                    if (!hasApplicableProduct) {
                        throw new OurException("Mã giảm giá này không áp dụng cho các sản phẩm trong giỏ hàng của bạn");
                    }
                }

                if (discount.getDiscountType().equals(com.phegondev.Phegon.Eccormerce.enums.DiscountType.PERCENTAGE)) {
                    discountAmount = totalPrice.multiply(discount.getDiscountValue()).divide(BigDecimal.valueOf(100));

                    if (discount.getMaxDiscountAmount() != null && discountAmount.compareTo(discount.getMaxDiscountAmount()) > 0) {
                        discountAmount = discount.getMaxDiscountAmount();
                    }
                } else {
                    discountAmount = discount.getDiscountValue();
                    if (discountAmount.compareTo(totalPrice) > 0) {
                        discountAmount = totalPrice;
                    }
                }
            }
            
            BigDecimal finalDiscountAmount = discountAmount;
            if (finalDiscountAmount.compareTo(BigDecimal.ZERO) > 0 && totalPrice.compareTo(BigDecimal.ZERO) > 0) {
                totalPrice = totalPrice.subtract(finalDiscountAmount);
            }
            
            Order order = new Order();
            order.setOrderItemList(orderItems);
            order.setTotalPrice(totalPrice);
            order.setDiscountAmount(discountAmount);
            order.setStatus(OrderStatus.PENDING);
            
            if (discount != null) {
                order.setDiscount(discount);
                order.setDiscountCode(discount.getCode());
                
                discount.setCurrentUsage(discount.getCurrentUsage() + 1);
                discount.setUpdatedAt(LocalDateTime.now());
                discountRepository.save(discount);
            }

            orderItems.forEach(orderItem -> orderItem.setOrder(order));
            orderRepo.save(order);

            if ("cash".equalsIgnoreCase(orderRequest.getPaymentMethod())) {
                // Tạo Payment cho COD
                Payment payment = Payment.builder()
                        .amount(totalPrice)
                        .method("CASH")
                        .status(PaymentStatus.COMPLETED)
                        .order(order)
                        .build();
                paymentRepository.save(payment);
                
                emailService.sendCODOrderConfirmationEmail(user, order);
                log.info("COD order confirmation email queued for: {}", user.getEmail());
            }
    
            var orderDto = entityDtoMapper.mapOrderToDtoBasic(order);

            return Response.builder()
                    .status(200)
                    .message("Order was successfully placed")
                    .order(orderDto)
                    .build();
        } catch (OurException e) {
            return Response.builder()
                    .status(400)
                    .message(e.getMessage())
                    .build();
        } catch (Exception e) {
            return Response.builder()
                    .status(500)
                    .message("Lỗi khi đặt hàng: " + e.getMessage())
                    .build();
        }

    }
    @Transactional
    @Override
    public Response updateOrderItemStatus(Long orderItemId, String status) {
        OrderItem orderItem = orderItemRepo.findById(orderItemId)
                .orElseThrow(()-> new NotFoundException("Order Item not found"));

        Order order = orderItem.getOrder();
        if (order == null) throw new NotFoundException("Order not found for this item");

        order.setStatus(OrderStatus.valueOf(status.toUpperCase()));
        orderRepo.save(order);

        return Response.builder()
                .status(200)
                .message("Order status updated successfully")
                .build();
    }

    @Transactional(readOnly = true)
    @Override
    public Response getOrderDetailsForCurrentUser(Long orderId) {
        try {
            User user = userService.getLoginUser();

            Order order = orderRepo.findById(orderId)
                    .orElseThrow(() -> new NotFoundException("Order not found"));

            boolean belongsToUser = order.getOrderItemList() != null &&
                    order.getOrderItemList().stream().allMatch(
                            item -> item.getUser() != null && item.getUser().getId().equals(user.getId())
                    );

            if (!belongsToUser) {
                throw new OurException("Bạn không có quyền xem đơn hàng này");
            }

            var orderDto = entityDtoMapper.mapOrderToDtoPlusOrderItems(order);

            return Response.builder()
                    .status(200)
                    .order(orderDto)
                    .build();
        } catch (OurException e) {
            return Response.builder()
                    .status(400)
                    .message(e.getMessage())
                    .build();
        } catch (Exception e) {
            return Response.builder()
                    .status(500)
                    .message("Lỗi khi lấy chi tiết đơn hàng: " + e.getMessage())
                    .build();
        }
    }

    @Transactional(readOnly = true)
    @Override
    public Response filterOrderItems(OrderStatus status, LocalDateTime startDate, LocalDateTime endDate, Long itemId, Pageable pageable) {
        Specification<OrderItem> spec = Specification.where(OrderItemSpecification.hasStatus(status))
                .and(OrderItemSpecification.createdBetween(startDate, endDate))
                .and(OrderItemSpecification.hasItemId(itemId));

        Page<OrderItem> orderItemPage = orderItemRepo.findAll(spec, pageable);

        List<OrderItemDto> orderItemDtos = orderItemPage.getContent().stream()
                .map(entityDtoMapper::mapOrderItemToDtoPlusProductAndUser)
                .collect(Collectors.toList());

        return Response.builder()
                .status(200)
                .orderItemList(orderItemDtos)
                .totalPage(orderItemPage.getTotalPages())
                .totalElement(orderItemPage.getTotalElements())
                .build();
    }

}
