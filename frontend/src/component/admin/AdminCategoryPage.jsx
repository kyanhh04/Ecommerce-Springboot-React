import React, { useState, useEffect } from "react";
import ApiService from "../../service/ApiService";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../common/ConfirmDialog";
import '../../style/adminCategory.css'

const AdminCategoryPage = () => {

    const [categories, setCategories] = useState([]);
    const [confirmState, setConfirmState] = useState({ show: false, id: null });
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();


    useEffect(()=>{
        fetchCategories();
    }, [])

    const fetchCategories = async()=>{
        try {
            const response = await ApiService.getAllCategory();
            setCategories(response.categoryList || []);
        } catch (error) {
            console.log("Error fetching category list",  error)
        }
    }

    const handleEdit = async (id) => {
        navigate(`/admin/edit-category/${id}`)
    }

    const openDeleteDialog = (id) => {
        setConfirmState({ show: true, id });
    };

    const closeDeleteDialog = () => {
        setConfirmState({ show: false, id: null });
    };

    const handleDeleteConfirm = async () => {
        try {
            await ApiService.deleteCategory(confirmState.id);
            setSuccess('Xóa danh mục thành công');
            setError(null);
            fetchCategories();
            closeDeleteDialog();
            setTimeout(() => setSuccess(null), 2500);
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'Xóa danh mục thất bại');
            setSuccess(null);
            closeDeleteDialog();
        }
    };

    return(
        <div className="admin-category-page">
            <div className="admin-category-list">
                <h2>Categories</h2>
                {success && <p className="success-message">{success}</p>}
                {error && <p className="error-message">{error}</p>}
                <button onClick={()=> navigate('/admin/add-category')}>Add Category</button>
                <ul>
                    {categories.map((category) => (
                        <li key={category.id}>
                            <span>{category.name}</span>
                            <div className="admin-bt">
                                    <button className="admin-btn-edit" onClick={()=> handleEdit(category.id)}>Edit</button>
                                    <button  onClick={()=> openDeleteDialog(category.id)}>Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <ConfirmDialog
                show={confirmState.show}
                title="Xác nhận xóa danh mục"
                message="Bạn có chắc chắn muốn xóa danh mục này không?"
                onConfirm={handleDeleteConfirm}
                onCancel={closeDeleteDialog}
            />
        </div>
    )
}

export default AdminCategoryPage;