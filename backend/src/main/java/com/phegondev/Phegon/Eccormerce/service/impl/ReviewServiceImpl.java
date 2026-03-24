package com.phegondev.Phegon.Eccormerce.service.impl;

import com.phegondev.Phegon.Eccormerce.dto.CreateReviewRequest;
import com.phegondev.Phegon.Eccormerce.dto.Response;
import com.phegondev.Phegon.Eccormerce.entity.Product;
import com.phegondev.Phegon.Eccormerce.entity.Review;
import com.phegondev.Phegon.Eccormerce.entity.User;
import com.phegondev.Phegon.Eccormerce.exception.NotFoundException;
import com.phegondev.Phegon.Eccormerce.exception.OurException;
import com.phegondev.Phegon.Eccormerce.mapper.EntityDtoMapper;
import com.phegondev.Phegon.Eccormerce.repository.ProductRepository;
import com.phegondev.Phegon.Eccormerce.repository.ReviewRepository;
import com.phegondev.Phegon.Eccormerce.service.interf.ReviewService;
import com.phegondev.Phegon.Eccormerce.service.interf.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserService userService;
    private final EntityDtoMapper entityDtoMapper;

    @Transactional
    @Override
    public Response createReview(CreateReviewRequest request) {
        try {
            if (request.getProductId() == null) {
                throw new OurException("Thiếu productId");
            }
            if (request.getRating() == null) {
                throw new OurException("Thiếu rating");
            }
            int rating = request.getRating();
            if (rating < 1 || rating > 5) {
                throw new OurException("Rating phải từ 1 đến 5");
            }
            if (request.getContent() == null || request.getContent().trim().isEmpty()) {
                throw new OurException("Nội dung đánh giá không được để trống");
            }

            User user = userService.getLoginUser();

            if (reviewRepository.existsByProductIdAndUserId(request.getProductId(), user.getId())) {
                throw new OurException("Bạn đã đánh giá sản phẩm này rồi");
            }

            Product product = productRepository.findById(request.getProductId())
                    .orElseThrow(() -> new NotFoundException("Product Not Found"));

            Review review = new Review();
            review.setContent(request.getContent().trim());
            review.setRating(rating);
            review.setProduct(product);
            review.setUser(user);

            Review saved = reviewRepository.save(review);

            return Response.builder()
                    .status(200)
                    .message("Đã gửi đánh giá")
                    .review(entityDtoMapper.mapReviewToDtoBasic(saved))
                    .build();
        } catch (OurException e) {
            return Response.builder()
                    .status(400)
                    .message(e.getMessage())
                    .build();
        } catch (Exception e) {
            return Response.builder()
                    .status(500)
                    .message("Lỗi khi tạo đánh giá: " + e.getMessage())
                    .build();
        }
    }

    @Transactional(readOnly = true)
    @Override
    public Response getReviewsByProduct(Long productId) {
        try {
            if (productId == null) throw new OurException("Thiếu productId");

            List<Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
            double avg = reviews.isEmpty()
                    ? 0.0
                    : reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);

            return Response.builder()
                    .status(200)
                    .reviewList(reviews.stream().map(entityDtoMapper::mapReviewToDtoBasic).toList())
                    .averageRating(avg)
                    .totalElement(reviews.size())
                    .build();
        } catch (OurException e) {
            return Response.builder()
                    .status(400)
                    .message(e.getMessage())
                    .build();
        } catch (Exception e) {
            return Response.builder()
                    .status(500)
                    .message("Lỗi khi lấy đánh giá: " + e.getMessage())
                    .build();
        }
    }


    @Transactional(readOnly = true)
    @Override
    public Response getAllReviews() {
        try {
            List<Review> reviews = reviewRepository.findAll();
            return Response.builder()
                    .status(200)
                    .reviewList(reviews.stream().map(entityDtoMapper::mapReviewToDtoBasic).toList())
                    .totalElement(reviews.size())
                    .build();
        } catch (Exception e) {
            return Response.builder()
                    .status(500)
                    .message("Lỗi khi lấy danh sách đánh giá: " + e.getMessage())
                    .build();
        }
    }

    @Transactional
    @Override
    public Response addReply(Long reviewId, String reply) {
        try {
            if (reviewId == null) throw new OurException("Thiếu reviewId");
            if (reply == null || reply.trim().isEmpty()) throw new OurException("Trả lời không được để trống");

            Review review = reviewRepository.findById(reviewId)
                    .orElseThrow(() -> new NotFoundException("Review không tìm thấy"));

            review.setReply(reply.trim());
            Review saved = reviewRepository.save(review);

            return Response.builder()
                    .status(200)
                    .message("Đã thêm trả lời")
                    .review(entityDtoMapper.mapReviewToDtoBasic(saved))
                    .build();
        } catch (OurException e) {
            return Response.builder()
                    .status(400)
                    .message(e.getMessage())
                    .build();
        } catch (Exception e) {
            return Response.builder()
                    .status(500)
                    .message("Lỗi khi thêm trả lời: " + e.getMessage())
                    .build();
        }
    }
}
