package com.phegondev.Phegon.Eccormerce.service.interf;

import com.phegondev.Phegon.Eccormerce.dto.Response;

public interface WishlistService {
    Response addToWishlist(Long productId);
    Response removeFromWishlist(Long productId);
    Response getWishlist();
    Response countWishlistByProduct(Long productId);
}
