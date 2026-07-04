import { createSlice } from '@reduxjs/toolkit';

const cartFromStorage = localStorage.getItem('cart')
  ? JSON.parse(localStorage.getItem('cart'))
  : { cartItems: [], shippingAddress: {}, paymentMethod: 'Razorpay' };

const addDecimals = (num) => Math.round(num * 100) / 100;

const calculateTotals = (cartItems) => {
  const itemsPrice = addDecimals(cartItems.reduce((acc, item) => acc + item.price * item.qty, 0));
  const shippingPrice = itemsPrice > 499 ? 0 : 49;
  const taxPrice = addDecimals(0.18 * itemsPrice); // 18% GST
  const totalPrice = addDecimals(itemsPrice + shippingPrice + taxPrice);
  return { itemsPrice, shippingPrice, taxPrice, totalPrice };
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: cartFromStorage,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existItem = state.cartItems.find((x) => x._id === item._id);
      if (existItem) {
        state.cartItems = state.cartItems.map((x) =>
          x._id === existItem._id ? { ...x, qty: Math.min(x.qty + item.qty, item.stock) } : x
        );
      } else {
        state.cartItems = [...state.cartItems, item];
      }
      const totals = calculateTotals(state.cartItems);
      Object.assign(state, totals);
      localStorage.setItem('cart', JSON.stringify(state));
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter((x) => x._id !== action.payload);
      const totals = calculateTotals(state.cartItems);
      Object.assign(state, totals);
      localStorage.setItem('cart', JSON.stringify(state));
    },
    updateCartQty: (state, action) => {
      const { id, qty } = action.payload;
      state.cartItems = state.cartItems.map((x) =>
        x._id === id ? { ...x, qty } : x
      );
      const totals = calculateTotals(state.cartItems);
      Object.assign(state, totals);
      localStorage.setItem('cart', JSON.stringify(state));
    },
    clearCart: (state) => {
      state.cartItems = [];
      state.itemsPrice = 0;
      state.shippingPrice = 0;
      state.taxPrice = 0;
      state.totalPrice = 0;
      localStorage.setItem('cart', JSON.stringify(state));
    },
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      localStorage.setItem('cart', JSON.stringify(state));
    },
    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      localStorage.setItem('cart', JSON.stringify(state));
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateCartQty,
  clearCart,
  saveShippingAddress,
  savePaymentMethod,
} = cartSlice.actions;

export default cartSlice.reducer;
