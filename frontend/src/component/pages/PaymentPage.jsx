import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ApiService from "../../service/ApiService";
import '../../style/payment.css';

const PaymentPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const orderId = location.state?.orderId;

    const [step, setStep] = useState(1); // 1: Card info, 2: OTP, 3: Confirm, 4: Success
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    // Card info state
    const [cardNumber, setCardNumber] = useState("");
    const [cardName, setCardName] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [cvv, setCvv] = useState("");

    // OTP state
    const [otpCode, setOtpCode] = useState("");

    // Order info
    const [orderInfo, setOrderInfo] = useState(null);

    if (!orderId) {
        return <div className="payment-page">Invalid order. Please go back and try again.</div>;
    }

    // Validate card number using Luhn algorithm
    const validateCardNumber = (num) => {
        const digits = num.replace(/\D/g, '');
        if (digits.length !== 16) return false;
        
        let sum = 0;
        for (let i = 0; i < digits.length; i++) {
            let digit = parseInt(digits[i]);
            if (i % 2 === digits.length % 2) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            sum += digit;
        }
        return sum % 10 === 0;
    };

    // Validate expiry date (MM/YY format, not expired)
    const validateExpiry = (date) => {
        const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
        if (!regex.test(date)) return false;

        const [month, year] = date.split('/');
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;

        const expiryYear = parseInt(year);
        const expiryMonth = parseInt(month);

        if (expiryYear < currentYear) return false;
        if (expiryYear === currentYear && expiryMonth < currentMonth) return false;

        return true;
    };

    // Validate CVV (3-4 digits)
    const validateCVV = (cvv) => {
        const regex = /^\d{3,4}$/;
        return regex.test(cvv);
    };

    // Step 1: Submit card info
    const handleCardSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!cardNumber || !cardName || !expiryDate || !cvv) {
            setMessage("Please fill all fields");
            return;
        }

        if (!validateCardNumber(cardNumber)) {
            setMessage("Invalid card number");
            return;
        }

        if (!validateExpiry(expiryDate)) {
            setMessage("Invalid or expired card");
            return;
        }

        if (!validateCVV(cvv)) {
            setMessage("Invalid CVV (3-4 digits)");
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const paymentRequest = {
                orderId,
                amount: orderInfo?.totalPrice || 0,
                method: "CREDIT_CARD",
                encryptedCardData: {
                    cardNumber,
                    cardName,
                    expiryDate,
                    cvv
                }
            };

            const response = await ApiService.post('/api/payments/initialize', paymentRequest);
            
            if (response.status === 200) {
                setMessage("OTP has been sent to your email. Check your inbox!");
                setTimeout(() => {
                    setMessage(null);
                    setStep(2);
                }, 2000);
            }
        } catch (error) {
            setMessage(error.response?.data?.message || "Failed to process payment. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleOTPSubmit = async (e) => {
        e.preventDefault();

        if (!otpCode || otpCode.length !== 6) {
            setMessage("Please enter a valid 6-digit OTP");
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const otpRequest = {
                orderId,
                otpCode
            };

            const response = await ApiService.post('/api/payments/verify-otp', otpRequest);

            if (response.status === 200) {
                setMessage("OTP verified successfully!");
                setTimeout(() => {
                    setMessage(null);
                    setStep(3);
                }, 1500);
            }
        } catch (error) {
            setMessage(error.response?.data?.message || "Invalid OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Process payment
    const handlePaymentConfirm = async () => {
        setLoading(true);
        setMessage(null);

        try {
            const response = await ApiService.post(`/api/payments/process/${orderId}`, {});

            if (response.status === 200) {
                setMessage("Payment successful! Redirecting to home...");
                setTimeout(() => {
                    navigate('/');
                }, 2000);
                setStep(4);
            }
        } catch (error) {
            setMessage(error.response?.data?.message || "Payment failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="payment-page">
            <div className="payment-container">
                <h1>Secure Payment</h1>

                {/* Step indicator */}
                <div className="step-indicator">
                    <div className={`step ${step >= 1 ? 'active' : ''}`}>
                        <span>1</span>
                        <p>Card Info</p>
                    </div>
                    <div className={`step ${step >= 2 ? 'active' : ''}`}>
                        <span>2</span>
                        <p>Verify OTP</p>
                    </div>
                    <div className={`step ${step >= 3 ? 'active' : ''}`}>
                        <span>3</span>
                        <p>Confirm</p>
                    </div>
                </div>

                {message && <p className={`message ${loading ? 'info' : 'error'}`}>{message}</p>}

                {/* Step 1: Card Information */}
                {step === 1 && (
                    <form onSubmit={handleCardSubmit} className="payment-form">
                        <h2>Enter Card Information</h2>
                        
                        <div className="form-group">
                            <label>Cardholder Name</label>
                            <input
                                type="text"
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value)}
                                placeholder="John Doe"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label>Card Number</label>
                            <input
                                type="text"
                                value={cardNumber}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                                    setCardNumber(val);
                                }}
                                placeholder="1234 5678 9012 3456"
                                maxLength="16"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Expiry Date (MM/YY)</label>
                                <input
                                    type="text"
                                    value={expiryDate}
                                    onChange={(e) => {
                                        let val = e.target.value.replace(/\D/g, '');
                                        if (val.length >= 2) {
                                            val = val.slice(0, 2) + '/' + val.slice(2, 4);
                                        }
                                        setExpiryDate(val);
                                    }}
                                    placeholder="MM/YY"
                                    maxLength="5"
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label>CVV</label>
                                <input
                                    type="text"
                                    value={cvv}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                        setCvv(val);
                                    }}
                                    placeholder="123"
                                    maxLength="4"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary">
                            {loading ? "Processing..." : "Send OTP"}
                        </button>
                    </form>
                )}

                {/* Step 2: OTP Verification */}
                {step === 2 && (
                    <form onSubmit={handleOTPSubmit} className="payment-form">
                        <h2>Verify OTP</h2>
                        <p>Enter the 6-digit code sent to your email</p>

                        <div className="form-group">
                            <label>OTP Code</label>
                            <input
                                type="text"
                                value={otpCode}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                    setOtpCode(val);
                                }}
                                placeholder="000000"
                                maxLength="6"
                                disabled={loading}
                                autoFocus
                            />
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary">
                            {loading ? "Verifying..." : "Verify OTP"}
                        </button>

                        <button 
                            type="button" 
                            onClick={() => {
                                setStep(1);
                                setOtpCode("");
                                setMessage(null);
                            }}
                            className="btn-secondary"
                        >
                            Back
                        </button>
                    </form>
                )}

                {/* Step 3: Confirm Payment */}
                {step === 3 && (
                    <div className="payment-form">
                        <h2>Confirm Your Payment</h2>
                        
                        <div className="confirm-info">
                            <div className="info-row">
                                <span>Order ID:</span>
                                <strong>{orderId}</strong>
                            </div>
                            <div className="info-row">
                                <span>Card:</span>
                                <strong>****{cardNumber.slice(-4)}</strong>
                            </div>
                            <div className="info-row">
                                <span>Status:</span>
                                <strong className="status-verified">✓ OTP Verified</strong>
                            </div>
                        </div>

                        <button 
                            onClick={handlePaymentConfirm}
                            disabled={loading}
                            className="btn-primary"
                        >
                            {loading ? "Processing..." : "Complete Payment"}
                        </button>

                        <button 
                            type="button"
                            onClick={() => {
                                setStep(2);
                                setMessage(null);
                            }}
                            className="btn-secondary"
                        >
                            Back
                        </button>
                    </div>
                )}

                {/* Step 4: Success */}
                {step === 4 && (
                    <div className="payment-form success">
                        <h2>✓ Payment Successful</h2>
                        <p>Thank you for your purchase!</p>
                        <div className="success-icon">✓</div>
                        <p className="redirect-text">Redirecting to home...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentPage;
