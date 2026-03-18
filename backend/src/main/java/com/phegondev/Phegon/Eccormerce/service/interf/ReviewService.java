package com.phegondev.Phegon.Eccormerce.service.interf;

import com.phegondev.Phegon.Eccormerce.dto.CreateReviewRequest;
import com.phegondev.Phegon.Eccormerce.dto.Response;

public interface ReviewService {
    Response createReview(CreateReviewRequest request);
    Response getReviewsByProduct(Long productId);
}

