package com.phegondev.Phegon.Eccormerce.service.interf;

import com.phegondev.Phegon.Eccormerce.dto.Response;

public interface UserDiscountService {
    Response getMyDiscounts();
    Response assignDiscountToUser(Long userId, Long discountId);
    void autoAssignDiscountsToNewUser(Long userId);
}
