import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SecurePaymentComponent from '../payment/SecurePaymentComponent';
import ApiService from '../../service/ApiService';

const PaymentPageWrapper = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { orderId } = location.state || {};

    // Get token from localStorage
    const token = localStorage.getItem('token');

    // If no orderId or not authenticated, redirect
    if (!orderId || !ApiService.isAuthenticated()) {
        setTimeout(() => {
            navigate('/cart');
        }, 100);
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <h2>Redirecting to cart...</h2>
                <p>No order found or you need to login first.</p>
            </div>
        );
    }

    // Note: amount will be fetched by SecurePaymentComponent
    // For now we can pass a placeholder or fetch it here
    const amount = location.state?.totalPrice || 0;

    return (
        <div className="payment-page-container">
            <SecurePaymentComponent
                orderId={orderId}
                amount={amount}
                token={token}
            />
        </div>
    );
};

export default PaymentPageWrapper;
