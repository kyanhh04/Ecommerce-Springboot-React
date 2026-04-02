package com.phegondev.Phegon.Eccormerce.service.impl;

import com.phegondev.Phegon.Eccormerce.dto.DiscountDTO;
import com.phegondev.Phegon.Eccormerce.dto.Response;
import com.phegondev.Phegon.Eccormerce.entity.Category;
import com.phegondev.Phegon.Eccormerce.entity.Discount;
import com.phegondev.Phegon.Eccormerce.enums.DiscountType;
import com.phegondev.Phegon.Eccormerce.exception.OurException;
import com.phegondev.Phegon.Eccormerce.mapper.EntityDtoMapper;
import com.phegondev.Phegon.Eccormerce.repository.CategoryRepo;
import com.phegondev.Phegon.Eccormerce.repository.DiscountRepository;
import com.phegondev.Phegon.Eccormerce.service.interf.DiscountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DiscountServiceImpl implements DiscountService {

    private final DiscountRepository discountRepository;
    private final CategoryRepo categoryRepo;
    private final EntityDtoMapper entityDtoMapper;

    @Override
    public Response createDiscount(DiscountDTO discountDTO) {
        if (discountDTO.getCode() == null || discountDTO.getCode().trim().isEmpty()) {
            throw new OurException("Mã giảm giá không được để trống");
        }

        if (discountRepository.existsByCode(discountDTO.getCode().toUpperCase())) {
            throw new OurException("Mã giảm giá đã tồn tại");
        }
        if (discountDTO.getDiscountType() == null || discountDTO.getDiscountType().isEmpty()) {
            throw new OurException("Loại giảm giá không được để trống (PERCENTAGE hoặc FIXED_AMOUNT)");
        }
        DiscountType discountType = DiscountType.valueOf(discountDTO.getDiscountType().toUpperCase());
        BigDecimal discountValue = discountDTO.getDiscountValue();

        if (discountValue == null || discountValue.doubleValue() <= 0) {
            throw new OurException("Giá trị giảm giá phải lớn hơn 0");
        }

        if (discountType == DiscountType.PERCENTAGE) {
            if (discountValue.doubleValue() > 100) {
                throw new OurException("Phần trăm giảm giá không được vượt quá 100%");
            }
        }

        if (discountDTO.getUsageLimit() <= 0) {
            throw new OurException("Giới hạn sử dụng phải lớn hơn 0");
        }

        if (discountDTO.getStartDate().isAfter(discountDTO.getEndDate())) {
            throw new OurException("Ngày bắt đầu không thể sau ngày kết thúc");
        }
        
        Discount discount = new Discount();
        discount.setCode(discountDTO.getCode().toUpperCase());
        discount.setDescription(discountDTO.getDescription());
        discount.setDiscountType(discountType);
        discount.setDiscountValue(discountValue);
        discount.setUsageLimit(discountDTO.getUsageLimit());
        discount.setCurrentUsage(0);
        discount.setStartDate(discountDTO.getStartDate());
        discount.setEndDate(discountDTO.getEndDate());
        discount.setIsActive(true);
        
        // Set new fields
        discount.setMinOrderAmount(discountDTO.getMinOrderAmount() != null ? discountDTO.getMinOrderAmount() : BigDecimal.ZERO);
        discount.setMaxDiscountAmount(discountDTO.getMaxDiscountAmount());
        discount.setAutoAssignNewUser(discountDTO.getAutoAssignNewUser() != null ? discountDTO.getAutoAssignNewUser() : false);
        
        // Handle applicable categories
        List<Category> categoriesToSet;
        if (discountDTO.getApplicableCategoryIds() != null && !discountDTO.getApplicableCategoryIds().isEmpty()) {
            log.info("Setting specific categories: {}", discountDTO.getApplicableCategoryIds());
            categoriesToSet = categoryRepo.findAllById(discountDTO.getApplicableCategoryIds());
            if (categoriesToSet.size() != discountDTO.getApplicableCategoryIds().size()) {
                throw new OurException("Một hoặc nhiều danh mục không tồn tại");
            }
            log.info("Found {} specific categories", categoriesToSet.size());
        } else {
            // null hoặc empty = áp dụng cho tất cả danh mục
            log.info("Applying to all categories");
            categoriesToSet = categoryRepo.findAll();
            log.info("Found {} categories in system", categoriesToSet.size());
            if (categoriesToSet.isEmpty()) {
                throw new OurException("Không có danh mục nào trong hệ thống");
            }
        }
        
        // Initialize the list and add all categories
        discount.setApplicableCategories(new ArrayList<>(categoriesToSet));
        log.info("Set {} categories for discount", discount.getApplicableCategories().size());
        
        discount.setCreatedAt(LocalDateTime.now());
        discount.setUpdatedAt(LocalDateTime.now());
        Discount savedDiscount = discountRepository.save(discount);
        log.info("Saved discount with {} categories", 
                 savedDiscount.getApplicableCategories() != null ? savedDiscount.getApplicableCategories().size() : 0);

        return Response.builder()
                .status(HttpStatus.CREATED.value())
                .message("Tạo mã giảm giá thành công")
                .build();
    }

    @Override
    public Response updateDiscount(Long discountId, DiscountDTO discountDTO) {
        Discount discount = discountRepository.findById(discountId)
                .orElseThrow(() -> new OurException("Mã giảm giá không tồn tại"));

        if (discountDTO.getCode() != null && !discountDTO.getCode().isEmpty()) {
            String newCode = discountDTO.getCode().toUpperCase();
            if (!newCode.equals(discount.getCode()) && discountRepository.existsByCode(newCode)) {
                throw new OurException("Mã giảm giá này đã tồn tại");
            }
            discount.setCode(newCode);
        }

        if (discountDTO.getDescription() != null && !discountDTO.getDescription().isEmpty()) {
            discount.setDescription(discountDTO.getDescription());
        }

        if (discountDTO.getDiscountType() != null && !discountDTO.getDiscountType().isEmpty()) {
            DiscountType discountType = DiscountType.valueOf(discountDTO.getDiscountType().toUpperCase());
            discount.setDiscountType(discountType);
        }

        if (discountDTO.getDiscountValue() != null) {
            if (discountDTO.getDiscountValue().doubleValue() <= 0) {
                throw new OurException("Giá trị giảm giá phải lớn hơn 0");
            }
            if (discount.getDiscountType() == DiscountType.PERCENTAGE && 
                discountDTO.getDiscountValue().doubleValue() > 100) {
                throw new OurException("Phần trăm giảm giá không được vượt quá 100%");
            }
            discount.setDiscountValue(discountDTO.getDiscountValue());
        }

        if (discountDTO.getUsageLimit() != null) {
            if (discountDTO.getUsageLimit() <= 0) {
                throw new OurException("Giới hạn sử dụng phải lớn hơn 0");
            }
            discount.setUsageLimit(discountDTO.getUsageLimit());
        }

        if (discountDTO.getStartDate() != null && discountDTO.getEndDate() != null) {
            if (discountDTO.getStartDate().isAfter(discountDTO.getEndDate())) {
                throw new OurException("Ngày bắt đầu không thể sau ngày kết thúc");
            }
            discount.setStartDate(discountDTO.getStartDate());
            discount.setEndDate(discountDTO.getEndDate());
        }

        if (discountDTO.getIsActive() != null) {
            discount.setIsActive(discountDTO.getIsActive());
        }
        
        // Update new fields
        if (discountDTO.getMinOrderAmount() != null) {
            discount.setMinOrderAmount(discountDTO.getMinOrderAmount());
        }
        
        if (discountDTO.getMaxDiscountAmount() != null) {
            discount.setMaxDiscountAmount(discountDTO.getMaxDiscountAmount());
        }
        
        if (discountDTO.getAutoAssignNewUser() != null) {
            discount.setAutoAssignNewUser(discountDTO.getAutoAssignNewUser());
        }

        List<Category> categoriesToSet;
        if (discountDTO.getApplicableCategoryIds() == null || discountDTO.getApplicableCategoryIds().isEmpty()) {

            categoriesToSet = categoryRepo.findAll();
            if (categoriesToSet.isEmpty()) {
                throw new OurException("Không có danh mục nào trong hệ thống");
            }
        } else {
            categoriesToSet = categoryRepo.findAllById(discountDTO.getApplicableCategoryIds());
            if (categoriesToSet.size() != discountDTO.getApplicableCategoryIds().size()) {
                throw new OurException("Một hoặc nhiều danh mục không tồn tại");
            }
        }

        discount.setApplicableCategories(new ArrayList<>(categoriesToSet));

        discount.setUpdatedAt(LocalDateTime.now());
        discountRepository.save(discount);
        return Response.builder()
                .status(HttpStatus.OK.value())
                .message("Cập nhật mã giảm giá thành công")
                .build();
    }

    @Override
    public Response deleteDiscount(Long discountId) {
        Discount discount = discountRepository.findById(discountId)
                .orElseThrow(() -> new OurException("Mã giảm giá không tồn tại"));
        discountRepository.delete(discount);
        return Response.builder()
                .status(HttpStatus.OK.value())
                .message("Xóa mã giảm giá thành công")
                .build();
    }

    @Override
    public Response getAllDiscounts() {
        List<Discount> discounts = discountRepository.findAll();
        List<DiscountDTO> discountDTOS = discounts.stream()
                .map(entityDtoMapper::mapDiscountToDiscountDTO)
                .collect(Collectors.toList());

        return Response.builder()
                .status(HttpStatus.OK.value())
                .message("Lấy danh sách mã giảm giá thành công")
                .discountList(discountDTOS)
                .totalElement(discountDTOS.size())
                .build();
    }

    @Override
    public Response getDiscountById(Long discountId) {
        Discount discount = discountRepository.findById(discountId)
                .orElseThrow(() -> new OurException("Mã giảm giá không tồn tại"));

        DiscountDTO discountDTO = entityDtoMapper.mapDiscountToDiscountDTO(discount);

        return Response.builder()
                .status(HttpStatus.OK.value())
                .message("Lấy mã giảm giá thành công")
                .discount(discountDTO)
                .build();
    }

    @Override
    public Response getDiscountByCode(String code) {
        Discount discount = discountRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new OurException("Mã giảm giá không tồn tại"));

        DiscountDTO discountDTO = entityDtoMapper.mapDiscountToDiscountDTO(discount);

        return Response.builder()
                .status(HttpStatus.OK.value())
                .message("Lấy mã giảm giá thành công")
                .discount(discountDTO)
                .build();
    }

    @Override
    public Response getActiveDiscounts() {
        List<Discount> discounts = discountRepository.findByIsActiveTrue();
        List<DiscountDTO> discountDTOS = discounts.stream()
                .map(entityDtoMapper::mapDiscountToDiscountDTO)
                .collect(Collectors.toList());

        return Response.builder()
                .status(HttpStatus.OK.value())
                .message("Lấy danh sách mã giảm giá đang hoạt động")
                .discountList(discountDTOS)
                .totalElement(discountDTOS.size())
                .build();
    }

    @Override
    public Response validateAndApplyDiscount(String code, Long orderId) {
        Discount discount = discountRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new OurException("Mã giảm giá không tồn tại"));

        LocalDateTime now = LocalDateTime.now();

        if (!discount.getIsActive()) {
            throw new OurException("Mã giảm giá không còn hoạt động");
        }

        if (now.isBefore(discount.getStartDate())) {
            throw new OurException("Mã giảm giá chưa bắt đầu");
        }

        if (now.isAfter(discount.getEndDate())) {
            throw new OurException("Mã giảm giá đã hết hạn");
        }

        if (discount.getCurrentUsage() >= discount.getUsageLimit()) {
            throw new OurException("Mã giảm giá đã hết lượt sử dụng");
        }

        // Không cộng usage ở đây, chỉ kiểm tra. Usage sẽ được trừ khi thanh toán thành công

        DiscountDTO discountDTO = entityDtoMapper.mapDiscountToDiscountDTO(discount);

        return Response.builder()
                .status(HttpStatus.OK.value())
                .message("Mã giảm giá hợp lệ")
                .discount(discountDTO)
                .build();
    }

    public void decreaseDiscountUsage(String code) {
        Discount discount = discountRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new OurException("Mã giảm giá không tồn tại"));

        if (discount.getCurrentUsage() < discount.getUsageLimit()) {
            discount.setCurrentUsage(discount.getCurrentUsage() + 1);
            discountRepository.save(discount);
        } else {
            throw new OurException("Mã giảm giá đã hết lượt sử dụng");
        }
    }
}
