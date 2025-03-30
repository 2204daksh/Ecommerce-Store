import Coupon from "../models/coupon.model.js";

export const getCoupon = async ( req,res) => {
    try{
        const coupon = await Coupon.findOne({userId : req.user._id, isActive: true});
        res.json(coupon || null);

    } catch(err){
        console.error("Error in getting coupon:",err);
        res.status(500).json({message: "Server Error", error: err.message});
    }
}

export const validateCoupon = async (req, res) => {
    try{
        const {code} = req.body;
        const coupon = await Coupon.findOne ( {code: code, userId: req.user._id, isActive: true});

        if(!coupon){
            return res.status(404).json({message: "Coupon not found or expired"});
        }

        if(coupon.expirationDate < new Date()){
            coupon.isActive = false;
            await coupon.save();
            return res.status(400).json({message: "Coupon has expired"});
        }

        res.json({
            message: "Coupon is valid", 
            code : coupon.code,
            discountPercentage: coupon.discountPercentage
        });

    } catch(err){
        console.error("Error in validating coupon:",err);
        res.status(500).json({message: "Server Error", error: err.message});
    }
}