import Coupon from "../models/coupon.model.js";
import { razorpay } from "../lib/razorpay.js";
import crypto from "crypto";
import Order from "../models/order.model.js";

export const createCheckoutSession = async (req, res) => {
    try {
        const { products, couponCode } = req.body;

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ message: "No products provided" });
        }

        let totalAmount = 0;
        products.map((product) => {
            totalAmount += product.price * (product.quantity || 1);
        });

        let coupon = null;
        if (couponCode) {
            coupon = await Coupon.findOne({ code: couponCode, isActive: true, userId: req.user._id });

            if (coupon) {
                totalAmount -= (totalAmount * coupon.discountPercentage) / 100;
            }
        }

        //  Create Razorpay order
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(totalAmount * 100), // Convert to paise
            currency: "INR",
            receipt: `order_rcptid_${Date.now()}`,
        });

        //  Save order to DB without payment details (yet)
        const newOrder = new Order({
            user: req.user._id,
            products: products.map(p => ({
                product: p._id,
                quantity: p.quantity,
                price: p.price,
            })),
            totalAmount,
            razorpay_order_id: razorpayOrder.id,
            status: "Pending", // Payment not done yet
        });

        await newOrder.save();

        res.status(200).json({
            razorpayOrderId: razorpayOrder.id,
            orderId: newOrder._id,
            totalAmount,
            currency: "INR",
        });
        
    } catch (err) {
        console.error("Error in creating Razorpay order:", err.message);
        res.status(500).send({ message: "Server Error", error: err.message });
    }
};

export const checkoutSuccess = async (req, res) => {
    try {

        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
            return res.status(400).json({ message: "Invalid payment details" });
        }

        //  Verify payment signature
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({ message: "Payment verification failed" });
        }

        //  Update order with payment details
        const order = await Order.findOneAndUpdate(
            { razorpay_order_id },  
            {
                status: "Paid",
                razorpay_payment_id,
                razorpay_signature,
            },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        createNewCoupon(req.user?._id);

        res.status(200).json({
            success: true,
            message: "Payment successful, order updated.",
            orderId: order._id,
        });
    } catch (error) {
        console.error("Error verifying Razorpay payment:", error);
        res.status(500).json({ message: "Payment verification error", error: error.message });
    }
};

async function createNewCoupon(userId) {
    await Coupon.findOneAndDelete({ userId });

    const newCoupon = new Coupon({
        code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        discountPercentage: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        userId: userId,
    });

    await newCoupon.save();

    return newCoupon;
}
