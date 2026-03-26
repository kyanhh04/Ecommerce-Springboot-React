package com.phegondev.Phegon.Eccormerce.service.impl;

import com.phegondev.Phegon.Eccormerce.dto.Response;
import com.phegondev.Phegon.Eccormerce.dto.SlideDto;
import com.phegondev.Phegon.Eccormerce.entity.Slide;
import com.phegondev.Phegon.Eccormerce.exception.NotFoundException;
import com.phegondev.Phegon.Eccormerce.mapper.EntityDtoMapper;
import com.phegondev.Phegon.Eccormerce.repository.SlideRepo;
import com.phegondev.Phegon.Eccormerce.service.interf.SlideService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SlideServiceImpl implements SlideService {

    private final SlideRepo slideRepo;
    private final AwsS3Service awsS3Service;
    private final EntityDtoMapper entityDtoMapper;

    @Override
    public Response createSlide(SlideDto slideDto, MultipartFile image) {
        try {
            String imageUrl = null;
            if (image != null && !image.isEmpty()) {
                imageUrl = awsS3Service.saveImageToS3(image);
            }

            Slide slide = new Slide();
            slide.setTitle(slideDto.getTitle());
            slide.setDescription(slideDto.getDescription());
            slide.setImageUrl(imageUrl);
            slide.setLinkUrl(slideDto.getLinkUrl());
            slide.setDisplayOrder(slideDto.getDisplayOrder());
            slide.setIsActive(slideDto.getIsActive() != null ? slideDto.getIsActive() : true);

            slideRepo.save(slide);
            return Response.builder()
                    .status(200)
                    .message("Slide created successfully")
                    .slide(entityDtoMapper.mapSlideToDto(slide))
                    .build();
        } catch (Exception e) {
            return Response.builder()
                    .status(500)
                    .message("Error creating slide: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public Response updateSlide(Long slideId, SlideDto slideDto, MultipartFile image) {
        try {
            Slide slide = slideRepo.findById(slideId)
                    .orElseThrow(() -> new NotFoundException("Slide not found"));

            if (image != null && !image.isEmpty()) {
                String imageUrl = awsS3Service.saveImageToS3(image);
                slide.setImageUrl(imageUrl);
            }

            if (slideDto.getTitle() != null) slide.setTitle(slideDto.getTitle());
            if (slideDto.getDescription() != null) slide.setDescription(slideDto.getDescription());
            if (slideDto.getLinkUrl() != null) slide.setLinkUrl(slideDto.getLinkUrl());
            if (slideDto.getDisplayOrder() != null) slide.setDisplayOrder(slideDto.getDisplayOrder());
            if (slideDto.getIsActive() != null) slide.setIsActive(slideDto.getIsActive());

            slideRepo.save(slide);
            return Response.builder()
                    .status(200)
                    .message("Slide updated successfully")
                    .slide(entityDtoMapper.mapSlideToDto(slide))
                    .build();
        } catch (NotFoundException e) {
            return Response.builder()
                    .status(404)
                    .message(e.getMessage())
                    .build();
        } catch (Exception e) {
            return Response.builder()
                    .status(500)
                    .message("Error updating slide: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public Response deleteSlide(Long slideId) {
        try {
            Slide slide = slideRepo.findById(slideId)
                    .orElseThrow(() -> new NotFoundException("Slide not found"));
            slideRepo.delete(slide);
            return Response.builder()
                    .status(200)
                    .message("Slide deleted successfully")
                    .build();
        } catch (NotFoundException e) {
            return Response.builder()
                    .status(404)
                    .message(e.getMessage())
                    .build();
        } catch (Exception e) {
            return Response.builder()
                    .status(500)
                    .message("Error deleting slide: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public Response getAllSlides() {
        try {
            List<Slide> slides = slideRepo.findAll();
            List<SlideDto> slideDtos = slides.stream()
                    .map(entityDtoMapper::mapSlideToDto)
                    .collect(Collectors.toList());
            return Response.builder()
                    .status(200)
                    .message("Success")
                    .slideList(slideDtos)
                    .build();
        } catch (Exception e) {
            return Response.builder()
                    .status(500)
                    .message("Error getting slides: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public Response getActiveSlides() {
        try {
            List<Slide> slides = slideRepo.findByIsActiveTrueOrderByDisplayOrderAsc();
            List<SlideDto> slideDtos = slides.stream()
                    .map(entityDtoMapper::mapSlideToDto)
                    .collect(Collectors.toList());
            return Response.builder()
                    .status(200)
                    .message("Success")
                    .slideList(slideDtos)
                    .build();
        } catch (Exception e) {
            return Response.builder()
                    .status(500)
                    .message("Error getting active slides: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public Response getSlideById(Long slideId) {
        try {
            Slide slide = slideRepo.findById(slideId)
                    .orElseThrow(() -> new NotFoundException("Slide not found"));
            return Response.builder()
                    .status(200)
                    .message("Success")
                    .slide(entityDtoMapper.mapSlideToDto(slide))
                    .build();
        } catch (NotFoundException e) {
            return Response.builder()
                    .status(404)
                    .message(e.getMessage())
                    .build();
        } catch (Exception e) {
            return Response.builder()
                    .status(500)
                    .message("Error getting slide: " + e.getMessage())
                    .build();
        }
    }
}
