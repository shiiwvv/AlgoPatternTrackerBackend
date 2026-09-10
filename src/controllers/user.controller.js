import express from "express";
import mongoose , {isValidObjectId} from "mongoose";
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {User} from '../models/user.model.js';
import {validateEmail} from "../utils/emailValidator.js"
import {uploadOnCloudinary  , deleteFromCloudinary} from "../../service/cloudinary.service.js";
import {inputValidate} from "../utils/inputValidation.js";
import {cookieOptions} from "../constants.js";
import {agenda} from "../../service/agenda.service.js"

// utilities/tokenGenerator.js
const accessAndRefreshTokenGeneration = async (userId) => {
    try {
        const userObj = await User.findById(userId);
        if (!userObj) {
            throw new ApiError(404, "User not found");
        }

        const accessToken = await userObj.generateAccessToken();
        const refreshToken = await userObj.generateRefreshToken();

        userObj.refreshToken = refreshToken;
        await userObj.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(500, "Refresh and Access Token Generation Failed");
    }
};

const handleUserSignUpReq = asyncHandler(async (req , res) => {
    const {username , firstName , secondName , email , password } = req.body;

    if(inputValidate([username , firstName , secondName , email , password])){
        throw new ApiError(400 , "All Fields Are required");
    }
    
    await validateEmail(email);

    const existedUser = await User.find({
        $or : [{username} , {email}],
    });

    if(existedUser){
        throw new ApiError(409 , "Account with Email and UserName Already Exists")
    }

    const avatarLocalFilePath = req.file?.avatar;
    if(!avatarLocalFilePath){
        throw new ApiError(500 , "File Upload Through Multer Failed");
    }

    const avatarUploadCloud = await uploadOnCloudinary(avatarLocalFilePath);

    if(!avatarUploadCloud){
        throw new ApiError(500 , "Avatar Upload On Cloudinary Failed");
    }
    
    const createUser = await User.create({
        username, 
        firstName,
        secondName,
        email,
        password,
        avatar : avatarUploadCloud ? {
            url : avatarUploadCloud.url,
            public_id : avatarUploadCloud.public_id,
        } : null,
    });

    if(!createUser){ 
        await deleteFromCloudinary(avatarUploadCloud.public_id);
        throw new ApiError(500 , "Failed To Create User Doc in DB");
    }

    await agenda.now("send welcome email" , {to : email , subject : "Welcome to the codeZip.."});

    return res
            .status(200)
            .json(new ApiResponse(
                200,
                createUser,
                "User SignedUp Successfully",
        ));
}); 

const handleSignInReq = asyncHandler(async (req ,res) => {
    const {usernameOrEmail , password} = req.body;

    if(
        inputValidate([usernameOrEmail , password])
    ){
        throw new ApiError(400 , "username and password Required");
    }

    const user = User.find({
        $or : [{username : usernameOrEmail , email : usernameOrEmail}],
    });

    if(!user){
        throw new ApiError(400 , "No Such User Found in the database");
    }

    const passwordValidate = await user.passwordValidation(password);

    if(!passwordValidate){
        throw new ApiError(400 , "Incorrect Password");
    }

    const {accessToken , refreshToken} = await accessAndRefreshTokenGeneration(user._id);
    
    const loggedInUser = await User
                                .findById(user._id)
                                .select("-refreshToken -password");

    // const options = {
    //     httpOnly : true,
    //     secure : true,
    // };

    return res
            .status(200)
            .cookie("accessToken" , accessToken , cookieOptions)
            .cookie("refreshToken" , refreshToken , cookieOptions)
            .json(new ApiResponse(
                200,
                {
                    loggedInUser , accessToken , refreshToken
                },
                "User SuccessFully LoggedIn",
        ));
});

const handleSignOutReq = asyncHandler(async (req ,res) => {
    const userId = req.user?._id;
    if(isValidObjectId(req.user?._id)){
        throw new ApiError(400 , "Invalid UserId");
    }

    const user = await User.findByIdAndUpdate(
        userId,
        {
            $unset : {
                refreshToken : 1,
            }
        },
        {
            returnDocument : "after",
        }
    );

    // const options = {
    //     httpOnly : true,
    //     secure : true,
    // };

    return res.status(200)
        .clearCookie('accessToken' , cookieOptions) 
        .clearCookie('refreshToken' , cookieOptions) 
        .json(new ApiResponse(
            200, 
            {
            },
            "User Logged Out Success"
        ));
});

const handleAccountUpdateReq = asyncHandler(async (req  , res) => {
    const {username , firstName , secondName} = req.body;

    if(!isValidObjectId(req.user?._id)){
        throw new ApiError(400 , "Invalid UserId");
    }

    const updateObj = {};

    if(username){
        updateObj.username = username;
    }
    if(firstName){
        updateObj.firstName = firstName;
    }
    if(secondName){
        updateObj.secondName = secondName;
    }
    
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        updateObj,
        {
            returnDocument : "after",
        }
    );

    if(!user){
        throw new ApiError(500 , "failed to process update request");
    }

    return res
            .status(200)
            .json(new ApiResponse(
                200,
                user,
                "Updation SuccessFull",
        ));

});

const handleChangeEmailReq = asyncHandler (async (req , res) => {
    if(!isValidObjectId(req.user?._id)){
        throw new ApiError(400 , "Invalid UserId");
    }

    const {email} = req.body;

    if(!email){
        throw new ApiError(400 , "Email Required for change req");
    }

    await validateEmail(email);

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            email : email,
        },
        {returnDocument : 'after'},
    );

    if(!user){
        throw new ApiError(500 , "Failed to update email");
    }

    return res
            .status(200)
            .json(new ApiResponse(
                200,
                user,
                "Email Updated Successfully",
        ));
});

const handleChangePasswordReq = asyncHandler (async (req , res) => {
    if(!isValidObjectId(req.user?._id)){
        throw new ApiError(400 , "Invalid UserId");
    }

    const {confirmPassword , newPassword , oldPassword} = req.body;

    if(inputValidate([confirmPassword , newPassword , oldPassword])){
        throw new ApiError(400 , "Need OldPassword , newPassword , confirmPassword");
    }

    const user = await User.findById(req.user?._id);

    if(!user){
        throw new ApiError(500 , "failed To Fetch the corresponding user object");
    }

    const passValidation = await user.passwordValidation(oldPassword);
    if(!passValidation){
        throw new ApiError(400 , "Invalid oldPassword");
    }
    
    if(newPassword !== confirmPassword){
        throw new ApiError(400 , "newPassword and confirmation field doesn't match");
    }

    user.password = newPassword;

    await user.save({validateBeforeSave : false});
    
    return res
            .status(200)
            .json(new ApiResponse(
                200,
                user,
                "Password Changed Successfullyy",
        ));
});

const handleAvatarUpdateReq = asyncHandler(async (req , res) => {
    if(isValidObjectId(req.user?._id)){
        throw new ApiError(400 , "Invalid UserId");
    }

    console.log("req.file" , req.file);

    const avatarLocalFilePath = req.file.avatar;

    if(!avatarLocalFilePath){
        throw new ApiError(400 , "Avatar File Not Found");
    }

    const avatarCloundUpload = await uploadOnCloudinary(avatarLocalFilePath);

    if(!avatarCloundUpload){
        throw new ApiError(500 , "File Upload On Cloud failed");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            avatar : {
                url : avatarCloundUpload.url,
                public_id : avatarCloundUpload.public_id,
            }
        },
        {returnDocument : "after"}
    );

    if(!user){
        throw new ApiError(500 , "User not Found");
    }

    return res
            .status(200)
            .json(new ApiResponse(
                200,
                user,
                "Successfully Updated User's Avatar",
        ));
});

export {handleUserSignUpReq , handleSignInReq , handleSignOutReq , handleAccountUpdateReq , handleChangeEmailReq , handleChangePasswordReq , handleAvatarUpdateReq};