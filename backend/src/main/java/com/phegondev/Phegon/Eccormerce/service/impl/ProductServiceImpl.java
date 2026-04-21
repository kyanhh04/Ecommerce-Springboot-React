package com.phegondev.Phegon.Eccormerce.service.impl;

import com.phegondev.Phegon.Eccormerce.dto.ProductDto;
import com.phegondev.Phegon.Eccormerce.dto.Response;
import com.phegondev.Phegon.Eccormerce.entity.Category;
import com.phegondev.Phegon.Eccormerce.entity.Product;
import com.phegondev.Phegon.Eccormerce.exception.NotFoundException;
import com.phegondev.Phegon.Eccormerce.exception.OurException;
import com.phegondev.Phegon.Eccormerce.mapper.EntityDtoMapper;
import com.phegondev.Phegon.Eccormerce.repository.CategoryRepo;
import com.phegondev.Phegon.Eccormerce.repository.ProductRepository;
import com.phegondev.Phegon.Eccormerce.service.interf.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepo categoryRepo;
    private final EntityDtoMapper entityDtoMapper;
    private final AwsS3Service awsS3Service;
    private final ExcelService excelService;
    private final ExcelTemplateService excelTemplateService;
    private final com.phegondev.Phegon.Eccormerce.repository.WishlistRepository wishlistRepository;
    private final com.phegondev.Phegon.Eccormerce.repository.ReviewRepository reviewRepository;
    private final com.phegondev.Phegon.Eccormerce.repository.OrderItemRepo orderItemRepo;



    @Override
    public Response createProduct(Long categoryId, MultipartFile image, String name, String description, BigDecimal price) {
        long startTime = System.currentTimeMillis();
        log.info("Bắt đầu tạo sản phẩm: {}", name);
        
        // Validate input
        if (image == null || image.isEmpty()) {
            throw new OurException("Ảnh sản phẩm là bắt buộc");
        }
        
        if (image.getSize() > 5 * 1024 * 1024) { // 5MB
            throw new OurException("Kích thước ảnh không được vượt quá 5MB");
        }
        
        // Validate category
        Category category = categoryRepo.findById(categoryId)
                .orElseThrow(() -> new NotFoundException("Danh mục không tồn tại"));
        
        // Upload ảnh lên S3
        log.info("Đang upload ảnh lên S3...");
        String productImageUrl = awsS3Service.saveImageToS3(image);

        // Tạo product
        Product product = new Product();
        product.setCategory(category);
        product.setPrice(price);
        product.setName(name);
        product.setDescription(description);
        product.setImageUrl(productImageUrl);

        productRepository.save(product);
        
        long duration = System.currentTimeMillis() - startTime;
        log.info("Tạo sản phẩm thành công trong {}ms: ID={}", duration, product.getId());
        
        return Response.builder()
                .status(200)
                .message("Tạo sản phẩm thành công")
                .build();
    }

    @Override
    public Response updateProduct(Long productId, Long categoryId, MultipartFile image, String name, String description, BigDecimal price) {
        log.info("Bắt đầu update product ID: {}", productId);
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product Not Found"));

        // Chỉ update category nếu có thay đổi
        if (categoryId != null && !categoryId.equals(product.getCategory().getId())) {
            Category category = categoryRepo.findById(categoryId)
                    .orElseThrow(() -> new NotFoundException("Category not found"));
            product.setCategory(category);
        }
        
        // Chỉ upload ảnh mới nếu có file được gửi lên
        if (image != null && !image.isEmpty()) {
            log.info("Đang upload ảnh mới lên S3...");
            String productImageUrl = awsS3Service.saveImageToS3(image);
            product.setImageUrl(productImageUrl);
            log.info("Upload ảnh thành công");
        }

        // Update các field khác
        if (name != null && !name.isEmpty()) product.setName(name);
        if (price != null) product.setPrice(price);
        if (description != null && !description.isEmpty()) product.setDescription(description);

        productRepository.save(product);
        log.info("Đã update product ID: {}", productId);
        
        return Response.builder()
                .status(200)
                .message("Cập nhật sản phẩm thành công")
                .build();
    }

    @Override
    @Transactional
    public Response deleteProduct(Long productId) {
        try {
            log.info("Bắt đầu xóa sản phẩm ID: {}", productId);
            
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new OurException("Product Not Found"));
            
            // Kiểm tra xem product có trong OrderItem không
            boolean hasOrders = orderItemRepo.existsByProductId(productId);
            log.info("Product {} có đơn hàng: {}", productId, hasOrders);
            
            if (hasOrders) {
                return Response.builder()
                        .status(400)
                        .message("Không thể xóa sản phẩm này vì đã có đơn hàng. Bạn có thể ẩn sản phẩm thay vì xóa.")
                        .build();
            }
            
            // Xóa tất cả wishlist liên quan
            List<com.phegondev.Phegon.Eccormerce.entity.Wishlist> wishlists = wishlistRepository.findByProductId(productId);
            log.info("Tìm thấy {} wishlist cần xóa", wishlists.size());
            if (!wishlists.isEmpty()) {
                wishlistRepository.deleteAll(wishlists);
                wishlistRepository.flush();
                log.info("Đã xóa {} wishlist", wishlists.size());
            }
            
            // Xóa tất cả review liên quan
            List<com.phegondev.Phegon.Eccormerce.entity.Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
            log.info("Tìm thấy {} review cần xóa", reviews.size());
            if (!reviews.isEmpty()) {
                reviewRepository.deleteAll(reviews);
                reviewRepository.flush();
                log.info("Đã xóa {} review", reviews.size());
            }
            
            log.info("Đang xóa product ID: {}", productId);
            productRepository.deleteProductById(productId);
            log.info("Đã xóa product ID: {} - Transaction sẽ commit", productId);
            
            Response response = Response.builder()
                    .status(200)
                    .message("Sản phẩm đã được xóa thành công")
                    .build();
            
            log.info("Trả về response thành công");
            return response;
            
        } catch (Exception e) {
            log.error("Lỗi khi xóa product ID {}: {}", productId, e.getMessage(), e);
            throw new OurException("Không thể xóa sản phẩm: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Response getProductById(Long productId) {
        Product product = productRepository.findById(productId).orElseThrow(()-> new NotFoundException("Product Not Found"));
        ProductDto productDto = entityDtoMapper.mapProductToDtoBasic(product);

        return Response.builder()
                .status(200)
                .product(productDto)
                .build();
    }

    @Override
    public Response getAllProducts() {
        log.info("Đang lấy danh sách tất cả sản phẩm");
        
        List<ProductDto> productList = productRepository.findAll(Sort.by(Sort.Direction.ASC, "id"))
                .stream()
                .map(entityDtoMapper::mapProductToDtoBasic)
                .collect(Collectors.toList());

        log.info("Đã lấy {} sản phẩm", productList.size());
        
        return Response.builder()
                .status(200)
                .productList(productList)
                .build();
    }

    @Override
    public Response getProducts(int page, int size, String searchValue) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "id"));
        Page<Product> productPage;

        if (searchValue != null && !searchValue.trim().isEmpty()) {
            productPage = productRepository.findByNameContainingIgnoreCase(searchValue.trim(), pageable);
        } else {
            productPage = productRepository.findAll(pageable);
        }

        List<ProductDto> productDtoList = productPage.getContent()
                .stream()
                .map(entityDtoMapper::mapProductToDtoBasic)
                .collect(Collectors.toList());

        return Response.builder()
                .status(200)
                .productList(productDtoList)
                .totalPage(productPage.getTotalPages())
                .totalElement(productPage.getTotalElements())
                .build();
    }

    @Override
    public Response getProductsByCategory(Long categoryId) {
        List<Product> products = productRepository.findByCategoryId(categoryId);
        if(products.isEmpty()){
            throw new NotFoundException("No Products found for this category");
        }
        List<ProductDto> productDtoList = products.stream()
                .map(entityDtoMapper::mapProductToDtoBasic)
                .collect(Collectors.toList());

        return Response.builder()
                .status(200)
                .productList(productDtoList)
                .build();

    }

    @Override
    public Response searchProduct(String searchValue) {
        List<Product> products = productRepository.findByNameContainingIgnoreCase(searchValue);

        if (products.isEmpty()){
            throw new NotFoundException("No Products Found");
        }
        List<ProductDto> productDtoList = products.stream()
                .map(entityDtoMapper::mapProductToDtoBasic)
                .collect(Collectors.toList());


        return Response.builder()
                .status(200)
                .productList(productDtoList)
                .build();
    }

    @Override
    public byte[] exportProductsToExcel() {
        return excelService.exportProductsToExcel();
    }

    @Override
    public Response importProductsFromExcel(MultipartFile file) {
        if (file.isEmpty()) {
            throw new OurException("File không được để trống");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || !filename.endsWith(".xlsx")) {
            throw new OurException("Chỉ chấp nhận file Excel (.xlsx)");
        }

        List<Product> importedProducts = excelService.importProductsFromExcel(file);

        return Response.builder()
                .status(200)
                .message("Đã nhập thành công " + importedProducts.size() + " sản phẩm")
                .build();
    }

    @Override
    public byte[] downloadProductTemplate() {
        return excelTemplateService.generateProductTemplate();
    }
}
