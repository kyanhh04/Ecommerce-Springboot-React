package com.phegondev.Phegon.Eccormerce.service.impl;

import com.phegondev.Phegon.Eccormerce.dto.ProductDto;
import com.phegondev.Phegon.Eccormerce.dto.Response;
import com.phegondev.Phegon.Eccormerce.dto.WishlistDto;
import com.phegondev.Phegon.Eccormerce.entity.Product;
import com.phegondev.Phegon.Eccormerce.entity.User;
import com.phegondev.Phegon.Eccormerce.entity.Wishlist;
import com.phegondev.Phegon.Eccormerce.exception.NotFoundException;
import com.phegondev.Phegon.Eccormerce.repository.ProductRepository;
import com.phegondev.Phegon.Eccormerce.repository.WishlistRepository;
import com.phegondev.Phegon.Eccormerce.service.interf.UserService;
import com.phegondev.Phegon.Eccormerce.service.interf.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final UserService userService;

    @Override
    @Transactional
    public Response addToWishlist(Long productId) {
        User user = userService.getLoginUser();
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Sản phẩm không tồn tại"));

        if (wishlistRepository.existsByUserIdAndProductId(user.getId(), productId)) {
            return Response.builder().status(400).message("Sản phẩm đã có trong danh sách yêu thích").build();
        }

        Wishlist wishlist = new Wishlist();
        wishlist.setUser(user);
        wishlist.setProduct(product);
        wishlistRepository.save(wishlist);

        return Response.builder().status(200).message("Đã thêm vào danh sách yêu thích").build();
    }

    @Override
    public Response removeFromWishlist(Long productId) {
        User user = userService.getLoginUser();
        Wishlist wishlist = wishlistRepository.findByUserIdAndProductId(user.getId(), productId)
                .orElseThrow(() -> new NotFoundException("Sản phẩm không có trong danh sách yêu thích"));

        wishlistRepository.delete(wishlist);
        return Response.builder().status(200).message("Đã xóa khỏi danh sách yêu thích").build();
    }

    @Override
    @Transactional(readOnly = true)
    public Response getWishlist() {
        User user = userService.getLoginUser();
        List<Wishlist> wishlists = wishlistRepository.findByUserId(user.getId());

        List<WishlistDto> wishlistDtos = wishlists.stream().map(w -> {
            WishlistDto dto = new WishlistDto();
            dto.setId(w.getId());
            dto.setCreatedAt(w.getCreatedAt());
            ProductDto productDto = new ProductDto();
            productDto.setId(w.getProduct().getId());
            productDto.setName(w.getProduct().getName());
            productDto.setDescription(w.getProduct().getDescription());
            productDto.setPrice(w.getProduct().getPrice());
            productDto.setImageUrl(w.getProduct().getImageUrl());
            dto.setProduct(productDto);
            return dto;
        }).toList();

        return Response.builder().status(200).wishlistList(wishlistDtos).build();
    }

    @Override
    public Response countWishlistByProduct(Long productId) {
        long count = wishlistRepository.countByProductId(productId);
        return Response.builder().status(200).message(String.valueOf(count)).build();
    }
}
