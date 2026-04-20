import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SlideService from '../../service/SlideService';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import '../../style/adminSlideManagement.css';

const AdminSlideManagement = () => {
    useDocumentTitle("Quản Lý Slide");
    const [slides, setSlides] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentSlide, setCurrentSlide] = useState({
        id: null,
        title: '',
        description: '',
        linkUrl: '',
        displayOrder: 0,
        isActive: true
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchSlides();
    }, []);

    const fetchSlides = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await SlideService.getAllSlides(token);
            if (response.status === 200) {
                setSlides(response.slideList || []);
            }
        } catch (error) {
            console.error('Error fetching slides:', error);
            setMessage('Failed to load slides');
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentSlide({
            ...currentSlide,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            
            const slideData = {
                title: currentSlide.title,
                description: currentSlide.description,
                linkUrl: currentSlide.linkUrl,
                displayOrder: parseInt(currentSlide.displayOrder),
                isActive: currentSlide.isActive
            };
            
            formData.append('slide', JSON.stringify(slideData));
            if (imageFile) {
                formData.append('image', imageFile);
            }

            let response;
            if (editMode) {
                response = await SlideService.updateSlide(currentSlide.id, formData, token);
            } else {
                response = await SlideService.createSlide(formData, token);
            }

            if (response.status === 200) {
                setMessage(editMode ? 'Slide updated successfully' : 'Slide created successfully');
                fetchSlides();
                closeModal();
            }
        } catch (error) {
            console.error('Error saving slide:', error);
            setMessage('Failed to save slide');
        }
    };

    const handleEdit = (slide) => {
        setCurrentSlide(slide);
        setImagePreview(slide.imageUrl);
        setEditMode(true);
        setShowModal(true);
    };

    const handleDelete = async (slideId) => {
        if (window.confirm('Are you sure you want to delete this slide?')) {
            try {
                const token = localStorage.getItem('token');
                const response = await SlideService.deleteSlide(slideId, token);
                if (response.status === 200) {
                    setMessage('Slide deleted successfully');
                    fetchSlides();
                }
            } catch (error) {
                console.error('Error deleting slide:', error);
                setMessage('Failed to delete slide');
            }
        }
    };

    const openCreateModal = () => {
        setCurrentSlide({
            id: null,
            title: '',
            description: '',
            linkUrl: '',
            displayOrder: 0,
            isActive: true
        });
        setImageFile(null);
        setImagePreview(null);
        setEditMode(false);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setCurrentSlide({
            id: null,
            title: '',
            description: '',
            linkUrl: '',
            displayOrder: 0,
            isActive: true
        });
        setImageFile(null);
        setImagePreview(null);
        setEditMode(false);
    };

    return (
        <div className="admin-slide-management">
            <div className="slide-header">
                <h2>Slide Management</h2>
                <button className="btn-create" onClick={openCreateModal}>
                    Create New Slide
                </button>
            </div>

            {message && <div className="message">{message}</div>}

            <div className="slides-table">
                <table>
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Title</th>
                            <th>Description</th>
                            <th>Order</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {slides.map(slide => (
                            <tr key={slide.id}>
                                <td>
                                    {slide.imageUrl && (
                                        <img src={slide.imageUrl} alt={slide.title} className="slide-thumbnail" />
                                    )}
                                </td>
                                <td>{slide.title}</td>
                                <td>{slide.description}</td>
                                <td>{slide.displayOrder}</td>
                                <td>
                                    <span className={`status ${slide.isActive ? 'active' : 'inactive'}`}>
                                        {slide.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>
                                    <button className="btn-edit" onClick={() => handleEdit(slide)}>Edit</button>
                                    <button className="btn-delete" onClick={() => handleDelete(slide.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{editMode ? 'Edit Slide' : 'Create New Slide'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Title:</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={currentSlide.title}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Description:</label>
                                <textarea
                                    name="description"
                                    value={currentSlide.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                />
                            </div>

                            <div className="form-group">
                                <label>Link URL:</label>
                                <input
                                    type="text"
                                    name="linkUrl"
                                    value={currentSlide.linkUrl}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Display Order:</label>
                                <input
                                    type="number"
                                    name="displayOrder"
                                    value={currentSlide.displayOrder}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={currentSlide.isActive}
                                        onChange={handleInputChange}
                                    />
                                    Active
                                </label>
                            </div>

                            <div className="form-group">
                                <label>Image:</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                                {imagePreview && (
                                    <img src={imagePreview} alt="Preview" className="image-preview" />
                                )}
                            </div>

                            <div className="modal-actions">
                                <button type="submit" className="btn-submit">
                                    {editMode ? 'Update' : 'Create'}
                                </button>
                                <button type="button" className="btn-cancel" onClick={closeModal}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSlideManagement;
