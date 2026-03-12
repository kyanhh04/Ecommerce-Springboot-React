import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import ApiService from "../../service/ApiService";
import ProductList from "../common/ProductList";
import Pagination from "../common/Pagination";
import '../../style/home.css';

const CategoryProductsPage = () => {

    const { categoryId } = useParams();
    const location = useLocation();

    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [error, setError] = useState(null);

    const itemsPerPage = 8;

    const queryParams = new URLSearchParams(location.search);
    const searchItem = queryParams.get("search");

    useEffect(() => {
        setCurrentPage(1);
    }, [categoryId, searchItem]);

    useEffect(() => {
        fetchProducts();
    }, [categoryId, currentPage, searchItem]);

    const fetchProducts = async () => {

        try {

            let allProducts = [];

            if (searchItem) {

                const response = await ApiService.searchProducts(searchItem);
                const filtered = response.productList || [];

                allProducts = filtered.filter(
                    (p) => (p.category?.id || p.categoryId) == categoryId
                );

            } else {

                const response = await ApiService.getAllProductsByCategoryId(categoryId);
                allProducts = response.productList || [];

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