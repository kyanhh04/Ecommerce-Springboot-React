package com.phegondev.Phegon.Eccormerce.service.impl;

import com.phegondev.Phegon.Eccormerce.exception.OurException;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
@Slf4j
public class ExcelTemplateService {

    public byte[] generateProductTemplate() {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Products");

            // Create header style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);

            // Create header row
            Row headerRow = sheet.createRow(0);
            String[] columns = {"ID", "Tên sản phẩm", "Mô tả", "Giá", "Danh mục", "URL hình ảnh"};
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            // Create example row
            Row exampleRow = sheet.createRow(1);
            exampleRow.createCell(0).setCellValue(""); // ID để trống cho sản phẩm mới
            exampleRow.createCell(1).setCellValue("Ví dụ: iPhone 15 Pro");
            exampleRow.createCell(2).setCellValue("Ví dụ: Điện thoại thông minh cao cấp");
            exampleRow.createCell(3).setCellValue(29990000);
            exampleRow.createCell(4).setCellValue("Ví dụ: Electronics");
            exampleRow.createCell(5).setCellValue("https://example.com/image.jpg");

            // Auto-size columns
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
                sheet.setColumnWidth(i, sheet.getColumnWidth(i) + 1000);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            log.error("Error generating Excel template", e);
            throw new OurException("Lỗi khi tạo file template: " + e.getMessage());
        }
    }
}
