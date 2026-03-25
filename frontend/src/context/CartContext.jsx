import React, { createContext, useContext, useReducer } from 'react';
import { supabase } from '../config/supabaseClient';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const initialState = {
  cartItems: localStorage.getItem('cartItems')
    ? JSON.parse(localStorage.getItem('cartItems'))
    : [],
  shippingAddress: localStorage.getItem('shippingAddress')
    ? JSON.parse(localStorage.getItem('shippingAddress'))
    : {},
  paymentMethod: 'Razorpay',
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'CART_ADD_ITEM':
      const item = action.payload;
      const existItem = state.cartItems.find((x) => x.product === item.product);

      if (existItem) {
        return {
          ...state,
          cartItems: state.cartItems.map((x) =>
            x.product === existItem.product ? item : x
          ),
        };
      } else {
        return {
          ...state,
          cartItems: [...state.cartItems, item],
        };
      }
    case 'CART_REMOVE_ITEM':
      return {
        ...state,
        cartItems: state.cartItems.filter((x) => x.product !== action.payload),
      };
    case 'CART_SAVE_SHIPPING_ADDRESS':
      return {
        ...state,
        shippingAddress: action.payload,
      };
    case 'CART_CLEAR_ITEMS':
      return {
        ...state,
        cartItems: [],
      };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addToCart = async (product, qty) => {
    const item = {
      product: product.id || product._id,
      name: product.name,
      image: product.images[0]?.url,
      price: product.price,
      stock: product.stock,
      qty,
    };
    dispatch({ type: 'CART_ADD_ITEM', payload: item });
    localStorage.setItem('cartItems', JSON.stringify([...state.cartItems, item]));

    // Log the event to Supabase
    try {
      const visitorId = localStorage.getItem('visitorId');
      if (visitorId) {
        await supabase.from('cart_events').insert({
          visitor_id: visitorId,
          product_id: item.product,
          product_name: item.name,
          action: 'add'
        });
      }
    } catch (error) {
      console.error('Error logging add to cart event:', error);
    }
  };

  const removeFromCart = async (id) => {
    const removedItem = state.cartItems.find(x => x.product === id);
    dispatch({ type: 'CART_REMOVE_ITEM', payload: id });
    const newItems = state.cartItems.filter(x => x.product !== id);
    localStorage.setItem('cartItems', JSON.stringify(newItems));

    // Log the event to Supabase
    try {
      const visitorId = localStorage.getItem('visitorId');
      if (visitorId && removedItem) {
        await supabase.from('cart_events').insert({
          visitor_id: visitorId,
          product_id: id,
          product_name: removedItem.name,
          action: 'remove'
        });
      }
    } catch (error) {
      console.error('Error logging remove from cart event:', error);
    }
  };
  
  const clearCart = () => {
    dispatch({ type: 'CART_CLEAR_ITEMS' });
    localStorage.removeItem('cartItems');
  }

  return (
    <CartContext.Provider value={{ cart: state, dispatch, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
