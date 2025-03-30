import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, "Coupon code is required"],
        unique: true,
    },
    discountPercentage: {
        type: Number,
        required: [true, "Coupon discount is required"],
        min: [0, "Coupon discount should be greater than or equal to 0"],
        max: [100, "Coupon discount should be less than or equal to 100"]
    },
    expirationDate : {
        type: Date,
        required: [true, "Coupon expiration date is required"]
    },
    isActive: {
        type: Boolean,
        default: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Coupon belongs to a user"],
        unique: true
    }
},{
    timestamps: true
})

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;