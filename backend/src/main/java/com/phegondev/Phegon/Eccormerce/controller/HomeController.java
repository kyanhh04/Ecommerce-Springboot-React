package com.phegondev.Phegon.Eccormerce.controller;

import com.phegondev.Phegon.Eccormerce.dto.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public ResponseEntity<Response> home() {
        Response response = Response.builder()
                .status(HttpStatus.OK.value())
                .message("Welcome to Phegon E-commerce API")
                .build();
        return ResponseEntity.ok(response);
    }
}
