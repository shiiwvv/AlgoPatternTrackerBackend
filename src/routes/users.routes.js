import { Router } from "express";
import {handleAccountUpdateReq , handleAvatarUpdateReq , handleChangeEmailReq , handleChangePasswordReq , handleSignInReq , handleSignOutReq , handleUserSignUpReq , handleGetUserReq} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleare.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter
    .route('/signup/')
    .post(upload.single('avatar') , handleUserSignUpReq);

userRouter
    .route('/signin/')
    .post(handleSignInReq);
 
userRouter
    .route('/signout/')
    .post(verifyJWT , handleSignOutReq);

userRouter
    .route('/getUser/')
    .post(verifyJWT , handleGetUserReq);

userRouter
    .route('/update/')
    .patch(verifyJWT , handleAccountUpdateReq);

userRouter
    .route('/update/avatar/')
    .patch(verifyJWT , upload.single('avatar') , handleAvatarUpdateReq);

userRouter
    .route('/update/email')
    .patch(verifyJWT , handleChangeEmailReq);
    
userRouter
    .route('/update/password')
    .patch(verifyJWT , handleChangePasswordReq);

export {userRouter};












