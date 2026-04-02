package com.phegondev.Phegon.Eccormerce.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDiscountDTO {
    private Long id;
    private DiscountDTO discount;
    private Boolean isUsed;
    private LocalDateTime usedAt;
    private LocalDateTime assignedAt;
}
