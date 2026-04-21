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
        log.info("Starting product creation: {}", name);

        if (image == null || image.isEmpty()) {
            throw new OurException("Product image is required");
        }

        if (image.getSize() > 5 * 1024 * 1024) {
            throw new OurException("Image size must not exceed 5MB");
        }

        Category category = categoryRepo.findById(categoryId)
                .orElseThrow(() -> new NotFoundException("Category not found"));

        log.info("Uploading image to S3...");
        String productImageUrl = awsS3Service.saveImageToS3(image);

        Product product = new Product();
        product.setCategory(category);
        product.setPrice(price);
        product.setName(name);
        product.setDescription(description);
        product.setImageUrl(productImageUrl);

        productRepository.save(product);

        long duration = System.currentTimeMillis() - startTime;
        log.info("Product created successfully in {}ms: id={}", duration, product.getId());

        return Response.builder()
                .status(200)
                .message("Product created successfully")
                .build();
    }

    @Override
    public Response updateProduct(Long productId, Long categoryId, MultipartFile image, String name, String description, BigDecimal price) {
        log.info("Starting product update: id={}", productId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product Not Found"));

        if (categoryId != null && !categoryId.equals(product.getCategory().getId())) {
            Category category = categoryRepo.findById(categoryId)
                    .orElseThrow(() -> new NotFoundException("Category not found"));
            product.setCategory(category);
        }

        if (image != null && !image.isEmpty()) {
            log.info("Uploading new image to S3...");
            String productImageUrl = awsS3Service.saveImageToS3(image);
            product.setImageUrl(productImageUrl);
            log.info("Image uploaded successfully");
        }

        if (name != null && !name.isEmpty()) {
            product.setName(name);
        }
        if (price != null) {
            product.setPrice(price);
        }
        if (description != null && !description.isEmpty()) {
            product.setDescription(description);
        }

        productRepository.save(product);
        log.info("Product updated successfully: id={}", productId);

        return Response.builder()
                .status(200)
                .message("Product updated successfully")
                .build();
    }

    @Override
    @Transactional
    public Response deleteProduct(Long productId) {
        try {
            log.info("Starting product deletion: id={}", productId);

            productRepository.findById(productId)
                    .orElseThrow(() -> new OurException("Product Not Found"));

            boolean hasOrders = orderItemRepo.existsByProductId(productId);
            log.info("Product {} has orders: {}", productId, hasOrders);

            if (hasOrders) {
                return Response.builder()
                        .status(400)
                        .message("Cannot delete this product because it already has orders. Hide it instead of deleting it.")
                        .build();
            }

            List<com.phegondev.Phegon.Eccormerce.entity.Wishlist> wishlists = wishlistRepository.findByProductId(productId);
            log.info("Found {} wishlist entries to delete", wishlists.size());
            if (!wishlists.isEmpty()) {
                wishlistRepository.deleteAll(wishlists);
                wishlistRepository.flush();
                log.info("Deleted {} wishlist entries", wishlists.size());
            }

            List<com.phegondev.Phegon.Eccormerce.entity.Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
            log.info("Found {} reviews to delete", reviews.size());
            if (!reviews.isEmpty()) {
                reviewRepository.deleteAll(reviews);
                reviewRepository.flush();
                log.info("Deleted {} reviews", reviews.size());
            }

            log.info("Deleting product: id={}", productId);
            productRepository.deleteProductById(productId);
            log.info("Product deleted: id={} - transaction will commit", productId);

            Response response = Response.builder()
                    .status(200)
                    .message("Product deleted successfully")
                    .build();

            log.info("Returning successful response");
            return response;
        } catch (Exception e) {
            log.error("Error deleting product id {}: {}", productId, e.getMessage(), e);
            throw new OurException("Unable to delete product: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Response getProductById(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product Not Found"));
        ProductDto productDto = entityDtoMapper.mapProductToDtoBasic(product);

        return Response.builder()
                .status(200)
                .product(productDto)
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
        if (products.isEmpty()) {
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

        if (products.isEmpty()) {
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
            throw new OurException("File must not be empty");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || !filename.endsWith(".xlsx")) {
            throw new OurException("Only Excel files (.xlsx) are accepted");
        }

        List<Product> importedProducts = excelService.importProductsFromExcel(file);

        return Response.builder()
                .status(200)
                .message("Imported " + importedProducts.size() + " products successfully")
                .build();
    }

    @Override
    public byte[] downloadProductTemplate() {
        return excelTemplateService.generateProductTemplate();
    }
}
