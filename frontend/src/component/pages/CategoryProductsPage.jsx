import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import ApiService from "../../service/ApiService";
import ProductList from "../common/ProductList";
import Pagination from "../common/Pagination";
import '../../style/home.css'

const CategoryProductsPage = () => {

    const { categoryId } = useParams();
    const location = useLocation();

    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [error, setError] = useState(null);

    const itemsPerPage = 8;

    // lấy keyword search từ URL
    const queryParams = new URLSearchParams(location.search);
    const keyword = queryParams.get("search");

    useEffect(() => {
        fetchProducts();
    }, [categoryId, currentPage, keyword]);

    const fetchProducts = async () => {
        try {

            const response = await ApiService.getAllProductsByCategoryId(categoryId);
            let allProducts = response.productList || [];

            // nếu có search thì filter
            if (keyword) {
                allProducts = allProducts.filter(product =>
                    product.name.toLowerCase().includes(keyword.toLowerCase())
                );
            }

            setTotalPages(Math.ceil(allProducts.length / itemsPerPage));

            setProducts(
                allProducts.slice(
                    (currentPage - 1) * itemsPerPage,
                    currentPage * itemsPerPage
                )
            );

        } catch (error) {
            setError(
                error.response?.data?.message ||
                error.message ||
                "Unable to fetch products"
            );
        }
    };

    return (
        <div className="home">
            {error ? (
                <p className="error-message">{error}</p>
            ) : (
                <div>
                    <ProductList products={products} />

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => setCurrentPage(page)}
                    />
                </div>
            )}
        </div>
    );
};

export default CategoryProductsPage;