package com.phegondev.Phegon.Eccormerce.entity;

import com.phegondev.Phegon.Eccormerce.enums.DiscountType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "discounts")
public class Discount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiscountType discountType = DiscountType.PERCENTAGE;

    @Column(nullable = false)
    private BigDecimal discountValue;

    @Column(name = "min_order_amount")
    private BigDecimal minOrderAmount; // Số tiền tối thiểu để áp dụng mã

    @Column(name = "max_discount_amount")
    private BigDecimal maxDiscountAmount; // Số tiền giảm tối đa (cho PERCENTAGE)

    @Column(nullable = false)
    private Integer usageLimit;

    @Column(nullable = false)
    private Integer currentUsage = 0;

    @Column(nullable = false)
    private LocalDateTime startDate;

    @Column(nullable = false)
    private LocalDateTime endDate;

    @Column
    private Boolean isActive = true;

    // Danh sách category áp dụng (null = áp dụng cho tất cả)
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "discount_categories",
        joinColumns = @JoinColumn(name = "discount_id"),
        inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private List<Category> applicableCategories;

    // Mã tự động cấp cho user mới
    @Column(name = "auto_assign_new_user")
    private Boolean autoAssignNewUser = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        Discount discount = (Discount) obj;
        return id != null && id.equals(discount.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    public boolean canEqual(Object obj) {
        return obj instanceof Discount;
    }
}
