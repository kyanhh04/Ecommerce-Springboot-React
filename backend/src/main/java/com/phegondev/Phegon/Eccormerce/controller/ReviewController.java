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
    public ResponseEntity<Response> getReviewsByProduct(@PathVariable Long productId) {
        Response response = reviewService.getReviewsByProduct(productId);
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

    @PutMapping("/{reviewId}/reply")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> addReply(@PathVariable Long reviewId, @RequestParam String reply) {
        Response response = reviewService.addReply(reviewId, reply);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @DeleteMapping("/{reviewId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> deleteReview(@PathVariable Long reviewId) {
        Response response = reviewService.deleteReview(reviewId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @DeleteMapping("/{reviewId}/reply")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> deleteReply(@PathVariable Long reviewId) {
        Response response = reviewService.deleteReply(reviewId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }
}

