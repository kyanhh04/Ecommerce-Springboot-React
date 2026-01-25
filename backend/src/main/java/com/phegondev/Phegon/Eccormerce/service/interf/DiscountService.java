package com.phegondev.Phegon.Eccormerce.service.interf;

import com.phegondev.Phegon.Eccormerce.dto.DiscountDTO;
import com.phegondev.Phegon.Eccormerce.dto.Response;

public interface DiscountService {
    Response createDiscount(DiscountDTO discountDTO);
    Response updateDiscount(Long discountId, DiscountDTO discountDTO);
    Response deleteDiscount(Long discountId);
    Response getAllDiscounts();
    Response getDiscountById(Long discountId);
    Response getDiscountByCode(String code);
    Response getActiveDiscounts();
    Response validateAndApplyDiscount(String code, Long orderId);
    void decreaseDiscountUsage(String code);
}
