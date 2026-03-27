package com.phegondev.Phegon.Eccormerce.service.impl;

import com.phegondev.Phegon.Eccormerce.dto.AddPasswordRequest;
import com.phegondev.Phegon.Eccormerce.dto.LoginRequest;
import com.phegondev.Phegon.Eccormerce.dto.Response;
import com.phegondev.Phegon.Eccormerce.dto.UpdateUserDto;
import com.phegondev.Phegon.Eccormerce.dto.UserDto;
import com.phegondev.Phegon.Eccormerce.entity.OTP;
import com.phegondev.Phegon.Eccormerce.entity.User;
import com.phegondev.Phegon.Eccormerce.entity.UserCredential;
import com.phegondev.Phegon.Eccormerce.enums.UserRole;
import com.phegondev.Phegon.Eccormerce.exception.InvalidCredentialsException;
import com.phegondev.Phegon.Eccormerce.exception.NotFoundException;
import com.phegondev.Phegon.Eccormerce.mapper.EntityDtoMapper;
import com.phegondev.Phegon.Eccormerce.repository.OTPRepository;
import com.phegondev.Phegon.Eccormerce.repository.UserCredentialRepo;
import com.phegondev.Phegon.Eccormerce.repository.UserRepo;
import com.phegondev.Phegon.Eccormerce.security.JwtUtils;
import com.phegondev.Phegon.Eccormerce.service.interf.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;


@Service
@Slf4j
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final OTPRepository otpRepository;
    private final UserRepo userRepo;
    private final UserCredentialRepo userCredentialRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final EntityDtoMapper entityDtoMapper;


    @Override
    @Transactional
    public Response registerUser(UserDto registrationRequest) {
        UserRole role = UserRole.USER;

        if (registrationRequest.getRole() != null && registrationRequest.getRole().equalsIgnoreCase("admin")) {
            role = UserRole.ADMIN;
        }

        // Kiểm tra email đã tồn tại chưa
        Optional<User> existingUser = userRepo.findByEmail(registrationRequest.getEmail());

        if (existingUser.isPresent()) {
            // Email đã tồn tại, kiểm tra xem đã có credential LOCAL chưa
            boolean hasLocalCredential = userCredentialRepo.findByProviderAndProviderId("LOCAL", registrationRequest.getEmail())
                    .isPresent();

            if (hasLocalCredential) {
                return Response.builder()
                        .status(400)
                        .message("Email này đã được đăng ký")
                        .build();
            }

            // User đã đăng ký bằng Google, giờ muốn thêm password
            // Trả về status đặc biệt để frontend biết cần verify OTP
            return Response.builder()
                    .status(202) // 202 Accepted - cần verify OTP
                    .message("Email đã tồn tại. Vui lòng xác thực OTP để thiết lập mật khẩu")
                    .build();
        }

        // Tạo User mới
        User user = User.builder()
                .name(registrationRequest.getName())
                .email(registrationRequest.getEmail())
                .phoneNumber(registrationRequest.getPhoneNumber())
                .role(role)
                .build();

        User savedUser = userRepo.save(user);

        // Tạo UserCredential cho LOCAL provider
        UserCredential credential = UserCredential.builder()
                .user(savedUser)
                .provider("LOCAL")
                .providerId(registrationRequest.getEmail())
                .password(passwordEncoder.encode(registrationRequest.getPassword()))
                .createdAt(LocalDateTime.now())
                .build();

        userCredentialRepo.save(credential);

        UserDto userDto = entityDtoMapper.mapUserToDtoBasic(savedUser);
        return Response.builder()
                .status(200)
                .message("Đăng ký thành công")
                .user(userDto)
                .build();
    }


    @Override
    public Response loginUser(LoginRequest loginRequest) {
        long startTime = System.currentTimeMillis();

        long dbStart = System.currentTimeMillis();
        User user = userRepo.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new NotFoundException("Email not found"));
        log.info("DB query time: {}ms", System.currentTimeMillis() - dbStart);

        // Tìm credential LOCAL
        UserCredential credential = userCredentialRepo.findByProviderAndProviderId("LOCAL", loginRequest.getEmail())
                .orElseThrow(() -> new NotFoundException("Tài khoản chưa được đăng ký"));

        long bcryptStart = System.currentTimeMillis();
        if (!passwordEncoder.matches(loginRequest.getPassword(), credential.getPassword())) {
            throw new InvalidCredentialsException("Password does not match");
        }
        log.info("BCrypt verification time: {}ms", System.currentTimeMillis() - bcryptStart);

        // Cập nhật last_used_at
        credential.setLastUsedAt(LocalDateTime.now());
        userCredentialRepo.save(credential);

        long jwtStart = System.currentTimeMillis();
        String token = jwtUtils.generateToken(user);
        log.info("JWT generation time: {}ms", System.currentTimeMillis() - jwtStart);

        log.info("Total login time: {}ms", System.currentTimeMillis() - startTime);

        return Response.builder()
                .status(200)
                .message("User Successfully Logged In")
                .token(token)
                .expirationTime("6 Month")
                .role(user.getRole().name())
                .build();
    }

    @Override
    public Response getAllUsers() {

        List<User> users = userRepo.findAll();
        List<UserDto> userDtos = users.stream()
                .map(entityDtoMapper::mapUserToDtoBasic)
                .toList();

        return Response.builder()
                .status(200)
                .userList(userDtos)
                .build();
    }

    @Override
    public User getLoginUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        log.info("User Email is: " + email);
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User Not found"));
    }

    @Override
    @Transactional
    public Response getUserInfoAndOrderHistory() {
        User user = getLoginUser();
        UserDto userDto = mapUserToDtoPlusAddressAndOrderHistory(user);

        return Response.builder()
                .status(200)
                .user(userDto)
                .build();
    }

    private UserDto mapUserToDtoPlusAddressAndOrderHistory(User user) {
        UserDto userDto = entityDtoMapper.mapUserToDtoPlusAddress(user);

        if (user.getOrderItemList() != null && !user.getOrderItemList().isEmpty()) {
            // Gom orderItems theo order
            java.util.Map<Long, com.phegondev.Phegon.Eccormerce.dto.OrderDto> orderMap = new java.util.LinkedHashMap<>();
            for (com.phegondev.Phegon.Eccormerce.entity.OrderItem item : user.getOrderItemList()) {
                if (item.getOrder() == null) continue;
                Long orderId = item.getOrder().getId();
                orderMap.computeIfAbsent(orderId, id -> {
                    com.phegondev.Phegon.Eccormerce.dto.OrderDto dto = entityDtoMapper.mapOrderToDtoBasic(item.getOrder());
                    dto.setOrderItemList(new java.util.ArrayList<>());
                    return dto;
                });
                orderMap.get(orderId).getOrderItemList().add(entityDtoMapper.mapOrderItemToDtoPlusProduct(item));
            }
            userDto.setOrderList(new java.util.ArrayList<>(orderMap.values()));
        }
        return userDto;
    }

    @Override
    @Transactional
    public Response updateUser(UpdateUserDto updateUserDto) {
        try {
            User user = getLoginUser();

            // Chặn ADMIN tự sửa email của chính mình
            if (user.getRole() == UserRole.ADMIN && updateUserDto.getEmail() != null && !updateUserDto.getEmail().trim().isEmpty()) {
                if (!user.getEmail().equals(updateUserDto.getEmail())) {
                    return Response.builder()
                            .status(403)
                            .message("Không thể thay đổi email của tài khoản ADMIN")
                            .build();
                }
            }

            if (updateUserDto.getName() != null && !updateUserDto.getName().trim().isEmpty()) {
                user.setName(updateUserDto.getName());
            }

            if (updateUserDto.getEmail() != null && !updateUserDto.getEmail().trim().isEmpty()) {
                String oldEmail = user.getEmail();
                String newEmail = updateUserDto.getEmail();

                if (!oldEmail.equals(newEmail)) {
                    if (userRepo.existsByEmail(newEmail)) {
                        return Response.builder()
                                .status(400)
                                .message("Email này đã được sử dụng")
                                .build();
                    }

                    user.setEmail(newEmail);

                    // Update provider_id trong credential LOCAL
                    Optional<UserCredential> localCredential = userCredentialRepo
                            .findByProviderAndProviderId("LOCAL", oldEmail);

                    if (localCredential.isPresent()) {
                        localCredential.get().setProviderId(newEmail);
                        userCredentialRepo.save(localCredential.get());
                    }
                }
            }

            if (updateUserDto.getPhoneNumber() != null && !updateUserDto.getPhoneNumber().trim().isEmpty()) {
                user.setPhoneNumber(updateUserDto.getPhoneNumber());
            }

            if (updateUserDto.getPassword() != null && !updateUserDto.getPassword().trim().isEmpty()) {
                if (updateUserDto.getPassword().length() < 6) {
                    return Response.builder()
                            .status(400)
                            .message("Mật khẩu phải có ít nhất 6 ký tự")
                            .build();
                }
                // Cập nhật password trong credential
                UserCredential credential = userCredentialRepo.findByProviderAndProviderId("LOCAL", user.getEmail())
                        .orElseThrow(() -> new NotFoundException("Credential not found"));
                credential.setPassword(passwordEncoder.encode(updateUserDto.getPassword()));
                userCredentialRepo.save(credential);
            }

            userRepo.save(user);

            UserDto userDto = entityDtoMapper.mapUserToDtoBasic(user);
            return Response.builder()
                    .status(200)
                    .message("Cập nhật thông tin người dùng thành công")
                    .user(userDto)
                    .build();

        } catch (Exception e) {
            return Response.builder()
                    .status(500)
                    .message("Lỗi khi cập nhật thông tin: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public Response getUserById(Long userId) {
        try {
            User user = userRepo.findById(userId)
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng"));
            UserDto userDto = entityDtoMapper.mapUserToDtoPlusAddress(user);
            return Response.builder()
                    .status(200)
                    .user(userDto)
                    .build();
        } catch (NotFoundException e) {
            return Response.builder()
                    .status(404)
                    .message(e.getMessage())
                    .build();
        } catch (Exception e) {
            return Response.builder()
                    .status(500)
                    .message("Lỗi khi lấy thông tin người dùng: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public Response deleteUser(Long userId) {
        try {
            User user = userRepo.findById(userId)
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng"));

            if (user.getRole() == UserRole.ADMIN) {
                return Response.builder()
                        .status(400)
                        .message("Không thể xóa tài khoản ADMIN")
                        .build();
            }

            userRepo.delete(user);
            return Response.builder()
                    .status(200)
                    .message("Xóa người dùng thành công")
                    .build();
        } catch (NotFoundException e) {
            return Response.builder()
                    .status(404)
                    .message(e.getMessage())
                    .build();
        } catch (Exception e) {
            return Response.builder()
                    .status(500)
                    .message("Lỗi khi xóa người dùng: " + e.getMessage())
                    .build();
        }
    }

    @Override
    @Transactional
    public Response adminUpdateUser(Long userId, UpdateUserDto updateUserDto) {
        try {
            User user = userRepo.findById(userId)
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng"));

            // Chặn không cho đổi email của ADMIN
            if (user.getRole() == UserRole.ADMIN && updateUserDto.getEmail() != null && !updateUserDto.getEmail().trim().isEmpty()) {
                if (!user.getEmail().equals(updateUserDto.getEmail())) {
                    return Response.builder()
                            .status(403)
                            .message("Không thể thay đổi email của tài khoản ADMIN")
                            .build();
                }
            }

            if (updateUserDto.getName() != null && !updateUserDto.getName().trim().isEmpty()) {
                user.setName(updateUserDto.getName());
            }

            if (updateUserDto.getEmail() != null && !updateUserDto.getEmail().trim().isEmpty()) {
                String oldEmail = user.getEmail();
                String newEmail = updateUserDto.getEmail();

                if (!oldEmail.equals(newEmail)) {
                    if (userRepo.existsByEmail(newEmail)) {
                        return Response.builder()
                                .status(400)
                                .message("Email này đã được sử dụng")
                                .build();
                    }

                    user.setEmail(newEmail);

                    // Update provider_id trong credential LOCAL
                    Optional<UserCredential> localCredential = userCredentialRepo
                            .findByProviderAndProviderId("LOCAL", oldEmail);

                    if (localCredential.isPresent()) {
                        localCredential.get().setProviderId(newEmail);
                        userCredentialRepo.save(localCredential.get());
                    }
                }
            }

            if (updateUserDto.getPhoneNumber() != null && !updateUserDto.getPhoneNumber().trim().isEmpty()) {
                user.setPhoneNumber(updateUserDto.getPhoneNumber());
            }

            if (updateUserDto.getPassword() != null && !updateUserDto.getPassword().trim().isEmpty()) {
                if (updateUserDto.getPassword().length() < 6) {
                    return Response.builder()
                            .status(400)
                            .message("Mật khẩu phải có ít nhất 6 ký tự")
                            .build();
                }
                // Cập nhật password trong credential
                UserCredential credential = userCredentialRepo.findByProviderAndProviderId("LOCAL", user.getEmail())
                        .orElse(null);
                if (credential != null) {
                    credential.setPassword(passwordEncoder.encode(updateUserDto.getPassword()));
                    userCredentialRepo.save(credential);
                }
            }

            if (updateUserDto.getRole() != null && !updateUserDto.getRole().trim().isEmpty()) {
                // Chặn không cho đổi role của ADMIN về USER
                if (user.getRole() == UserRole.ADMIN && !updateUserDto.getRole().equalsIgnoreCase("ADMIN")) {
                    return Response.builder()
                            .status(403)
                            .message("Không thể thay đổi role của tài khoản ADMIN")
                            .build();
                }

                try {
                    UserRole role = UserRole.valueOf(updateUserDto.getRole().toUpperCase());
                    user.setRole(role);
                } catch (IllegalArgumentException e) {
                    return Response.builder()
                            .status(400)
                            .message("Role không hợp lệ")
                            .build();
                }
            }

            userRepo.save(user);

            UserDto userDto = entityDtoMapper.mapUserToDtoBasic(user);
            return Response.builder()
                    .status(200)
                    .message("Cập nhật người dùng thành công")
                    .user(userDto)
                    .build();

        } catch (NotFoundException e) {
            return Response.builder()
                    .status(404)
                    .message(e.getMessage())
                    .build();
        } catch (Exception e) {
            return Response.builder()
                    .status(500)
                    .message("Lỗi khi cập nhật người dùng: " + e.getMessage())
                    .build();
        }
    }

    @Override
    @Transactional
    public Response addPasswordToExistingUser(AddPasswordRequest request) {
        try {
            User user = userRepo.findByEmail(request.getEmail())
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy user"));

            Optional<UserCredential> existingCredential = userCredentialRepo
                    .findByProviderAndProviderId("LOCAL", request.getEmail());

            if (existingCredential.isPresent()) {
                return Response.builder()
                        .status(400)
                        .message("Email này đã có mật khẩu")
                        .build();
            }


            UserCredential credential = UserCredential.builder()
                    .user(user)
                    .provider("LOCAL")
                    .providerId(request.getEmail())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .createdAt(LocalDateTime.now())
                    .build();

            userCredentialRepo.save(credential);

            return Response.builder()
                    .status(200)
                    .message("Thiết lập mật khẩu thành công")
                    .build();

        } catch (NotFoundException e) {
            return Response.builder()
                    .status(404)
                    .message(e.getMessage())
                    .build();
        } catch (Exception e) {
            return Response.builder()
                    .status(500)
                    .message("Lỗi khi thiết lập mật khẩu: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public boolean checkEmailExists(String email) {
        return userRepo.existsByEmail(email);
    }

    @Override
    @Transactional
    public Response resetPassword(String email, String newPassword, String otpCode) {
        try {
            // Verify OTP first
            var otpOptional = otpRepository.findByEmailAndCodeAndIsUsedFalse(email, otpCode);
            if (otpOptional.isEmpty()) {
                return Response.builder()
                        .status(400)
                        .message("Mã OTP không hợp lệ hoặc đã được sử dụng")
                        .build();
            }

            OTP otp = otpOptional.get();
            if (LocalDateTime.now().isAfter(otp.getExpiresAt())) {
                return Response.builder()
                        .status(400)
                        .message("Mã OTP đã hết hạn")
                        .build();
            }

            // Find user
            User user = userRepo.findByEmail(email)
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng"));

            // Find LOCAL credential
            UserCredential credential = userCredentialRepo.findByProviderAndProviderId("LOCAL", email)
                    .orElseThrow(() -> new NotFoundException("Tài khoản không hỗ trợ đặt lại mật khẩu"));

            // Validate password
            if (newPassword.length() < 6) {
                return Response.builder()
                        .status(400)
                        .message("Mật khẩu phải có ít nhất 6 ký tự")
                        .build();
            }

            // Update password
            credential.setPassword(passwordEncoder.encode(newPassword));
            userCredentialRepo.save(credential);

            // Mark OTP as used
            otp.setIsUsed(true);
            otp.setUsedAt(LocalDateTime.now());
            otpRepository.save(otp);

            return Response.builder()
                    .status(200)
                    .message("Đặt lại mật khẩu thành công")
                    .build();

        } catch (NotFoundException e) {
            return Response.builder()
                    .status(404)
                    .message(e.getMessage())
                    .build();
        } catch (Exception e) {
            return Response.builder()
                    .status(500)
                    .message("Lỗi khi đặt lại mật khẩu: " + e.getMessage())
                    .build();
        }
    }
}