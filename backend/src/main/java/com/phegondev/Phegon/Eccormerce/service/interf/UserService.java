package com.phegondev.Phegon.Eccormerce.service.interf;

import com.phegondev.Phegon.Eccormerce.dto.AddPasswordRequest;
import com.phegondev.Phegon.Eccormerce.dto.LoginRequest;
import com.phegondev.Phegon.Eccormerce.dto.Response;
import com.phegondev.Phegon.Eccormerce.dto.UpdateUserDto;
import com.phegondev.Phegon.Eccormerce.dto.UserDto;
import com.phegondev.Phegon.Eccormerce.entity.User;

public interface UserService {
    Response registerUser(UserDto registrationRequest);
    Response loginUser(LoginRequest loginRequest);
    Response getAllUsers();
    Response getUserById(Long userId);
    Response deleteUser(Long userId);
    Response adminUpdateUser(Long userId, UpdateUserDto updateUserDto);
    User getLoginUser();
    Response getUserInfoAndOrderHistory();
    Response updateUser(UpdateUserDto updateUserDto);
    Response addPasswordToExistingUser(AddPasswordRequest request);
    Response resetPassword(String email, String newPassword, String otpCode);
    boolean checkEmailExists(String email);
}
