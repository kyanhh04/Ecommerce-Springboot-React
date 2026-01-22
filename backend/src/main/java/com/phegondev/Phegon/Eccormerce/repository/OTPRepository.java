package com.phegondev.Phegon.Eccormerce.repository;

import com.phegondev.Phegon.Eccormerce.entity.OTP;
import com.phegondev.Phegon.Eccormerce.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OTPRepository extends JpaRepository<OTP, Long> {
    Optional<OTP> findByCodeAndUserAndIsUsedFalse(String code, User user);
    Optional<OTP> findByUserAndTypeAndIsUsedFalse(User user, String type);
    void deleteByExpiresAtBefore(LocalDateTime now);
}
