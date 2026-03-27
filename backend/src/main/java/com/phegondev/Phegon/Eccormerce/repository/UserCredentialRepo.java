package com.phegondev.Phegon.Eccormerce.repository;

import com.phegondev.Phegon.Eccormerce.entity.UserCredential;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserCredentialRepo extends JpaRepository<UserCredential, Long> {
    
    Optional<UserCredential> findByProviderAndProviderId(String provider, String providerId);
    
    List<UserCredential> findByUserId(Long userId);
    
    boolean existsByProviderAndProviderId(String provider, String providerId);
}
