package com.phegondev.Phegon.Eccormerce.service.impl;

import com.phegondev.Phegon.Eccormerce.dto.LoginRequest;
import com.phegondev.Phegon.Eccormerce.dto.Response;
import com.phegondev.Phegon.Eccormerce.dto.UpdateUserDto;
import com.phegondev.Phegon.Eccormerce.dto.UserDto;
import com.phegondev.Phegon.Eccormerce.entity.User;
import com.phegondev.Phegon.Eccormerce.enums.UserRole;
import com.phegondev.Phegon.Eccormerce.exception.InvalidCredentialsException;
import com.phegondev.Phegon.Eccormerce.exception.NotFoundException;
import com.phegondev.Phegon.Eccormerce.mapper.EntityDtoMapper;
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

import java.util.List;
import java.util.stream.Collectors;


@Service
@Slf4j
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {


    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final EntityDtoMapper entityDtoMapper;


    @Override
    public Response registerUser(UserDto registrationRequest) {
        UserRole role = UserRole.USER;

        if (registrationRequest.getRole() != null && registrationRequest.getRole().equalsIgnoreCase("admin")) {
            role = UserRole.ADMIN;
        }

        User user = User.builder()
                .name(registrationRequest.getName())
                .email(registrationRequest.getEmail())
                .password(passwordEncoder.encode(registrationRequest.getPassword()))
                .phoneNumber(registrationRequest.getPhoneNumber())
                .role(role)
                .build();

        User savedUser = userRepo.save(user);
        System.out.println(savedUser);

        UserDto userDto = entityDtoMapper.mapUserToDtoBasic(savedUser);
        return Response.builder()
                .status(200)
                .message("User Successfully Added")
                .user(userDto)
                .build();
    }



    @Override
    public Response loginUser(LoginRequest loginRequest) {

        User user = userRepo.findByEmail(loginRequest.getEmail()).orElseThrow(()-> new NotFoundException("Email not found"));
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())){
            throw new InvalidCredentialsException("Password does not match");
        }
        String token = jwtUtils.generateToken(user);

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
        String  email = authentication.getName();
        log.info("User Email is: " + email);
        return userRepo.findByEmail(email)
                .orElseThrow(()-> new UsernameNotFoundException("User Not found"));
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
    public Response updateUser(UpdateUserDto updateUserDto) {
        try {
            User user = getLoginUser();
            if (updateUserDto.getName() != null && !updateUserDto.getName().trim().isEmpty()) {
                user.setName(updateUserDto.getName());
            }

            if (updateUserDto.getEmail() != null && !updateUserDto.getEmail().trim().isEmpty()) {

                if (!user.getEmail().equals(updateUserDto.getEmail()) && 
                    userRepo.existsByEmail(updateUserDto.getEmail())) {
                    return Response.builder()
                            .status(400)
                            .message("Email này đã được sử dụng")
                            .build();
                }
                user.setEmail(updateUserDto.getEmail());
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
                user.setPassword(passwordEncoder.encode(updateUserDto.getPassword()));
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
    public Response adminUpdateUser(Long userId, UpdateUserDto updateUserDto) {
        try {
            User user = userRepo.findById(userId)
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng"));

            if (updateUserDto.getName() != null && !updateUserDto.getName().trim().isEmpty()) {
                user.setName(updateUserDto.getName());
            }

            if (updateUserDto.getEmail() != null && !updateUserDto.getEmail().trim().isEmpty()) {
                if (!user.getEmail().equals(updateUserDto.getEmail()) && 
                    userRepo.existsByEmail(updateUserDto.getEmail())) {
                    return Response.builder()
                            .status(400)
                            .message("Email này đã được sử dụng")
                            .build();
                }
                user.setEmail(updateUserDto.getEmail());
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
                user.setPassword(passwordEncoder.encode(updateUserDto.getPassword()));
            }

            if (updateUserDto.getRole() != null && !updateUserDto.getRole().trim().isEmpty()) {
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
}
