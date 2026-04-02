package com.phegondev.Phegon.Eccormerce.repository;

import com.phegondev.Phegon.Eccormerce.entity.UserDiscount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserDiscountRepo extends JpaRepository<UserDiscount, Long> {
    
    List<UserDiscount> findByUserIdAndIsUsedFalse(Long userId);
    
    List<UserDiscount> findByUserId(Long userId);
    
    Optional<UserDiscount> findByUserIdAndDiscountId(Long userId, Long discountId);
    
    @Query("SELECT ud FROM UserDiscount ud WHERE ud.user.id = :userId AND ud.discount.code = :code AND ud.isUsed = false")
    Optional<UserDiscount> findByUserIdAndDiscountCodeAndNotUsed(@Param("userId") Long userId, @Param("code") String code);
    
    boolean existsByUserIdAndDiscountId(Long userId, Long discountId);
}
