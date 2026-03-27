package com.phegondev.Phegon.Eccormerce.controller;

import com.phegondev.Phegon.Eccormerce.dto.CreateReviewRequest;
import com.phegondev.Phegon.Eccormerce.dto.Response;
import com.phegondev.Phegon.Eccormerce.service.interf.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/product/{productId}")
    public ResponseEntity<Response> getReviewsByProduct(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        Response response = reviewService.getReviewsByProduct(productId, page, size);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> getAllReviews() {
        Response response = reviewService.getAllReviews();
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    public ResponseEntity<Response> createReview(@RequestBody CreateReviewRequest request) {
        Response response = reviewService.createReview(request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    // Multiple replies endpoints
    @PostMapping("/{reviewId}/replies")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> addNewReply(@PathVariable Long reviewId, @RequestParam String content) {
        Response response = reviewService.addNewReply(reviewId, content);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PutMapping("/replies/{replyId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> updateReply(@PathVariable Long replyId, @RequestParam String content) {
        Response response = reviewService.updateReply(replyId, content);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @DeleteMapping("/replies/{replyId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> deleteReplyById(@PathVariable Long replyId) {
        Response response = reviewService.deleteReplyById(replyId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @DeleteMapping("/{reviewId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> deleteReview(@PathVariable Long reviewId) {
        Response response = reviewService.deleteReview(reviewId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }
}
