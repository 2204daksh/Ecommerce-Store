import toast from "react-hot-toast";
import { create } from "zustand";
import axios from "../lib/axios";

export const useCartStore = create((set, get) => ({
    cart: [],
    coupon: null,
    total: 0,
    subtotal: 0,
    isCouponApplied: false,
    
    getMyCoupon: async () => {
        try{
            const res = await axios.get("/coupons");
            set({coupon: res.data})
        }
        catch (error) {
            console.log("Error in Fetching Coupon: ", error);
        }
    },

    applyCoupon: async (code) => {
        try{
            const res = await axios.post("/coupons/validate", {code});

            console.log("Code", code);
            console.log("res", res.data);

            set({coupon: res.data, isCouponApplied: true});

            console.log("Coupon", get().coupon);

            get().calculateTotal();
            toast.success("Coupon applied successfully");
        } 
        catch (error) {
            toast.error(error.response?.data?.message || "An error occurred");
        }
    },

    removeCoupon : () => {
        set({coupon:null , isCouponApplied:false});
        get().calculateTotal();
        toast.success("Coupon removed successfully");
    },

    getCartItems: async () => {
        try {
            const res = await axios.get("/cart");
            set({ cart: res.data.cartItems });
            get().calculateTotal();  
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred");
        }
    },

    addToCart: async (product) => {
        try {
            await axios.post("/cart", { productId: product._id });

            set((prev) => {
                const existingItem = prev.cart.find((item) => item._id === product._id);

                const newCart = existingItem
                    ? prev.cart.map((item) =>
                          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
                      )
                    : [...prev.cart, { ...product, quantity: 1 }];

                toast.success("Product added to cart", { id: "Cart" });
                return { cart: newCart };
            });

            get().calculateTotal();  
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred");
        }
    },

    removeFromCart: async (productId) => {
        try {
            await axios.delete(`/cart`, {data: {productId}}); 
            set((prev) => ({
                cart: prev.cart.filter((item) => item._id !== productId),
            }));
            get().calculateTotal();  
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred");
        }
    },

    updateQuantity: async (productId, quantity) => {
        try {
            if (quantity === 0) {
                await get().removeFromCart(productId);
            } else {
                await axios.put(`/cart/${productId}`, { quantity });

                set((prev) => ({
                    cart: prev.cart.map((item) =>
                        item._id === productId ? { ...item, quantity } : item
                    ),
                }));
            }
            get().calculateTotal();  
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred");
        }
    },

     // no updation in the backend
    clearCart: async () => {
        await axios.put("/cart");
        set({ cart: [], subtotal: 0, total: 0, coupon: null, isCouponApplied: false });
    },

    calculateTotal: () => {  
        const { cart, coupon } = get();
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        let total = subtotal;

        if (coupon) {
            const discount = (subtotal * coupon.discountPercentage) / 100;
            total = subtotal - discount;
        }

        set({ subtotal, total });
    },

}));
