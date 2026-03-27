package com.phegondev.Phegon.Eccormerce.dto;

import lombok.Data;

@Data
public class AddPasswordRequest {
    private String email;
    private String password;
    private String otpCode;
}
