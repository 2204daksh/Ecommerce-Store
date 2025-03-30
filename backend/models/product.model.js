import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Product name is required"],
        // maxlength: [50, "Product name should not exceed 50 characters"]
    },
    description: {
        type: String,
        required: [true, "Product description is required"],
        maxlength: [500, "Product description should not exceed 500 characters"]
    },
    price: {
        type: Number,
        required: [true, "Product price is required"],
        min: [0, "Product price should be greater than or equal to 0"]
    },
    image: {
        type: String,
        required: [true, "Product image is required"]
    },
    category: {
        type: String,
        required: [true, "Product category is required"]
    },
    isFeatured : {
        type: Boolean,
        default: false
    }
},{
    timestamps: true
})

const Product = mongoose.model("Product", productSchema);

export default Product;