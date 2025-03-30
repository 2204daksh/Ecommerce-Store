import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// verifying the access token and setting res.user = user
export const protectRoute = async (req,res,next) => {
    try{
        const accessToken = req.cookies.accessToken;

        if(!accessToken){
            return res.status(401).json({message: 'No access token, authorization denied'});
        }

        try {
            const decode = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
            const user = await User.findById(decode.userId).select("-password");

            if(!user){
                return res.status(401).json({message: 'User not found, authorization denied'});
            }

            req.user = user;
            next();

        }  catch (error) {
            if(error.name === 'TokenExpiredError'){
                return res.status(401).json({message: 'Access token expired, login again'});
            }
            throw error;
        }
    }  catch(err){
        console.log("Error in protectroute middleware", err.message);
        res.status(500).json({message: 'Server Error'});
    }
}

// check role of user
export const adminRoute = (req,res,next) => {
    if(req.user && req.user.role === 'admin'){
        next();
    } 
    else{
        return res.status(403).json({message: 'Access Denied, admin access only'});
    }
}