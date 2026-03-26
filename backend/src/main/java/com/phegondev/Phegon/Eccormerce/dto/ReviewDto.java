package com.phegondev.Phegon.Eccormerce.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
@AllArgsConstructor
@NoArgsConstructor
public class ReviewDto {
    private Long id;
    private String content;
    private int rating; // 1-5
    private String reply; // Backward compatibility - single reply
    private List<ReviewReplyDto> replies; // Multiple replies support
    private LocalDateTime createdAt;

    private Long productId;
    private String productName;
    private Long categoryId;
    private String categoryName;
    private Long userId;
    private String userName;
}
