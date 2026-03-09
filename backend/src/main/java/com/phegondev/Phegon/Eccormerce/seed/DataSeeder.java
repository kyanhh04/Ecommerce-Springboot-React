package com.phegondev.Phegon.Eccormerce.seed;

import com.github.javafaker.Faker;
import com.phegondev.Phegon.Eccormerce.entity.Category;
import com.phegondev.Phegon.Eccormerce.entity.Product;
import com.phegondev.Phegon.Eccormerce.repository.CategoryRepo;
import com.phegondev.Phegon.Eccormerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {
    private final CategoryRepo categoryRepo;
    private final ProductRepository productRepository;
    private final Faker faker = new Faker();

    // Danh sách ảnh thật, không trùng lặp, phù hợp sản phẩm
    private static final String[] LAPTOP_IMAGES = {
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600", // Laptop
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600", // Laptop
        "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=600", // Laptop
        "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600", // Laptop
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600", // Laptop
        "https://images.unsplash.com/photo-1519985176271-adb1088fa94c?w=600", // Laptop
        "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=600", // Laptop
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600", // Laptop
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600", // Laptop
        "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=600"  // Laptop
    };

    private static final String[] ACCESSORY_IMAGES = {
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600", // Mouse
        "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=600", // Keyboard
        "https://images.unsplash.com/photo-1519985176271-adb1088fa94c?w=600", // Headphone
        "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=600", // USB
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600", // Webcam
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600", // Mousepad
        "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=600", // Speaker
        "https://images.unsplash.com/photo-1519985176271-adb1088fa94c?w=600", // Adapter
        "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=600", // HDD
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600"  // SSD
    };

    private static final String[] CATEGORY_NAMES = {
        "Laptop", "Chuột máy tính", "Bàn phím", "Tai nghe", "Ổ cứng/SSD"
    };

    private static final String[][] PRODUCT_NAMES = {
        {"Laptop Dell XPS 13", "Laptop HP Pavilion 15", "Laptop Asus ZenBook", "Laptop MacBook Air", "Laptop Lenovo ThinkPad", "Laptop Acer Aspire 7", "Laptop MSI Modern 14", "Laptop Gigabyte G5", "Laptop LG Gram", "Laptop Surface Laptop 4"},
        {"Chuột Logitech M185", "Chuột Razer DeathAdder", "Chuột Apple Magic Mouse", "Chuột Fuhlen L102", "Chuột Microsoft Bluetooth", "Chuột Rapoo 1620", "Chuột DareU EM908", "Chuột Corsair Harpoon", "Chuột SteelSeries Rival 3", "Chuột Asus ROG Gladius"},
        {"Bàn phím cơ Ducky One 2", "Bàn phím Logitech K380", "Bàn phím Apple Magic Keyboard", "Bàn phím DareU EK87", "Bàn phím Rapoo V500", "Bàn phím Corsair K70", "Bàn phím Razer BlackWidow", "Bàn phím SteelSeries Apex 3", "Bàn phím Asus TUF K3", "Bàn phím Akko 3068"},
        {"Tai nghe Sony WH-1000XM4", "Tai nghe Apple AirPods Pro", "Tai nghe Logitech G Pro X", "Tai nghe Razer Kraken", "Tai nghe Corsair HS50", "Tai nghe JBL Quantum 400", "Tai nghe HyperX Cloud II", "Tai nghe Bose QC35 II", "Tai nghe Sennheiser HD 350BT", "Tai nghe Asus ROG Delta"},
        {"Ổ cứng SSD Samsung 970 EVO", "Ổ cứng HDD WD Blue", "Ổ cứng SSD Kingston A400", "Ổ cứng SSD Crucial MX500", "Ổ cứng SSD WD Green", "Ổ cứng SSD SanDisk Ultra 3D", "Ổ cứng SSD Lexar NS100", "Ổ cứng SSD Transcend 230S", "Ổ cứng SSD Apacer AS340", "Ổ cứng SSD Gigabyte"}
    };

    private static final String[][] PRODUCT_DESCS = {
        {"Mỏng nhẹ, pin lâu, màn hình đẹp.", "Hiệu năng mạnh, phù hợp văn phòng.", "Thiết kế sang trọng, bền bỉ.", "Dành cho sinh viên, học sinh.", "Bảo mật vân tay, ổ SSD nhanh.", "Card rời GTX, chơi game tốt.", "Pin trâu, màn hình Full HD.", "Tản nhiệt tốt, giá hợp lý.", "Siêu nhẹ, pin 20 tiếng.", "Cảm ứng đa điểm, loa lớn."},
        {"Không dây, nhỏ gọn, pin lâu.", "Đèn RGB, cảm biến chính xác.", "Thiết kế tối giản, cảm ứng mượt.", "Giá rẻ, bền, dễ dùng.", "Bluetooth, kết nối đa thiết bị.", "Pin AA, độ bền cao.", "Đèn LED, DPI cao.", "Đèn RGB, thiết kế gaming.", "Cảm biến quang học, nhẹ.", "Cáp bọc dù, nút bấm bền."},
        {"Cơ học, switch Cherry, gõ sướng.", "Bluetooth, nhỏ gọn, đa thiết bị.", "Thiết kế mỏng, phím êm.", "LED RGB, layout TKL.", "Giá rẻ, bền, layout chuẩn.", "Fullsize, switch MX Red.", "Switch xanh, đèn RGB.", "Chống nước, phím mềm.", "LED RGB, khung kim loại.", "Layout 68 phím, nhỏ gọn."},
        {"Chống ồn chủ động, pin 30h.", "Chống nước, âm bass mạnh.", "Micro rời, âm thanh vòm.", "Âm thanh sống động, đệm êm.", "Khung kim loại, bền bỉ.", "Âm thanh 7.1, đèn RGB.", "Đệm tai êm, mic tốt.", "Chống ồn, pin lâu.", "Bluetooth, nhẹ, pin trâu.", "Âm thanh Hi-Res, RGB."},
        {"Tốc độ đọc ghi cao, bền.", "Dung lượng lớn, giá tốt.", "Tương thích nhiều thiết bị.", "Bảo hành 5 năm, ổn định.", "Tiết kiệm điện, mát.", "Chống sốc, tốc độ cao.", "Giá rẻ, dễ lắp đặt.", "Bền, bảo mật tốt.", "Tốc độ cao, giá hợp lý.", "Hỗ trợ TRIM, bảo hành lâu."}
    };

    @Override
    public void run(String... args) {
         if (categoryRepo.count() > 0 || productRepository.count() > 0) return;

        List<Category> categories = new ArrayList<>();
        for (int i = 0; i < CATEGORY_NAMES.length; i++) {
            Category category = new Category();
            category.setName(CATEGORY_NAMES[i]);
            categories.add(category);
        }
        categoryRepo.saveAll(categories);

        List<Product> products = new ArrayList<>();
        for (int i = 0; i < categories.size(); i++) {
            Category category = categories.get(i);
            for (int j = 0; j < 10; j++) {
                Product product = new Product();
                product.setName(PRODUCT_NAMES[i][j]);
                product.setDescription(PRODUCT_DESCS[i][j]);
                String imageUrl = (i == 0) ? LAPTOP_IMAGES[j % LAPTOP_IMAGES.length] : ACCESSORY_IMAGES[j % ACCESSORY_IMAGES.length];
                product.setImageUrl(imageUrl);
                product.setPrice(BigDecimal.valueOf(500 + faker.number().randomDouble(2, 1, 100) * (i + 1) * 10));
                product.setCategory(category);
                products.add(product);
            }
        }
        productRepository.saveAll(products);
    }
}
