package com.phegondev.Phegon.Eccormerce.service.interf;

import com.phegondev.Phegon.Eccormerce.dto.Response;
import com.phegondev.Phegon.Eccormerce.entity.User;

public interface OTPService {
    String generateOTP(User user, String type);
    Response verifyOTP(String code, User user);
    Response requestOTP(String type);
}
