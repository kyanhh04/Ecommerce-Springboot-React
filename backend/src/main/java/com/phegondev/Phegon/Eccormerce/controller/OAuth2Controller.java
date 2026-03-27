package com.phegondev.Phegon.Eccormerce.controller;

import com.phegondev.Phegon.Eccormerce.dto.GoogleTokenRequest;
import com.phegondev.Phegon.Eccormerce.dto.Response;
import com.phegondev.Phegon.Eccormerce.service.impl.OAuth2ServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth/oauth2")
@RequiredArgsConstructor
public class OAuth2Controller {

    private final OAuth2ServiceImpl oAuth2Service;

    @PostMapping("/google")
    public ResponseEntity<Response> googleLogin(@RequestBody GoogleTokenRequest request) {
        Response response = oAuth2Service.authenticateGoogleUser(request.getToken());
        return ResponseEntity.status(response.getStatus()).body(response);
    }
}
