package com.phegondev.Phegon.Eccormerce.controller;

import com.phegondev.Phegon.Eccormerce.dto.Response;
import com.phegondev.Phegon.Eccormerce.service.interf.UserDiscountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user-discounts")
@RequiredArgsConstructor
public class UserDiscountController {

    private final UserDiscountService userDiscountService;

    @GetMapping("/my-discounts")
    @PreAuthorize("hasAuthority('USER') or hasAuthority('ADMIN')")
    public ResponseEntity<Response> getMyDiscounts() {
        Response response = userDiscountService.getMyDiscounts();
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping("/assign")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> assignDiscountToUser(
            @RequestParam Long userId,
            @RequestParam Long discountId) {
        Response response = userDiscountService.assignDiscountToUser(userId, discountId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }
}
