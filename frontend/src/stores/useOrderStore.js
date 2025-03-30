import { create } from "zustand";
import axios from "../lib/axios";

export const useOrderStore = create((set, get) => ({
    orderId: null,
    totalAmount: 0,
    error: null,
    status: "pending", // "pending" | "success" | "failed",
    razorpayLoaded: false,

    // Load Razorpay SDK
    loadRazorpay: () => {
        if (window.Razorpay) {
            set({ razorpayLoaded: true });
            return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => set({ razorpayLoaded: true });
        script.onerror = () => console.error("Failed to load Razorpay SDK");
        document.body.appendChild(script);
    },

    //  Create an order and start payment process
    createOrderAndPay: async (cart, coupon, navigate) => {
        if (!get().razorpayLoaded) {
            console.error("Razorpay SDK is not available.");
            return;
        }

        try {
            // Step 1: Create an order on the backend
            const res = await axios.post("/payments/create-checkout-session", {
                products: cart,
                couponCode: coupon ? coupon.code : null,
            });

            const { razorpayOrderId, orderId, totalAmount } = res.data;
            set({ orderId: orderId, totalAmount, status: "pending", error: null });

            // Step 2: Initialize Razorpay
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: totalAmount * 100,
                currency: "INR",
                name: "Your Store",
                description: "Purchase Order",
                order_id: razorpayOrderId,
                handler: async function (response) {
                    if (!response.razorpay_payment_id || !response.razorpay_signature) {
                        get().handleFailure("Payment failed. Please try again.", navigate);
                        return;
                    }

                    try {
                        // Step 3: Verify payment on the backend
                        await axios.post("/payments/checkout-success", {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        get().handleSuccess(navigate);
                    } catch (error) {
                        get().handleFailure("Payment verification failed. Please contact support.", navigate);
                    }
                },
                prefill: {
                    name: "John Doe",
                    email: "johndoe@example.com",
                    contact: "9999999999",
                },
                theme: { color: "#10B981" },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.on("payment.failed", function () {
                get().handleFailure("Payment failed. Please try again.", navigate);
            });

            razorpay.open();
        } catch (error) {
            get().handleFailure("Something went wrong. Please try again.", navigate);
        }
    },

    //  Handle successful payment
    handleSuccess: (navigate) => {
        set({ status: "success", error: null });
        navigate("/purchase-success");
    },

    //  Handle failed payment
    handleFailure: (errorMessage, navigate) => {
        set({ status: "failed", error: errorMessage });
        navigate("/purchase-failed");
    },

    //  Reset order state
    resetOrder: () => set({ orderId: null, totalAmount: 0, status: "pending", error: null }),
}));
