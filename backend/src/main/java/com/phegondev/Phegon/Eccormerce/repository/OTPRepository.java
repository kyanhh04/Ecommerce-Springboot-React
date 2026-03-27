package com.phegondev.Phegon.Eccormerce.repository;

import com.phegondev.Phegon.Eccormerce.entity.OTP;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OTPRepository extends JpaRepository<OTP, Long> {
    Optional<OTP> findByEmailAndIsUsedFalse(String email);
    Optional<OTP> findByEmailAndCodeAndIsUsedFalse(String email, String code);
    void deleteByExpiresAtBefore(LocalDateTime now);
    void deleteByEmail(String email);
}
