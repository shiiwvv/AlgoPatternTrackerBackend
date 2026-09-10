import {User} from "../models/user.model.js";
import {ApiError} from "../utils/apiError.js"
import {asyncHandler} from "../utils/asyncHandler.js"

import jwt from "jsonwebtoken";
export const verifyJWT = asyncHandler( async (req  , res , next) => {
    try{
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer " , "") || null;

        if(!token){
            throw new ApiError(400 , "User Not LoggedIn");
        }

        const decode = await jwt.verify(token , process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decode?._id).select("-password -refreshToken");

        if(!user){
            throw new ApiError(400 , "Invalid AccessToken");
        }
        
        req.user = user;
        next();
    }
    catch(err){
        throw new ApiError(400 , err?.message || "Invalid AccessToken");
    }
});