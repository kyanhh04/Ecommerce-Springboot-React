import React from "react";
import { Link } from "react-router-dom";
import '../../style/productList.css';

const ProductList = ({ products }) => {
    return (
        <div className="product-list">
            {products.map((product) => (
                <div className="product-item" key={product.id}>
                    <Link to={`/product/${product.id}`}>
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="product-image"
                            loading="lazy"
                        />
                        <h3>{product.name}</h3>
                        <p>{product.description}</p>

                        <span className="product-price">
                            {product.price.toLocaleString()} ₫
                        </span>
                    </Link>
                </div>
            ))}
        </div>
    );
};

export default ProductList;