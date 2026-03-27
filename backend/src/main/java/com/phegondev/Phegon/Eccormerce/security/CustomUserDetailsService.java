package com.phegondev.Phegon.Eccormerce.security;

import com.phegondev.Phegon.Eccormerce.entity.User;
import com.phegondev.Phegon.Eccormerce.entity.UserCredential;
import com.phegondev.Phegon.Eccormerce.exception.NotFoundException;
import com.phegondev.Phegon.Eccormerce.repository.UserCredentialRepo;
import com.phegondev.Phegon.Eccormerce.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepo userRepo;
    private final UserCredentialRepo userCredentialRepo;
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Username ở đây là email
        User user = userRepo.findByEmail(username)
                .orElseThrow(() -> new NotFoundException("User/ Email Not found"));

        // Tìm credential LOCAL của user này
        UserCredential credential = userCredentialRepo.findByProviderAndProviderId("LOCAL", username)
                .orElse(null);

        String password = credential != null ? credential.getPassword() : null;

        return AuthUser.builder()
                .user(user)
                .password(password)
                .build();
    }
}
