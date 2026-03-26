package com.phegondev.Phegon.Eccormerce.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Data
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String content;
    private int rating; // assuming it is in 1 to 10

    @OneToMany(mappedBy = "review", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ReviewReply> replies = new ArrayList<>(); // Multiple replies support

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "created_at")
    private final LocalDateTime createdAt = LocalDateTime.now();

    // equals method
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Review review = (Review) o;
        return rating == review.rating &&
                Objects.equals(id, review.id) &&
                Objects.equals(content, review.content) &&
                Objects.equals(product, review.product) &&
                Objects.equals(user, review.user);
    }

    // hashCode method
    @Override
    public int hashCode() {
        return Objects.hash(id, content, rating, product, user);
    }

    // canEqual method
    public boolean canEqual(Object other) {
        return other instanceof Review;
    }
}
