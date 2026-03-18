import React,{createContext,useReducer,useContext,useEffect} from "react";
const CartContext=createContext();
const cartReducer=(state,action)=>{
    switch(action.type){
        case "ADD_ITEM":
            const exist=state.cart.find(i=>i.id===action.payload.id);
            const quantityToSet = action.payload.quantity || 1;
            if(exist){
                return{
                    ...state,
                    cart:state.cart.map(i=>
                        i.id===action.payload.id
                        ?{...i,quantity:quantityToSet}
                        :i
                    )
                };
            }
            return{
                ...state,
                cart:[...state.cart,{...action.payload,quantity:quantityToSet}]
            };
        case "REMOVE_ITEM":
            return{
                ...state,
                cart:state.cart.filter(i=>i.id!==action.payload.id)
            };
        case "INCREMENT_ITEM":
            return{
                ...state,
                cart:state.cart.map(i=>
                    i.id===action.payload.id
                    ?{...i,quantity:i.quantity+1}
                    :i
                )
            };
        case "DECREMENT_ITEM":
            return{
                ...state,
                cart:state.cart.map(i=>
                    i.id===action.payload.id&&i.quantity>1
                    ?{...i,quantity:i.quantity-1}
                    :i
                )
            };
        case "CLEAR_CART":
            return{
                ...state,
                cart:[]
            };
        default:
            return state;
    }
};
export const CartProvider=({children})=>{
    const[state,dispatch]=useReducer(cartReducer,{
        cart:JSON.parse(localStorage.getItem("cart"))||[]
    });
    useEffect(()=>{
        localStorage.setItem("cart",JSON.stringify(state.cart));
    },[state.cart]);
    return(
        <CartContext.Provider value={{cart:state.cart,dispatch}}>
            {children}
        </CartContext.Provider>
    );
};
export const useCart=()=>useContext(CartContext);