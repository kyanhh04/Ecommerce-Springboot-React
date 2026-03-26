package com.phegondev.Phegon.Eccormerce.repository;

import com.phegondev.Phegon.Eccormerce.entity.Slide;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SlideRepo extends JpaRepository<Slide, Long> {
    List<Slide> findByIsActiveTrueOrderByDisplayOrderAsc();
}
