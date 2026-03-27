package com.phegondev.Phegon.Eccormerce.service.interf;

import com.phegondev.Phegon.Eccormerce.dto.CreateReviewRequest;
import com.phegondev.Phegon.Eccormerce.dto.Response;

public interface ReviewService {
    Response createReview(CreateReviewRequest request);
    Response getReviewsByProduct(Long productId, int page, int size);
    Response getAllReviews();
    Response deleteReview(Long reviewId);
    
    // Multiple replies support
    Response addNewReply(Long reviewId, String content);
    Response updateReply(Long replyId, String content);
    Response deleteReplyById(Long replyId);
}
