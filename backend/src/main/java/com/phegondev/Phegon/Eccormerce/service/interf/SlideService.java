package com.phegondev.Phegon.Eccormerce.service.interf;

import com.phegondev.Phegon.Eccormerce.dto.Response;
import com.phegondev.Phegon.Eccormerce.dto.SlideDto;
import org.springframework.web.multipart.MultipartFile;

public interface SlideService {
    Response createSlide(SlideDto slideDto, MultipartFile image);
    Response updateSlide(Long slideId, SlideDto slideDto, MultipartFile image);
    Response deleteSlide(Long slideId);
    Response getAllSlides();
    Response getActiveSlides();
    Response getSlideById(Long slideId);
}
