package com.phegondev.Phegon.Eccormerce.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "user_credentials", indexes = {
    @Index(name = "idx_credentials_provider_id", columnList = "provider,provider_id"),
    @Index(name = "idx_credentials_user_id", columnList = "user_id")
})
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserCredential {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 50)
    private String provider; // LOCAL, GOOGLE, FACEBOOK, APPLE...

    @Column(name = "provider_id", length = 255)
    private String providerId; // Google ID, Facebook ID...

    @Column(length = 255)
    private String password; // Chỉ dùng cho LOCAL provider

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;
}
