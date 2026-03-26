import React, { useState, useEffect } from 'react';
import SlideService from '../../service/SlideService';
import '../../style/slideshow.css';

const SlideShow = () => {
    const [slides, setSlides] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        fetchSlides();
    }, []);

    useEffect(() => {
        if (slides.length > 0) {
            const interval = setInterval(() => {
                setCurrentIndex((prevIndex) => 
                    prevIndex === slides.length - 1 ? 0 : prevIndex + 1
                );
            }, 5000);

            return () => clearInterval(interval);
        }
    }, [slides.length]);

    const fetchSlides = async () => {
        try {
            const response = await SlideService.getActiveSlides();
            if (response.status === 200 && response.slideList) {
                setSlides(response.slideList);
            }
        } catch (error) {
            console.error('Error fetching slides:', error);
        }
    };

    const goToSlide = (index) => {
        setCurrentIndex(index);
    };

    const goToPrevious = () => {
        setCurrentIndex(currentIndex === 0 ? slides.length - 1 : currentIndex - 1);
    };

    const goToNext = () => {
        setCurrentIndex(currentIndex === slides.length - 1 ? 0 : currentIndex + 1);
    };

    if (slides.length === 0) {
        return null;
    }

    return (
        <div className="slideshow-container">
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`slide ${index === currentIndex ? 'active' : ''}`}
                    style={{ display: index === currentIndex ? 'block' : 'none' }}
                >
                    {slide.linkUrl ? (
                        <a href={slide.linkUrl}>
                            <img src={slide.imageUrl} alt={slide.title} />
                        </a>
                    ) : (
                        <img src={slide.imageUrl} alt={slide.title} />
                    )}
                    <div className="slide-content">
                        <h2>{slide.title}</h2>
                        {slide.description && <p>{slide.description}</p>}
                    </div>
                </div>
            ))}

            <button className="prev" onClick={goToPrevious}>&#10094;</button>
            <button className="next" onClick={goToNext}>&#10095;</button>

            <div className="dots-container">
                {slides.map((_, index) => (
                    <span
                        key={index}
                        className={`dot ${index === currentIndex ? 'active' : ''}`}
                        onClick={() => goToSlide(index)}
                    ></span>
                ))}
            </div>
        </div>
    );
};

export default SlideShow;
