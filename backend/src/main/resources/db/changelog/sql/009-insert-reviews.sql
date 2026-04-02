-- Insert 100 sample reviews distributed across products
-- First create fake users for reviews

-- Insert fake users (without password in users table)
INSERT INTO users (name, email, phone_number, role) VALUES
('Nguyễn Văn A', 'nguyenvana@example.com', '0901234567', 'USER'),
('Trần Thị B', 'tranthib@example.com', '0901234568', 'USER'),
('Lê Văn C', 'levanc@example.com', '0901234569', 'USER'),
('Phạm Thị D', 'phamthid@example.com', '0901234570', 'USER'),
('Hoàng Văn E', 'hoangvane@example.com', '0901234571', 'USER'),
('Vũ Thị F', 'vuthif@example.com', '0901234572', 'USER'),
('Đặng Văn G', 'dangvang@example.com', '0901234573', 'USER'),
('Bùi Thị H', 'buithih@example.com', '0901234574', 'USER'),
('Đỗ Văn I', 'dovani@example.com', '0901234575', 'USER'),
('Ngô Thị K', 'ngothik@example.com', '0901234576', 'USER');

-- Insert credentials for fake users (password: "password123", provider: "local")
INSERT INTO user_credentials (user_id, password, provider)
SELECT id, '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'local'
FROM users 
WHERE email IN (
    'nguyenvana@example.com',
    'tranthib@example.com',
    'levanc@example.com',
    'phamthid@example.com',
    'hoangvane@example.com',
    'vuthif@example.com',
    'dangvang@example.com',
    'buithih@example.com',
    'dovani@example.com',
    'ngothik@example.com'
);

-- Get user IDs for rotation
SET @user1 = (SELECT id FROM users WHERE email = 'nguyenvana@example.com');
SET @user2 = (SELECT id FROM users WHERE email = 'tranthib@example.com');
SET @user3 = (SELECT id FROM users WHERE email = 'levanc@example.com');
SET @user4 = (SELECT id FROM users WHERE email = 'phamthid@example.com');
SET @user5 = (SELECT id FROM users WHERE email = 'hoangvane@example.com');
SET @user6 = (SELECT id FROM users WHERE email = 'vuthif@example.com');
SET @user7 = (SELECT id FROM users WHERE email = 'dangvang@example.com');
SET @user8 = (SELECT id FROM users WHERE email = 'buithih@example.com');
SET @user9 = (SELECT id FROM users WHERE email = 'dovani@example.com');
SET @user10 = (SELECT id FROM users WHERE email = 'ngothik@example.com');

-- Insert reviews for each product with different users
INSERT INTO reviews (comment, rating, product_id, user_id, created_at)
SELECT 
    CASE (ROW_NUMBER() OVER (ORDER BY p.id)) % 34
        WHEN 0 THEN 'Sản phẩm rất tốt, chất lượng cao, đáng tiền'
        WHEN 1 THEN 'Giao hàng nhanh, đóng gói cẩn thận'
        WHEN 2 THEN 'Thiết kế đẹp, hiệu năng mạnh mẽ'
        WHEN 3 THEN 'Chất lượng tốt, giá hợp lý'
        WHEN 4 THEN 'Rất hài lòng với sản phẩm này'
        WHEN 5 THEN 'Đáng tiền, sẽ mua lại lần sau'
        WHEN 6 THEN 'Sản phẩm tuyệt vời, recommend'
        WHEN 7 THEN 'Chất lượng ổn định, bền bỉ'
        WHEN 8 THEN 'Giá tốt, đáng mua'
        WHEN 9 THEN 'Hiệu năng mạnh, xử lý nhanh'
        WHEN 10 THEN 'Màn hình đẹp, sắc nét'
        WHEN 11 THEN 'Bàn phím gõ êm ái, thoải mái'
        WHEN 12 THEN 'Pin trâu, dùng cả ngày'
        WHEN 13 THEN 'Tản nhiệt tốt, không nóng'
        WHEN 14 THEN 'Thiết kế sang trọng, đẳng cấp'
        WHEN 15 THEN 'Chất liệu cao cấp, bền đẹp'
        WHEN 16 THEN 'Âm thanh trong trẻo, sống động'
        WHEN 17 THEN 'Kết nối ổn định, không lag'
        WHEN 18 THEN 'Dễ sử dụng, thân thiện'
        WHEN 19 THEN 'Bảo hành tốt, hỗ trợ nhiệt tình'
        WHEN 20 THEN 'Giao hàng đúng hẹn'
        WHEN 21 THEN 'Đóng gói cẩn thận, chắc chắn'
        WHEN 22 THEN 'Sản phẩm như mô tả, chính hãng'
        WHEN 23 THEN 'Chất lượng vượt mong đợi'
        WHEN 24 THEN 'Giá cả phải chăng, hợp túi tiền'
        WHEN 25 THEN 'Hiệu suất ổn định, không lỗi'
        WHEN 26 THEN 'Độ bền cao, dùng lâu dài'
        WHEN 27 THEN 'Thiết kế tinh tế, hiện đại'
        WHEN 28 THEN 'Màu sắc đẹp, bắt mắt'
        WHEN 29 THEN 'Kích thước vừa vặn, gọn gàng'
        WHEN 30 THEN 'Trọng lượng nhẹ, dễ mang theo'
        WHEN 31 THEN 'Dễ bảo quản, không tốn công'
        WHEN 32 THEN 'Phù hợp cho công việc'
        ELSE 'Phù hợp cho giải trí, chơi game'
    END as comment,
    CASE (ROW_NUMBER() OVER (ORDER BY p.id)) % 3
        WHEN 0 THEN 5
        WHEN 1 THEN 5
        ELSE 4
    END as rating,
    p.id as product_id,
    CASE (ROW_NUMBER() OVER (ORDER BY p.id)) % 10
        WHEN 0 THEN @user1
        WHEN 1 THEN @user2
        WHEN 2 THEN @user3
        WHEN 3 THEN @user4
        WHEN 4 THEN @user5
        WHEN 5 THEN @user6
        WHEN 6 THEN @user7
        WHEN 7 THEN @user8
        WHEN 8 THEN @user9
        ELSE @user10
    END as user_id,
    DATE_ADD('2024-03-15 10:00:00', INTERVAL (ROW_NUMBER() OVER (ORDER BY p.id)) * 2 HOUR) as created_at
FROM products p
CROSS JOIN (SELECT 1 UNION SELECT 2 UNION SELECT 3) as reviews_count
ORDER BY p.id, reviews_count.1
LIMIT 100;

