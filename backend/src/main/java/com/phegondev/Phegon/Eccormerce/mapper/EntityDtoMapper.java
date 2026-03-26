package com.phegondev.Phegon.Eccormerce.mapper;

import com.phegondev.Phegon.Eccormerce.dto.*;
import com.phegondev.Phegon.Eccormerce.entity.*;
import com.phegondev.Phegon.Eccormerce.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class EntityDtoMapper {

    private final ReviewRepository reviewRepository;


    public UserDto mapUserToDtoBasic(User user){
        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        userDto.setPhoneNumber(user.getPhoneNumber());
        userDto.setEmail(user.getEmail());
        userDto.setRole(user.getRole().name());
        userDto.setName(user.getName());
        return userDto;

    }

    public AddressDto mapAddressToDtoBasic(Address address){
        AddressDto addressDto = new AddressDto();
        addressDto.setId(address.getId());
        addressDto.setCity(address.getCity());
        addressDto.setStreet(address.getStreet());
        addressDto.setState(address.getState());
        return addressDto;
    }

    //Category to DTO basic
    public CategoryDto mapCategoryToDtoBasic(Category category){
        CategoryDto categoryDto = new CategoryDto();
        categoryDto.setId(category.getId());
        categoryDto.setName(category.getName());
        return categoryDto;
    }


    //OrderItem to DTO Basics
    public OrderItemDto mapOrderItemToDtoBasic(OrderItem orderItem){
        OrderItemDto orderItemDto = new OrderItemDto();
        orderItemDto.setId(orderItem.getId());
        orderItemDto.setQuantity(orderItem.getQuantity());
        orderItemDto.setPrice(orderItem.getPrice());
        orderItemDto.setCreatedAt(orderItem.getCreatedAt());
        // status lives on the parent Order
        if (orderItem.getOrder() != null && orderItem.getOrder().getStatus() != null) {
            orderItemDto.setStatus(orderItem.getOrder().getStatus().name());
        }
        return orderItemDto;
    }

    //Product to DTO Basic
    public ProductDto mapProductToDtoBasic(Product product){
        ProductDto productDto = new ProductDto();
        productDto.setId(product.getId());
        productDto.setName(product.getName());
        productDto.setDescription(product.getDescription());
        productDto.setPrice(product.getPrice());
        productDto.setImageUrl(product.getImageUrl());
        
        // Map category if exists
        if (product.getCategory() != null) {
            CategoryDto categoryDto = mapCategoryToDtoBasic(product.getCategory());
            productDto.setCategory(categoryDto);
        }
        
        return productDto;
    }

    public UserDto mapUserToDtoPlusAddress(User user){

        System.out.println("mapUserToDtoPlusAddress is called");
        UserDto userDto = mapUserToDtoBasic(user);
        if (user.getAddress() != null){

            AddressDto addressDto = mapAddressToDtoBasic(user.getAddress());
            userDto.setAddress(addressDto);

        }
        return userDto;
    }


    //orderItem to DTO plus product
    public OrderItemDto mapOrderItemToDtoPlusProduct(OrderItem orderItem){
        OrderItemDto orderItemDto = mapOrderItemToDtoBasic(orderItem);

        if (orderItem.getProduct() != null) {
            ProductDto productDto = mapProductToDtoBasic(orderItem.getProduct());
            orderItemDto.setProduct(productDto);
            
            // Check if user has reviewed this product
            if (orderItem.getUser() != null) {
                boolean hasReviewed = reviewRepository.existsByProductIdAndUserId(
                    orderItem.getProduct().getId(), 
                    orderItem.getUser().getId()
                );
                orderItemDto.setHasReviewed(hasReviewed);
            }
        }
        return orderItemDto;
    }


    //OrderItem to DTO plus product and user
    public OrderItemDto mapOrderItemToDtoPlusProductAndUser(OrderItem orderItem){
        OrderItemDto orderItemDto = mapOrderItemToDtoPlusProduct(orderItem);

        if (orderItem.getUser() != null){
            UserDto userDto = mapUserToDtoPlusAddress(orderItem.getUser());
            orderItemDto.setUser(userDto);
        }
        return orderItemDto;
    }


    //USer to DTO with Address and Order Items History
    public UserDto mapUserToDtoPlusAddressAndOrderHistory(User user) {
        UserDto userDto = mapUserToDtoPlusAddress(user);

        if (user.getOrderItemList() != null && !user.getOrderItemList().isEmpty()) {
            // Nhóm orderItems theo Order
            java.util.Map<Long, OrderDto> ordersMap = new java.util.HashMap<>();
            
            for (OrderItem orderItem : user.getOrderItemList()) {
                if (orderItem.getOrder() == null) continue;
                
                Long orderId = orderItem.getOrder().getId();
                OrderDto orderDto = ordersMap.get(orderId);
                
                if (orderDto == null) {
                    orderDto = new OrderDto();
                    orderDto.setId(orderId);
                    orderDto.setTotalPrice(orderItem.getOrder().getTotalPrice());
                    orderDto.setCreatedAt(orderItem.getOrder().getCreatedAt());
                    orderDto.setDiscountCode(orderItem.getOrder().getDiscountCode());
                    orderDto.setDiscountAmount(orderItem.getOrder().getDiscountAmount());
                    orderDto.setStatus(orderItem.getOrder().getStatus() != null ? 
                        orderItem.getOrder().getStatus().name() : null);
                    orderDto.setOrderItemList(new java.util.ArrayList<>());
                    
                    ordersMap.put(orderId, orderDto);
                }
                
                // Thêm orderItem vào order
                OrderItemDto itemDto = mapOrderItemToDtoPlusProduct(orderItem);
                orderDto.getOrderItemList().add(itemDto);
            }
            
            userDto.setOrderList(new java.util.ArrayList<>(ordersMap.values()));
        }
        return userDto;

    }

    // Discount to DTO
    public DiscountDTO mapDiscountToDiscountDTO(Discount discount) {
        DiscountDTO discountDTO = new DiscountDTO();
        discountDTO.setId(discount.getId());
        discountDTO.setCode(discount.getCode());
        discountDTO.setDescription(discount.getDescription());
        discountDTO.setDiscountType(discount.getDiscountType().name());
        discountDTO.setDiscountValue(discount.getDiscountValue());
        discountDTO.setUsageLimit(discount.getUsageLimit());
        discountDTO.setCurrentUsage(discount.getCurrentUsage());
        discountDTO.setStartDate(discount.getStartDate());
        discountDTO.setEndDate(discount.getEndDate());
        discountDTO.setIsActive(discount.getIsActive());
        discountDTO.setCreatedAt(discount.getCreatedAt());
        discountDTO.setUpdatedAt(discount.getUpdatedAt());
        return discountDTO;
    }

    // Order to DTO
    public OrderDto mapOrderToDtoBasic(Order order) {
        OrderDto orderDto = new OrderDto();
        orderDto.setId(order.getId());
        orderDto.setTotalPrice(order.getTotalPrice());
        orderDto.setStatus(order.getStatus() != null ? order.getStatus().name() : null);
        orderDto.setCreatedAt(order.getCreatedAt());
        orderDto.setDiscountCode(order.getDiscountCode());
        orderDto.setDiscountAmount(order.getDiscountAmount());
        return orderDto;
    }

    // Order to DTO with order items
    public OrderDto mapOrderToDtoPlusOrderItems(Order order) {
        OrderDto orderDto = mapOrderToDtoBasic(order);
        if (order.getOrderItemList() != null && !order.getOrderItemList().isEmpty()) {
            orderDto.setOrderItemList(order.getOrderItemList()
                    .stream()
                    .map(this::mapOrderItemToDtoPlusProduct)
                    .collect(Collectors.toList()));
        }
        return orderDto;
    }

    public ReviewDto mapReviewToDtoBasic(Review review) {
        ReviewDto dto = new ReviewDto();
        dto.setId(review.getId());
        dto.setContent(review.getContent());
        dto.setRating(review.getRating());
        dto.setCreatedAt(review.getCreatedAt());
        
        // Map multiple replies
        if (review.getReplies() != null && !review.getReplies().isEmpty()) {
            dto.setReplies(review.getReplies().stream()
                    .map(this::mapReviewReplyToDto)
                    .collect(Collectors.toList()));
        }
        
        if (review.getProduct() != null) {
            dto.setProductId(review.getProduct().getId());
            dto.setProductName(review.getProduct().getName());
            if (review.getProduct().getCategory() != null) {
                dto.setCategoryId(review.getProduct().getCategory().getId());
                dto.setCategoryName(review.getProduct().getCategory().getName());
            }
        }
        if (review.getUser() != null) {
            dto.setUserId(review.getUser().getId());
            dto.setUserName(review.getUser().getName());
        }
        return dto;
    }
    
    public ReviewReplyDto mapReviewReplyToDto(com.phegondev.Phegon.Eccormerce.entity.ReviewReply reply) {
        ReviewReplyDto dto = new ReviewReplyDto();
        dto.setId(reply.getId());
        dto.setContent(reply.getContent());
        dto.setCreatedAt(reply.getCreatedAt());
        dto.setUpdatedAt(reply.getUpdatedAt());
        return dto;
    }

    public SlideDto mapSlideToDto(Slide slide) {
        SlideDto dto = new SlideDto();
        dto.setId(slide.getId());
        dto.setTitle(slide.getTitle());
        dto.setDescription(slide.getDescription());
        dto.setImageUrl(slide.getImageUrl());
        dto.setLinkUrl(slide.getLinkUrl());
        dto.setDisplayOrder(slide.getDisplayOrder());
        dto.setIsActive(slide.getIsActive());
        dto.setCreatedAt(slide.getCreatedAt());
        return dto;
    }

}