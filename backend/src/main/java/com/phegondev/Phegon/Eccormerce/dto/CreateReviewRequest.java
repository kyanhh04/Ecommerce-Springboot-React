package com.phegondev.Phegon.Eccormerce.dto;

import lombok.Data;

@Data
public class CreateReviewRequest {
    private Long productId;
    private Integer rating; // 1-5
    private String content;
}

