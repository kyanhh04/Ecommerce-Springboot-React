import React,{useState} from "react";
import {useNavigate} from "react-router-dom";
import ApiService from "../../service/ApiService";
import {useCart} from "../context/CartContext";
import "../../style/cart.css";

const CartPage=()=>{

    const {cart,dispatch}=useCart();
    const [message,setMessage]=useState(null);
    const [discountCode,setDiscountCode]=useState("");
    const [discount,setDiscount]=useState(null);
    const [discountError,setDiscountError]=useState("");
    const navigate=useNavigate();

    const incrementItem=(product)=>{
        dispatch({type:"INCREMENT_ITEM",payload:product});
    };

    const decrementItem=(product)=>{
        const cartItem=cart.find(item=>item.id===product.id);

        if(cartItem&&cartItem.quantity>1){
            dispatch({type:"DECREMENT_ITEM",payload:product});
        }else{
            dispatch({type:"REMOVE_ITEM",payload:product});
        }
    };

    const totalPrice=cart.reduce((total,item)=>total+item.price*item.quantity,0);

    const applyDiscount=async()=>{
        if(!discountCode.trim()){
            setDiscountError("Vui lòng nhập mã giảm giá");
            return;
        }

        try{
            const response=await ApiService.getDiscountByCode(discountCode.toUpperCase());

            if(response.status===200){
                setDiscount(response.discount);
                setDiscountError("");
                setMessage("Áp dụng mã giảm giá thành công");
                setTimeout(()=>setMessage(""),3000);
            }

        }catch(error){
            setDiscountError("Mã giảm giá không hợp lệ");
            setDiscount(null);
        }
    };

    const discountAmount=discount
        ?discount.discountType==="PERCENTAGE"
            ?(totalPrice*(discount.discountValue||0))/100
            :(discount.discountValue||0)
        :0;

    const finalPrice=Math.max(0,totalPrice-discountAmount);

    const handleCheckout=async()=>{

        if(!ApiService.isAuthenticated()){
            setMessage("Bạn cần đăng nhập");
            setTimeout(()=>{
                navigate("/login");
            },2000);
            return;
        }

        const orderItems=cart.map(item=>({
            productId:item.id,
            quantity:item.quantity
        }));

        const orderRequest={
            totalPrice:finalPrice,
            items:orderItems,
            discountCode:discount?.code||null
        };

        try{

            const response=await ApiService.createOrder(orderRequest);

            if(response.status===200&&response.order){

                const newOrderId=response.order.id;

                dispatch({type:"CLEAR_CART"});

                navigate("/payment",{
                    state:{
                        orderId:newOrderId,
                        totalPrice:finalPrice
                    }
                });

            }

        }catch(error){
            setMessage("Đặt hàng thất bại");
        }
    };

    return(

        <div className="cart-page">

            <div className="cart-container">

                <h1>Cart</h1>

                {message&&<p className="response-message">{message}</p>}

                {cart.length===0?(
                    <p>Your cart is empty</p>
                ):(
                    <div>

                        <ul>

                            {cart.map(item=>(

                                <li key={item.id}>

                                    <img src={item.imageUrl} alt={item.name}/>

                                    <div className="cart-info">

                                        <h2>{item.name}</h2>

                                        <p>{item.description}</p>

                                        <div className="quantity-controls">

                                            <button onClick={()=>decrementItem(item)}>-</button>

                                            <span>{item.quantity}</span>

                                            <button onClick={()=>incrementItem(item)}>+</button>

                                        </div>

                                    </div>

                                    <span>{item.price.toLocaleString()} ₫</span>

                                </li>

                            ))}

                        </ul>

                        <div className="discount-section">

                            <h3>Mã giảm giá</h3>

                            <div className="discount-input-group">

                                <input
                                type="text"
                                placeholder="Nhập mã"
                                value={discountCode}
                                onChange={(e)=>setDiscountCode(e.target.value)}
                                className="discount-input"
                                />

                                <button
                                onClick={applyDiscount}
                                className="apply-discount-btn"
                                >
                                Áp dụng
                                </button>

                            </div>

                            {discountError&&<p className="error-text">{discountError}</p>}

                        </div>

                        <div className="price-summary">

                            <div className="price-row">
                                <span>Tạm tính</span>
                                <span>{totalPrice.toLocaleString()} ₫</span>
                            </div>

                            {discount&&(
                                <div className="price-row">
                                    <span>Giảm</span>
                                    <span>-{discountAmount.toLocaleString()} ₫</span>
                                </div>
                            )}

                            <div className="price-row total-row">
                                <span>Tổng</span>
                                <span>{finalPrice.toLocaleString()} ₫</span>
                            </div>

                        </div>

                        <button
                        className="checkout-button"
                        onClick={handleCheckout}
                        >
                        Đặt hàng
                        </button>

                    </div>
                )}

            </div>

        </div>
    );
};

export default CartPage;