import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        products: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: [1, "Quantity should be at least 1"]
                },
                price: {
                    type: Number,
                    required: true,
                    min: 0,
                },
            },
        ],
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        razorpay_order_id: {
            type: String,
            required: true,  // Always required when order is created
        },
        razorpay_payment_id: {
            type: String,
            default: null,  // Initially null, updated after payment
        },
        razorpay_signature: {
            type: String,
            default: null,  // Initially null, updated after payment
        },
        status: {
            type: String,
            enum: ["Pending", "Paid", "Failed"],
            default: "Pending"
        }
    },
    { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
