package com.phegondev.Phegon.Eccormerce.service.impl;

import com.phegondev.Phegon.Eccormerce.dto.DiscountDTO;
import com.phegondev.Phegon.Eccormerce.dto.Response;
import com.phegondev.Phegon.Eccormerce.dto.UserDiscountDTO;
import com.phegondev.Phegon.Eccormerce.entity.Discount;
import com.phegondev.Phegon.Eccormerce.entity.User;
import com.phegondev.Phegon.Eccormerce.entity.UserDiscount;
import com.phegondev.Phegon.Eccormerce.exception.NotFoundException;
import com.phegondev.Phegon.Eccormerce.repository.DiscountRepository;
import com.phegondev.Phegon.Eccormerce.repository.UserDiscountRepo;
import com.phegondev.Phegon.Eccormerce.repository.UserRepo;
import com.phegondev.Phegon.Eccormerce.service.interf.UserDiscountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserDiscountServiceImpl implements UserDiscountService {

    private final UserDiscountRepo userDiscountRepo;
    private final DiscountRepository discountRepository;
    private final UserRepo userRepo;

    @Override
    public Response getMyDiscounts() {
        try {
            User user = getLoginUser();
            
            List<UserDiscount> userDiscounts = userDiscountRepo.findByUserId(user.getId());
            
            // Lọc các mã còn hiệu lực
            List<UserDiscountDTO> validDiscounts = userDiscounts.stream()
                    .filter(ud -> !ud.getIsUsed())
                    .filter(ud -> ud.getDiscount().getIsActive())
                    .filter(ud -> LocalDateTime.now().isBefore(ud.getDiscount().getEndDate()))
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
            
            return Response.builder()
                    .status(200)
                    .message("Lấy danh sách mã giảm giá thành công")
                    .userDiscountList(validDiscounts)
                    .build();
                    
        } catch (Exception e) {
            log.error("Error getting user discounts", e);
            return Response.builder()
                    .status(500)
                    .message("Lỗi khi lấy danh sách mã giảm giá: " + e.getMessage())
                    .build();
        }
    }

    @Override
    @Transactional
    public Response assignDiscountToUser(Long userId, Long discountId) {
        try {
            User user = userRepo.findById(userId)
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy user"));
            
            Discount discount = discountRepository.findById(discountId)
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy mã giảm giá"));
            
            // Kiểm tra đã được cấp chưa
            if (userDiscountRepo.existsByUserIdAndDiscountId(userId, discountId)) {
                return Response.builder()
                        .status(400)
                        .message("User đã có mã giảm giá này")
                        .build();
            }
            
            UserDiscount userDiscount = UserDiscount.builder()
                    .user(user)
                    .discount(discount)
                    .isUsed(false)
                    .assignedAt(LocalDateTime.now())
                    .build();
            
            userDiscountRepo.save(userDiscount);
            
            return Response.builder()
                    .status(200)
                    .message("Cấp mã giảm giá thành công")
                    .build();
                    
        } catch (NotFoundException e) {
            return Response.builder()
                    .status(404)
                    .message(e.getMessage())
                    .build();
        } catch (Exception e) {
            log.error("Error assigning discount to user", e);
            return Response.builder()
                    .status(500)
                    .message("Lỗi khi cấp mã giảm giá: " + e.getMessage())
                    .build();
        }
    }

    @Override
    @Transactional
    public void autoAssignDiscountsToNewUser(Long userId) {
        try {
            User user = userRepo.findById(userId)
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy user"));
            
            // Lấy tất cả mã giảm giá tự động cấp
            List<Discount> autoAssignDiscounts = discountRepository.findByAutoAssignNewUserTrue();
            
            for (Discount discount : autoAssignDiscounts) {
                // Kiểm tra mã còn hiệu lực
                if (discount.getIsActive() && LocalDateTime.now().isBefore(discount.getEndDate())) {
                    // Kiểm tra chưa được cấp
                    if (!userDiscountRepo.existsByUserIdAndDiscountId(userId, discount.getId())) {
                        UserDiscount userDiscount = UserDiscount.builder()
                                .user(user)
                                .discount(discount)
                                .isUsed(false)
                                .assignedAt(LocalDateTime.now())
                                .build();
                        
                        userDiscountRepo.save(userDiscount);
                        log.info("Auto-assigned discount {} to new user {}", discount.getCode(), user.getEmail());
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error auto-assigning discounts to new user", e);
        }
    }

    private User getLoginUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }


    private UserDiscountDTO mapToDTO(UserDiscount userDiscount) {
        UserDiscountDTO dto = new UserDiscountDTO();
        dto.setId(userDiscount.getId());
        dto.setIsUsed(userDiscount.getIsUsed());
        dto.setUsedAt(userDiscount.getUsedAt());
        dto.setAssignedAt(userDiscount.getAssignedAt());
        
        // Map discount
        Discount discount = userDiscount.getDiscount();
        DiscountDTO discountDTO = new DiscountDTO();
        discountDTO.setId(discount.getId());
        discountDTO.setCode(discount.getCode());
        discountDTO.setDescription(discount.getDescription());
        discountDTO.setDiscountType(discount.getDiscountType().name());
        discountDTO.setDiscountValue(discount.getDiscountValue());
        discountDTO.setMinOrderAmount(discount.getMinOrderAmount());
        discountDTO.setMaxDiscountAmount(discount.getMaxDiscountAmount());
        discountDTO.setStartDate(discount.getStartDate());
        discountDTO.setEndDate(discount.getEndDate());
        discountDTO.setIsActive(discount.getIsActive());
        
        dto.setDiscount(discountDTO);
        
        return dto;
    }
}
