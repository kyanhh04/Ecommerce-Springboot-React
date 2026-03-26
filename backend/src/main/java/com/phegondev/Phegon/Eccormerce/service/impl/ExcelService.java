package com.phegondev.Phegon.Eccormerce.service.impl;

import com.phegondev.Phegon.Eccormerce.entity.Category;
import com.phegondev.Phegon.Eccormerce.entity.Product;
import com.phegondev.Phegon.Eccormerce.exception.OurException;
import com.phegondev.Phegon.Eccormerce.repository.CategoryRepo;
import com.phegondev.Phegon.Eccormerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class ExcelService {

    private final ProductRepository productRepository;
    private final CategoryRepo categoryRepo;

    public byte[] exportProductsToExcel() {
        List<Product> products = productRepository.findAll();

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Products");

            // Create header style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Create header row
            Row headerRow = sheet.createRow(0);
            String[] columns = {"ID", "Tên sản phẩm", "Mô tả", "Giá", "Danh mục", "URL hình ảnh"};
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            // Fill data
            int rowNum = 1;
            for (Product product : products) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(product.getId());
                row.createCell(1).setCellValue(product.getName());
                row.createCell(2).setCellValue(product.getDescription());
                row.createCell(3).setCellValue(product.getPrice().doubleValue());
                row.createCell(4).setCellValue(product.getCategory() != null ? product.getCategory().getName() : "");
                row.createCell(5).setCellValue(product.getImageUrl());
            }

            // Auto-size columns
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            log.error("Error exporting products to Excel", e);
            throw new OurException("Lỗi khi xuất file Excel: " + e.getMessage());
        }
    }

    public List<Product> importProductsFromExcel(MultipartFile file) {
        List<Product> products = new ArrayList<>();

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();

            // Skip header row
            if (rows.hasNext()) {
                rows.next();
            }

            while (rows.hasNext()) {
                Row currentRow = rows.next();

                // Skip empty rows
                if (isRowEmpty(currentRow)) {
                    continue;
                }

                try {
                    Product product = new Product();

                    // ID (column 0) - optional for new products
                    Cell idCell = currentRow.getCell(0);
                    if (idCell != null && idCell.getCellType() == CellType.NUMERIC) {
                        long id = (long) idCell.getNumericCellValue();
                        if (id > 0) {
                            product.setId(id);
                        }
                    }

                    // Name (column 1)
                    Cell nameCell = currentRow.getCell(1);
                    if (nameCell != null) {
                        product.setName(getCellValueAsString(nameCell));
                    }

                    // Description (column 2)
                    Cell descCell = currentRow.getCell(2);
                    if (descCell != null) {
                        product.setDescription(getCellValueAsString(descCell));
                    }

                    // Price (column 3)
                    Cell priceCell = currentRow.getCell(3);
                    if (priceCell != null) {
                        double price = getNumericCellValue(priceCell);
                        product.setPrice(BigDecimal.valueOf(price));
                    }

                    // Category (column 4)
                    Cell categoryCell = currentRow.getCell(4);
                    if (categoryCell != null) {
                        String categoryName = getCellValueAsString(categoryCell).trim();
                        
                        // Try to find category (case-insensitive)
                        Category category = categoryRepo.findByNameIgnoreCase(categoryName)
                                .orElseThrow(() -> new OurException("Không tìm thấy danh mục: '" + categoryName + "'. Vui lòng kiểm tra lại tên danh mục."));
                        product.setCategory(category);
                    }

                    // Image URL (column 5)
                    Cell imageCell = currentRow.getCell(5);
                    if (imageCell != null) {
                        product.setImageUrl(getCellValueAsString(imageCell));
                    }

                    products.add(product);
                } catch (Exception e) {
                    log.error("Error processing row {}: {}", currentRow.getRowNum(), e.getMessage());
                }
            }

            // Save all products
            return productRepository.saveAll(products);

        } catch (IOException e) {
            log.error("Error importing products from Excel", e);
            throw new OurException("Lỗi khi nhập file Excel: " + e.getMessage());
        }
    }

    private boolean isRowEmpty(Row row) {
        if (row == null) {
            return true;
        }
        for (int i = row.getFirstCellNum(); i < row.getLastCellNum(); i++) {
            Cell cell = row.getCell(i);
            if (cell != null && cell.getCellType() != CellType.BLANK) {
                return false;
            }
        }
        return true;
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) {
            return "";
        }
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> String.valueOf(cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> "";
        };
    }

    private double getNumericCellValue(Cell cell) {
        if (cell == null) {
            return 0.0;
        }
        return switch (cell.getCellType()) {
            case NUMERIC -> cell.getNumericCellValue();
            case STRING -> {
                try {
                    yield Double.parseDouble(cell.getStringCellValue());
                } catch (NumberFormatException e) {
                    yield 0.0;
                }
            }
            default -> 0.0;
        };
    }
}
