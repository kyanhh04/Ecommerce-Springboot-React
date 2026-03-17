import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../../style/adminProduct.css'
import Pagination from "../common/Pagination";
import ApiService from "../../service/ApiService";

const AdminDiscountPage = () => {
    const navigate = useNavigate();
    const [discounts, setDiscounts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const itemsPerPage = 10;

    const fetchDiscounts = async() => {
        try {
            const response = await ApiService.getAllDiscounts();
            const discountList = response.discountList || [];
            setTotalPages(Math.ceil(discountList.length/itemsPerPage));
            setDiscounts(discountList.slice((currentPage -1) * itemsPerPage, currentPage * itemsPerPage));
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'Unable to fetch discounts')
        }
    }

    useEffect(()=>{
        fetchDiscounts();
    }, [currentPage]);

    const handleEdit = async (id) => {
        navigate(`/admin/edit-discount/${id}`)
    }

    const handleDelete = async(id) => {
        const confirmed = window.confirm("Are you sure you want to delete this discount code? ")
        if(confirmed){
            try {
                const response = await ApiService.deleteDiscount(id);
                setMessage(response.message);
                fetchDiscounts();
                setTimeout(() => setMessage(null), 3000);
            } catch (error) {
                setError(error.response?.data?.message || error.message || 'Unable to delete discount')
                setTimeout(() => setError(null), 3000);
            }
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    }

    const isActive = (discount) => {
        const now = new Date();
        const startDate = new Date(discount.startDate);
        const endDate = new Date(discount.endDate);
        return now >= startDate && now <= endDate && discount.isActive;
    }

    return(
        <div className="admin-product-list">
            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}

            <div>
                <h2>Discount Codes</h2>
                <button className="product-btn" onClick={()=> navigate('/admin/add-discount')}>Add Discount Code</button>

                {discounts.length === 0 ? (
                    <p>No discount codes found</p>
                ) : (
                    <div className="discount-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Type</th>
                                    <th>Value</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {discounts.map((discount)=>(
                                    <tr key={discount.id}>
                                        <td><strong>{discount.code}</strong></td>
                                        <td>{discount.discountType}</td>
                                        <td>
                                            {discount.discountType === 'PERCENTAGE'
                                                ? `${discount.discountValue || 0}%`
                                                : `${(discount.discountValue || 0).toLocaleString()}đ`}
                                        </td>
                                        <td>{formatDate(discount.startDate)}</td>
                                        <td>{formatDate(discount.endDate)}</td>
                                        <td>
                                            <span className={`status-badge ${isActive(discount) ? 'active' : 'inactive'}`}>
                                                {isActive(discount) ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="product-btn" onClick={()=> handleEdit(discount.id)}>Edit</button>
                                            <button className="product-btn-delete" onClick={()=> handleDelete(discount.id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page)=> setCurrentPage(page)}
                />
            </div>
        </div>
    )
}

export default AdminDiscountPage;
