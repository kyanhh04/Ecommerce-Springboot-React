package com.phegondev.Phegon.Eccormerce.service.interf;

import com.phegondev.Phegon.Eccormerce.dto.Response;

public interface OTPService {
    Response sendRegistrationOTP(String email);
    Response verifyRegistrationOTP(String email, String code);
    Response sendForgotPasswordOTP(String email);
    Response verifyForgotPasswordOTP(String email, String code);
}
