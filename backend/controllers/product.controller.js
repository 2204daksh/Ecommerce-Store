import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";

import Product from "../models/product.model.js"

export const getAllProducts = async (req,res) => {
    try{
        const products = await Product.find({});  
        res.json({products});

    }  catch(err){
        console.error("Error in getting all products:",err);
        res.status(500).json({message: "Server Error", error: err.message});
    }
}

export const getFeaturedProducts = async (req, res) => {
    try{
        // first check if present in redis store
        let featuredProducts = await redis.get("featured_products");
        if(featuredProducts){
            return res.json(JSON.parse(featuredProducts));
        }

        // check in db
        featuredProducts = await Product.find({isFeatured : true}).lean();  // .lean() returns a javascript document instead of mongodb Document
        if(!featuredProducts){
            return res.status(404).json({message: "No featured products found"});
        }

        // update redis for future quick acess 
        await redis.setex("featured_products", JSON.stringify(featuredProducts));

        res.json({featuredProducts});

    } catch(err){
        console.error("Error in getting featured products:",err);
        res.status(500).json({message: "Server Error", error: err.message});
    }
}

export const createProduct = async (req,res) => {
    try{
        const {name, description, price, image, category} = req.body;
        let cloudinaryResponse = null;

        if(image){
            cloudinaryResponse = await cloudinary.uploader.upload(image, {folder: "products"});
            if(!cloudinaryResponse){
                return res.status(400).json({message: "Failed to upload image to Cloudinary"});
            }
        }

        const product = await Product.create({
            name,
            description,
            price,
            image: cloudinaryResponse ? cloudinaryResponse.secure_url : null,
            category
        })

        res.status(201).json(product);

    } catch(err){
        console.error("Error in creating product:",err);
        res.status(500).json({message: "Server Error", error: err.message});
    }
}

export const deleteProduct = async (req,res) => {
    try{
        const product = await Product.findById(req.params.id);

        if(!product){
            return res.status(404).json({message: "Product not found"});
        }

        if (product.image){
            const publicId = product.image.split('/').pop().split(".")[0];

            try{

                await cloudinary.uploader.destroy(`product/${publicId}`);
                console.log("Image deleted from Cloudinary");

            } catch(err){
                console.error("Error in deleting image from Cloudinary:",err);
            }
        }

        await Product.findByIdAndDelete(req.params.id);

        res.json({message: "Product deleted successfully"});
    }
    catch(err){
        console.error("Error in deleting product:",err);
        res.status(500).json({message: "Server Error", error: err.message});
    }
}

export const getRecommendedProducts = async (req,res) => {
    try{
        const products = await Product.aggregate([
            {
                $sample: {size: 3}
            },
            {
                $project : {
                    _id: 1,
                    name: 1,
                    description: 1,
                    price: 1,
                    image: 1
                }
            }
        ])
    
        res.json({products});

    } catch(err){
        console.error("Error in getting recommended products:",err);
        res.status(500).json({message: "Server Error", error: err.message});
    }
}

export const getProductsByCategory = async (req,res) => {
    const {category} = req.params;

    try{
        const products = await Product.find({category});
        res.json({products});

    } catch(err){
        console.error("Error in getting products by category:",err);
        res.status(500).json({message: "Server Error", error: err.message});
    }
}

export const toggleFeaturedProduct = async (req,res) => {
    try{
        const product = await Product.findById(req.params.id);
        if(!product){
            return res.status(404).json({message: "Product not found"});
        }
        product.isFeatured = !product.isFeatured;

        const updatedProduct = await product.save();

        // function to update redis cache
        await updateFeaturedProductCache();

        res.json(updatedProduct);

    } catch(err){
        console.error("Error in toggling featured product:",err);
        res.status(500).json({message: "Server Error", error: err.message});
    }
}

async function updateFeaturedProductCache(){
    try{
        const featuredProduct = await Product.find({isFeatured: true}).lean();
        await redis.set("featured_products", JSON.stringify(featuredProduct));

    } catch(err){
        console.error("Error in updating featured product cache:",err);
    }
}