package com.phegondev.Phegon.Eccormerce.service.impl;

import com.phegondev.Phegon.Eccormerce.dto.DiscountDTO;
import com.phegondev.Phegon.Eccormerce.dto.Response;
import com.phegondev.Phegon.Eccormerce.entity.Discount;
import com.phegondev.Phegon.Eccormerce.exception.OurException;
import com.phegondev.Phegon.Eccormerce.mapper.EntityDtoMapper;
import com.phegondev.Phegon.Eccormerce.repository.DiscountRepository;
import com.phegondev.Phegon.Eccormerce.service.interf.DiscountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DiscountServiceImpl implements DiscountService {

    private final DiscountRepository discountRepository;
    private final EntityDtoMapper entityDtoMapper;

    @Override
    public Response createDiscount(DiscountDTO discountDTO) {
        if (discountDTO.getCode() == null || discountDTO.getCode().trim().isEmpty()) {
            throw new OurException("Mã giảm giá không được để trống");
        }

        if (discountRepository.existsByCode(discountDTO.getCode().toUpperCase())) {
            throw new OurException("Mã giảm giá đã tồn tại");
        }

        if (discountDTO.getDiscountPercentage().doubleValue() <= 0 || discountDTO.getDiscountPercentage().doubleValue() > 100) {
            throw new OurException("Phần trăm giảm giá phải từ 0 đến 100");
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
        discount.setDiscountPercentage(discountDTO.getDiscountPercentage());
        discount.setUsageLimit(discountDTO.getUsageLimit());
        discount.setCurrentUsage(0);
        discount.setStartDate(discountDTO.getStartDate());
        discount.setEndDate(discountDTO.getEndDate());
        discount.setIsActive(true);
        discount.setCreatedAt(LocalDateTime.now());
        discount.setUpdatedAt(LocalDateTime.now());

        Discount savedDiscount = discountRepository.save(discount);

        return Response.builder()
                .status(HttpStatus.CREATED.value())
                .message("Tạo mã giảm giá thành công")
                .build();
    }

    @Override
    public Response updateDiscount(Long discountId, DiscountDTO discountDTO) {
        Discount discount = discountRepository.findById(discountId)
                .orElseThrow(() -> new OurException("Mã giảm giá không tồn tại"));

        if (discountDTO.getDescription() != null && !discountDTO.getDescription().isEmpty()) {
            discount.setDescription(discountDTO.getDescription());
        }

        if (discountDTO.getDiscountPercentage() != null) {
            if (discountDTO.getDiscountPercentage().doubleValue() <= 0 || discountDTO.getDiscountPercentage().doubleValue() > 100) {
                throw new OurException("Phần trăm giảm giá phải từ 0 đến 100");
            }
            discount.setDiscountPercentage(discountDTO.getDiscountPercentage());
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

        // Increment usage count
        discount.setCurrentUsage(discount.getCurrentUsage() + 1);
        discountRepository.save(discount);

        DiscountDTO discountDTO = entityDtoMapper.mapDiscountToDiscountDTO(discount);

        return Response.builder()
                .status(HttpStatus.OK.value())
                .message("Áp dụng mã giảm giá thành công")
                .discount(discountDTO)
                .build();
    }
}
