package com.phegondev.Phegon.Eccormerce.controller;


import com.phegondev.Phegon.Eccormerce.dto.AddPasswordRequest;
import com.phegondev.Phegon.Eccormerce.dto.LoginRequest;
import com.phegondev.Phegon.Eccormerce.dto.Response;
import com.phegondev.Phegon.Eccormerce.dto.UserDto;
import com.phegondev.Phegon.Eccormerce.service.interf.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<Response> registerUser(@RequestBody  UserDto registrationRequest){
        System.out.println(registrationRequest);
        return ResponseEntity.ok(userService.registerUser(registrationRequest));
    }
    
    @PostMapping("/login")
    public ResponseEntity<Response> loginUser(@RequestBody LoginRequest loginRequest){
        return ResponseEntity.ok(userService.loginUser(loginRequest));
    }
    
    @PostMapping("/add-password")
    public ResponseEntity<Response> addPassword(@RequestBody AddPasswordRequest request){
        return ResponseEntity.ok(userService.addPasswordToExistingUser(request));
    }
    
    @GetMapping("/check-email")
    public ResponseEntity<Map<String, Boolean>> checkEmailExists(@RequestParam String email){
        boolean exists = userService.checkEmailExists(email);
        return ResponseEntity.ok(Map.of("exists", exists));
    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<Response> resetPassword(
            @RequestParam String email,
            @RequestParam String newPassword,
            @RequestParam String otpCode) {
        return ResponseEntity.ok(userService.resetPassword(email, newPassword, otpCode));
    }
}
