import React,{createContext,useReducer,useContext,useEffect} from "react";
const CartContext=createContext();

// Helper function to get user-specific cart key
const getCartKey = () => {
    const token = localStorage.getItem("token");
    if (!token) {
        return "cart_guest"; // Guest cart
    }
    // Decode token to get user info (simple base64 decode)
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.sub || payload.userId || payload.email;
        return `cart_user_${userId}`;
    } catch (error) {
        console.error("Error decoding token:", error);
        return "cart_guest";
    }
};

const cartReducer=(state,action)=>{
    switch(action.type){
        case "ADD_ITEM":
            const exist=state.cart.find(i=>i.id===action.payload.id);
            const quantityToAdd = action.payload.quantity || 1;
            if(exist){
                return{
                    ...state,
                    cart:state.cart.map(i=>
                        i.id===action.payload.id
                        ?{...i,quantity:i.quantity+quantityToAdd}
                        :i
                    )
                };
            }
            return{
                ...state,
                cart:[...state.cart,{...action.payload,quantity:quantityToAdd}]
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
        case "REMOVE_ITEMS":
            return{
                ...state,
                cart:state.cart.filter(i=>!action.payload.ids.includes(i.id))
            };
        case "CLEAR_CART":
            return{
                ...state,
                cart:[]
            };
        case "LOAD_CART":
            return{
                ...state,
                cart:action.payload
            };
        default:
            return state;
    }
};

export const CartProvider=({children})=>{
    const cartKey = getCartKey();
    const[state,dispatch]=useReducer(cartReducer,{
        cart:JSON.parse(localStorage.getItem(cartKey))||[]
    });
    
    useEffect(()=>{
        const currentCartKey = getCartKey();
        localStorage.setItem(currentCartKey,JSON.stringify(state.cart));
    },[state.cart]);

    // Listen for storage changes (when user logs in/out in another tab)
    useEffect(() => {
        const handleStorageChange = () => {
            const currentCartKey = getCartKey();
            const newCart = JSON.parse(localStorage.getItem(currentCartKey)) || [];
            dispatch({ type: "LOAD_CART", payload: newCart });
        };

        window.addEventListener('storage', handleStorageChange);
        
        // Also listen for custom login/logout events
        window.addEventListener('userChanged', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('userChanged', handleStorageChange);
        };
    }, []);

    return(
        <CartContext.Provider value={{cart:state.cart,dispatch}}>
            {children}
        </CartContext.Provider>
    );
};
export const useCart=()=>useContext(CartContext);