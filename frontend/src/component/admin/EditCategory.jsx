import React, { useState, useEffect } from "react";
import ApiService from "../../service/ApiService";
import { useNavigate, useParams } from "react-router-dom";
import '../../style/addCategory.css'

const EditCategory = () => {
    const { categoryId } = useParams();
    const [name, setName] = useState('')
    const [message, setMessage] = useState('');
    const navigate = useNavigate();


    useEffect(() => {
        fetchCategory(categoryId);
    }, [categoryId])

    const fetchCategory = async () => {
        try {
            const response = await ApiService.getCategoryById(categoryId);
            setName(response.category.name);

        } catch (error) {
            setMessage(error.response?.data?.message || error.message || "Failed to get a category by id")
            setTimeout(() => {
                setMessage('');
            }, 3000)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await ApiService.updateCategory(categoryId, { name });
            if (response.status === 200) {
                navigate("/admin/categories", { 
                    state: { message: response.message || 'Cập nhật danh mục thành công' } 
                });
            }
        } catch (error) {
            setMessage(error.response?.data?.message || error.message || "Failed to save a category")
        }
    }

    return (
        <div className="add-category-page">
            {message && <p className="message">{message}</p>}
            <form onSubmit={handleSubmit} className="category-form">
                <button type="button" className="back-btn" onClick={() => navigate('/admin/categories')}>← Quay lại</button>
                <h2>Chỉnh Sửa Danh Mục</h2>
                <input type="text"
                    placeholder="Tên danh mục"
                    value={name}
                    onChange={(e) => setName(e.target.value)} />

                <button type="submit">Cập Nhật</button>
            </form>
        </div>
    )

}

export default EditCategory;