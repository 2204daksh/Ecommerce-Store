import {redis} from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

const generateTokens =  (userId) => {
    const accessToken = jwt.sign({userId}, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m",
    });
    const refreshToken = jwt.sign({userId}, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d",
    });

    return {accessToken, refreshToken};
}

const storeRefreshToken =  async (userId, refreshToken) => {
    await redis.set (`refresh_token${userId}`, refreshToken ,"EX", 7*24*60*60);
}

const setCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure:process.env.NODE_ENV === "production",
        sameSite:"strict",
        maxAge : 15 * 60 * 1000, // 15 minutes
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure:process.env.NODE_ENV === "production",
        sameSite:"strict",
        maxAge : 7 * 24 * 60 * 60 * 1000, // 7 days
    });
}

export const signup = async (req, res) => {
    try{
        const { email, password, name} = req.body;

        const userExists = await User.findOne({email});
        if(userExists){
            return res.status(400).json({message: "User already exists"});
        }

        const user = await User.create({name,email,password});

        // Authentication
        const {accessToken, refreshToken} = generateTokens(user._id);

        // Storing refreshToken in redis
        await storeRefreshToken(user._id, refreshToken);

        setCookies(res, accessToken, refreshToken);
 
        return res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        });

    }  catch(err){
        console.log("Error in SignUp Controller", err.message);
        return res.status(500).json({message : err.message});
    }
}

export const login = async (req, res) => {
    try{
        const {email, password} = req.body;

        const user = await User.findOne({email});
        const isMatch = await user?.comparePassword(password);

        if(!user || !isMatch){
            return res.status(400).json({message: "Invalid Email or Password"});
        }

        const {accessToken, refreshToken} = generateTokens(user._id);

        await storeRefreshToken(user._id, refreshToken);

        setCookies(res, accessToken, refreshToken);

        return res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        });

    }  catch(err){
        console.log("Error in Login Controller", err.message);
        res.status(500).json({message : "Server Error", error: err.message});
    }
}

export const logout = async (req, res) => {
    try{
        const refreshToken = req.cookies.refreshToken;
        if(refreshToken){
            const decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            await redis.del(`refresh_token${decode.userId}`);
        }
        
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        res.json({message: "Logout Successfull"})
    }  catch(err){
        console.log("Error in Logout Controller", err.message);
        res.status(500).json({message : "Server Error", error: err.message});
    }
}

// to update accessToken using refreshToken after expiration in 15min
export const refreshToken = async (req, res) => {
    try{
        const refreshToken = req.cookies.refreshToken;

        if(!refreshToken){
            return res.status(401).json({message: "No refresh token provided"});
        }

        const decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        const storedToken = await redis.get(`refresh_token${decode.userId}`);
        if(storedToken!==refreshToken){
            return res.status(401).json({message: "Refresh token is invalid"});
        }

        const accessToken = jwt.sign({userId: decode.userId}, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "15m",
        });

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure:process.env.NODE_ENV === "production",
            sameSite:"strict",
            maxAge : 15 * 60 * 1000, // 15 minutes
        });

        res.json({message: "Token refreshed Successfully"});
        
    }  catch(err){
        console.log("Error in Refresh Token Controller", err.message);
        res.status(500).json({message : "Server Error", error: err.message});
    }
}

export const getProfile = async (req, res) => {
    try{
        res.json(req.user);
    }
    catch(err){
        console.log("Error in Get Profile Controller", err.message);
        res.status(500).json({message : "Server Error", error: err.message});
    }
}