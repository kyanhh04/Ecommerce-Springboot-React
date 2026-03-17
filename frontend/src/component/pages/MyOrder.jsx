import React, { useEffect, useState } from "react";
import ApiService from "../../service/ApiService";
import "../../style/myOrdersPage.css";
import { useNavigate } from "react-router-dom";

const MyOrdersPage = () => {

    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {

        const fetchOrders = async () => {
            try {

                const res = await ApiService.getMyOrders();
                setOrders(res.orders || []);

            } catch (err) {
                console.log(err);
            }
        };

        fetchOrders();

    }, []);

    const goReview = (productId) => {
        navigate(`/product/${productId}`);
    };

    return (

        <div className="orders-page">

            <h1>My Orders</h1>

            {orders.length === 0 ? (
                <p className="no-orders">Bạn chưa có đơn hàng nào</p>
            ) : (

                orders.map((order) => (

                    <div key={order.id} className="order-card">

                        <div className="order-header">

                            <span>Order #{order.id}</span>
                            <span className="order-date">
                                {new Date(order.createdAt).toLocaleDateString()}
                            </span>

                        </div>

                        {order.orderItemList.map((item) => (

                            <div key={item.id} className="order-item">

                                <img
                                    src={item.product.imageUrl}
                                    alt={item.product.name}
                                />

                                <div className="order-info">

                                    <h3>{item.product.name}</h3>

                                    <p>Quantity: {item.quantity}</p>

                                    <p className="price">
                                        {item.price.toLocaleString()} ₫
                                    </p>

                                </div>

                                <button
                                    className="review-btn"
                                    onClick={() => goReview(item.product.id)}
                                >
                                    Review
                                </button>

                            </div>

                        ))}

                    </div>

                ))

            )}

        </div>

    );

};

export default MyOrdersPage;