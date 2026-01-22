package com.phegondev.Phegon.Eccormerce.controller;

import com.phegondev.Phegon.Eccormerce.dto.DiscountDTO;
import com.phegondev.Phegon.Eccormerce.dto.Response;
import com.phegondev.Phegon.Eccormerce.service.interf.DiscountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/discounts")
@RequiredArgsConstructor
public class DiscountController {

    private final DiscountService discountService;

    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Response> createDiscount(@RequestBody DiscountDTO discountDTO) {
        return ResponseEntity.ok(discountService.createDiscount(discountDTO));
    }

    @PutMapping("/update/{discountId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Response> updateDiscount(
            @PathVariable Long discountId,
            @RequestBody DiscountDTO discountDTO) {
        return ResponseEntity.ok(discountService.updateDiscount(discountId, discountDTO));
    }

    @DeleteMapping("/delete/{discountId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Response> deleteDiscount(@PathVariable Long discountId) {
        return ResponseEntity.ok(discountService.deleteDiscount(discountId));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Response> getAllDiscounts() {
        return ResponseEntity.ok(discountService.getAllDiscounts());
    }

    @GetMapping("/{discountId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Response> getDiscountById(@PathVariable Long discountId) {
        return ResponseEntity.ok(discountService.getDiscountById(discountId));
    }

    @GetMapping("/code/{code}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Response> getDiscountByCode(@PathVariable String code) {
        return ResponseEntity.ok(discountService.getDiscountByCode(code));
    }

    @GetMapping("/active/list")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Response> getActiveDiscounts() {
        return ResponseEntity.ok(discountService.getActiveDiscounts());
    }

    @PostMapping("/validate")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Response> validateDiscount(
            @RequestParam String code,
            @RequestParam Long orderId) {
        return ResponseEntity.ok(discountService.validateAndApplyDiscount(code, orderId));
    }
}
