package com.phegondev.Phegon.Eccormerce.service.impl;

import com.phegondev.Phegon.Eccormerce.dto.CreateReviewRequest;
import com.phegondev.Phegon.Eccormerce.dto.Response;
import com.phegondev.Phegon.Eccormerce.entity.Product;
import com.phegondev.Phegon.Eccormerce.entity.Review;
import com.phegondev.Phegon.Eccormerce.entity.ReviewReply;
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

import java.time.LocalDateTime;
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
    public Response getReviewsByProduct(Long productId, int page, int size) {
        try {
            if (productId == null) throw new OurException("Thiếu productId");

            List<Review> allReviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
            double avg = allReviews.isEmpty()
                    ? 0.0
                    : allReviews.stream().mapToInt(Review::getRating).average().orElse(0.0);

            int totalElements = allReviews.size();
            int totalPages = (int) Math.ceil((double) totalElements / size);
            int start = page * size;
            int end = Math.min(start + size, totalElements);

            List<Review> pagedReviews = start < totalElements 
                    ? allReviews.subList(start, end) 
                    : List.of();

            return Response.builder()
                    .status(200)
                    .reviewList(pagedReviews.stream().map(entityDtoMapper::mapReviewToDtoBasic).toList())
                    .averageRating(avg)
                    .totalElement(totalElements)
                    .totalPage(totalPages)
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

    @Transactional
    @Override
    public Response deleteReview(Long reviewId) {
        try {
            if (reviewId == null) throw new OurException("Thiếu reviewId");

            Review review = reviewRepository.findById(reviewId)
                    .orElseThrow(() -> new NotFoundException("Review không tìm thấy"));

            reviewRepository.delete(review);

            return Response.builder()
                    .status(200)
                    .message("Đã xóa đánh giá")
                    .build();
        } catch (OurException | NotFoundException e) {
            return Response.builder()
                    .status(400)
                    .message(e.getMessage())
                    .build();
        } catch (Exception e) {
            return Response.builder()
                    .status(500)
                    .message("Lỗi khi xóa đánh giá: " + e.getMessage())
                    .build();
        }
    }

    @Transactional
    @Override
    public Response deleteReply(Long reviewId) {
        try {
            if (reviewId == null) throw new OurException("Thiếu reviewId");

            Review review = reviewRepository.findById(reviewId)
                    .orElseThrow(() -> new NotFoundException("Review không tìm thấy"));

            reviewRepository.save(review);

            return Response.builder()
                    .status(200)
                    .message("Đã xóa trả lời")
                    .build();
        } catch (OurException | NotFoundException e) {
            return Response.builder()
                    .status(400)
                    .message(e.getMessage())
                    .build();
        } catch (Exception e) {
            return Response.builder()
                    .status(500)
                    .message("Lỗi khi xóa trả lời: " + e.getMessage())
                    .build();
        }
    }

    // Multiple replies support
    @Transactional
    @Override
    public Response addNewReply(Long reviewId, String content) {
        try {
            if (reviewId == null) throw new OurException("Thiếu reviewId");
            if (content == null || content.trim().isEmpty()) {
                throw new OurException("Nội dung trả lời không được để trống");
            }

            Review review = reviewRepository.findById(reviewId)
                    .orElseThrow(() -> new NotFoundException("Review không tìm thấy"));

            ReviewReply reviewReply = new ReviewReply();
            reviewReply.setContent(content.trim());
            reviewReply.setReview(review);
            reviewReply.setCreatedAt(LocalDateTime.now());

            review.getReplies().add(reviewReply);
            
            reviewRepository.save(review);

            return Response.builder()
                    .status(200)
                    .message("Đã thêm trả lời mới")
                    .reviewReply(entityDtoMapper.mapReviewReplyToDto(reviewReply))
                    .build();
        } catch (OurException | NotFoundException e) {
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

    @Transactional
    @Override
    public Response updateReply(Long replyId, String content) {
        try {
            if (replyId == null) throw new OurException("Thiếu replyId");
            if (content == null || content.trim().isEmpty()) {
                throw new OurException("Nội dung trả lời không được để trống");
            }

            Review review = reviewRepository.findAll().stream()
                    .filter(r -> r.getReplies().stream().anyMatch(reply -> reply.getId().equals(replyId)))
                    .findFirst()
                    .orElseThrow(() -> new NotFoundException("Review không tìm thấy"));

            ReviewReply reviewReply = review.getReplies().stream()
                    .filter(reply -> reply.getId().equals(replyId))
                    .findFirst()
                    .orElseThrow(() -> new NotFoundException("Trả lời không tìm thấy"));

            reviewReply.setContent(content.trim());
            reviewReply.setUpdatedAt(LocalDateTime.now());
            reviewRepository.save(review);

            return Response.builder()
                    .status(200)
                    .message("Đã cập nhật trả lời")
                    .reviewReply(entityDtoMapper.mapReviewReplyToDto(reviewReply))
                    .build();
        } catch (OurException | NotFoundException e) {
            return Response.builder()
                    .status(400)
                    .message(e.getMessage())
                    .build();
        } catch (Exception e) {
            return Response.builder()
                    .status(500)
                    .message("Lỗi khi cập nhật trả lời: " + e.getMessage())
                    .build();
        }
    }

    @Transactional
    @Override
    public Response deleteReplyById(Long replyId) {
        try {
            if (replyId == null) throw new OurException("Thiếu replyId");

            Review review = reviewRepository.findAll().stream()
                    .filter(r -> r.getReplies().stream().anyMatch(reply -> reply.getId().equals(replyId)))
                    .findFirst()
                    .orElseThrow(() -> new NotFoundException("Review không tìm thấy"));

            review.getReplies().removeIf(reply -> reply.getId().equals(replyId));
            reviewRepository.save(review);

            return Response.builder()
                    .status(200)
                    .message("Đã xóa trả lời")
                    .build();
        } catch (OurException | NotFoundException e) {
            return Response.builder()
                    .status(400)
                    .message(e.getMessage())
                    .build();
        } catch (Exception e) {
            return Response.builder()
                    .status(500)
                    .message("Lỗi khi xóa trả lời: " + e.getMessage())
                    .build();
        }
    }
}
