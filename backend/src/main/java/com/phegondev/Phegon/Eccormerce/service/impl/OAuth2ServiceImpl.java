package com.phegondev.Phegon.Eccormerce.service.impl;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.phegondev.Phegon.Eccormerce.dto.Response;
import com.phegondev.Phegon.Eccormerce.entity.User;
import com.phegondev.Phegon.Eccormerce.entity.UserCredential;
import com.phegondev.Phegon.Eccormerce.enums.UserRole;
import com.phegondev.Phegon.Eccormerce.repository.UserCredentialRepo;
import com.phegondev.Phegon.Eccormerce.repository.UserRepo;
import com.phegondev.Phegon.Eccormerce.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;

@Service
@RequiredArgsConstructor
@Slf4j
public class OAuth2ServiceImpl {

    private final UserRepo userRepo;
    private final UserCredentialRepo userCredentialRepo;
    private final JwtUtils jwtUtils;

    @Value("${google.client.id}")
    private String googleClientId;

    @Transactional
    public Response authenticateGoogleUser(String idTokenString) {
        try {
            // Verify Google token
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), 
                    GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            
            if (idToken == null) {
                return Response.builder()
                        .status(401)
                        .message("Token Google không hợp lệ")
                        .build();
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String googleId = payload.getSubject();

            log.info("Google login attempt for email: {}", email);

            // Tìm credential với Google provider
            UserCredential credential = userCredentialRepo.findByProviderAndProviderId("GOOGLE", googleId)
                    .orElseGet(() -> {
                        // Chưa có credential Google
                        // Kiểm tra user có tồn tại không (có thể đã đăng ký bằng email)
                        User user = userRepo.findByEmail(email)
                                .orElseGet(() -> {
                                    // Tạo user mới
                                    User newUser = User.builder()
                                            .email(email)
                                            .name(name)
                                            .role(UserRole.USER)
                                            .build();
                                    log.info("Creating new user for Google: {}", email);
                                    return userRepo.save(newUser);
                                });

                        // Tạo credential mới cho Google (link account)
                        UserCredential newCredential = UserCredential.builder()
                                .user(user)
                                .provider("GOOGLE")
                                .providerId(googleId)
                                .createdAt(LocalDateTime.now())
                                .build();
                        
                        log.info("Linking Google account to user: {}", email);
                        return userCredentialRepo.save(newCredential);
                    });

            // Cập nhật last_used_at
            credential.setLastUsedAt(LocalDateTime.now());
            userCredentialRepo.save(credential);

            User user = credential.getUser();

            // Generate JWT token
            String token = jwtUtils.generateToken(user);

            return Response.builder()
                    .status(200)
                    .message("Đăng nhập Google thành công")
                    .token(token)
                    .role(user.getRole().name())
                    .expirationTime("6 Month")
                    .build();

        } catch (Exception e) {
            log.error("Error during Google authentication", e);
            return Response.builder()
                    .status(500)
                    .message("Lỗi khi xác thực Google: " + e.getMessage())
                    .build();
        }
    }
}
