package com.phegondev.Phegon.Eccormerce.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.phegondev.Phegon.Eccormerce.dto.Response;
import com.phegondev.Phegon.Eccormerce.dto.SlideDto;
import com.phegondev.Phegon.Eccormerce.service.interf.SlideService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/slides")
@RequiredArgsConstructor
public class SlideController {

    private final SlideService slideService;
    private final ObjectMapper objectMapper;

    @PostMapping("/create")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> createSlide(
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam("slide") String slideJson) {
        try {
            System.out.println("Creating slide with JSON: " + slideJson);
            SlideDto slideDto = objectMapper.readValue(slideJson, SlideDto.class);
            System.out.println("Parsed SlideDto: " + slideDto);
            Response response = slideService.createSlide(slideDto, image);
            return ResponseEntity.status(response.getStatus()).body(response);
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Error creating slide: " + e.getMessage());
            return ResponseEntity.status(500).body(Response.builder()
                    .status(500)
                    .message("Error: " + e.getMessage())
                    .build());
        }
    }

    @PutMapping("/update/{slideId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> updateSlide(
            @PathVariable Long slideId,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam("slide") String slideJson) {
        try {
            SlideDto slideDto = objectMapper.readValue(slideJson, SlideDto.class);
            Response response = slideService.updateSlide(slideId, slideDto, image);
            return ResponseEntity.status(response.getStatus()).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Response.builder()
                    .status(500)
                    .message("Error: " + e.getMessage())
                    .build());
        }
    }

    @DeleteMapping("/delete/{slideId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> deleteSlide(@PathVariable Long slideId) {
        Response response = slideService.deleteSlide(slideId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> getAllSlides() {
        Response response = slideService.getAllSlides();
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/active")
    public ResponseEntity<Response> getActiveSlides() {
        try {
            Response response = slideService.getActiveSlides();
            return ResponseEntity.status(response.getStatus()).body(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Response.builder()
                    .status(500)
                    .message("Error: " + e.getMessage())
                    .build());
        }
    }

    @GetMapping("/{slideId}")
    public ResponseEntity<Response> getSlideById(@PathVariable Long slideId) {
        Response response = slideService.getSlideById(slideId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }
}
