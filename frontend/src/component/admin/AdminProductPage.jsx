import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import '../../style/adminProduct.css'
import Pagination from "../common/Pagination";
import ConfirmDialog from "../common/ConfirmDialog";
import ApiService from "../../service/ApiService";

const AdminProductPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
    const [confirmState, setConfirmState] = useState({ show: false, id: null });
    const itemsPerPage = 10;

    // Hiển thị message từ navigate state
    useEffect(() => {
        if (location.state?.message) {
            setSuccess(location.state.message);
            setTimeout(() => setSuccess(null), 3000);
            // Clear state để không hiển thị lại khi refresh
            window.history.replaceState({}, document.title);
        }
    }, [location]);


    const fetchProducts = async() => {
        setLoading(true);
        try {
            const response = await ApiService.getAllProducts();
            const productList = response.productList || [];
            setProducts(productList);
            setTotalPages(Math.ceil(productList.length / itemsPerPage));
            setError(null);
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'unable to fetch products')
        } finally {
            setLoading(false);
        }
    }

    useEffect(()=>{
        fetchProducts();
    }, []);

    // Tính toán products hiển thị dựa trên currentPage
    const displayedProducts = products.slice(
        (currentPage - 1) * itemsPerPage, 
        currentPage * itemsPerPage
    );

    const handleEdit = async (id) => {
        navigate(`/admin/edit-product/${id}`)
    }

    const openDeleteDialog = (id) => {
        setConfirmState({ show: true, id });
    };

    const closeDeleteDialog = () => {
        setConfirmState({ show: false, id: null });
    };

    const handleDeleteConfirm = async () => {
        try {
            const response = await ApiService.deleteProduct(confirmState.id);
            setSuccess(response.message || "Xóa sản phẩm thành công");
            setError(null);
            fetchProducts();
            closeDeleteDialog();
            setTimeout(() => setSuccess(null), 2000);
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'unable to delete product');
            setSuccess(null);
            closeDeleteDialog();
        }
    };

    return(
        <div className="admin-product-list">
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            <div>
                <h2>Sản Phẩm</h2>
                <button className="product-btn" onClick={()=> {navigate('/admin/add-product'); }}>Thêm Sản Phẩm</button>
                
                {loading ? (
                    <p>Đang tải...</p>
                ) : (
                    <>
                        <ul>
                            {displayedProducts.map((product)=>(
                                <li key={product.id}>
                                    <span>{product.name}</span>
                                    <button className="product-btn" onClick={()=> handleEdit(product.id)}>Sửa</button>
                                    <button className="product-btn-delete" onClick={()=> openDeleteDialog(product.id)}>Xóa</button>
                                </li>
                            ))}
                        </ul>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={(page)=> setCurrentPage(page)}
                        />
                    </>
                )}
            </div>

            <ConfirmDialog
                show={confirmState.show}
                title="Xác nhận xóa sản phẩm"
                message="Bạn có chắc chắn muốn xóa sản phẩm này không?"
                onConfirm={handleDeleteConfirm}
                onCancel={closeDeleteDialog}
            />
        </div>
    )
}
export default AdminProductPage;