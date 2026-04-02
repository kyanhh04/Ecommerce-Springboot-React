package com.phegondev.Phegon.Eccormerce.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiscountDTO {
    private Long id;
    private String code;
    private String description;
    private String discountType; // PERCENTAGE hoặc FIXED_AMOUNT
    private BigDecimal discountValue; // Giá trị giảm
    private BigDecimal minOrderAmount; // Số tiền tối thiểu
    private BigDecimal maxDiscountAmount; // Số tiền giảm tối đa
    private Integer usageLimit;
    private Integer currentUsage;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Boolean isActive;
    private List<Long> applicableCategoryIds; // Danh sách category ID áp dụng
    private Boolean autoAssignNewUser; // Tự động cấp cho user mới
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
