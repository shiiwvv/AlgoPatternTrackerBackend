import express from 'express';
import cookieParser from 'cookie-parser';

const app = express();

//MiddleWares
app.use(cookieParser());
app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended : false , limit : "16kb"}));
app.use(express.static("public"));


//routes
import {userRouter} from "../src/routes/users.routes.js"
import {problemRouter} from "../src/routes/problems.routes.js";
import {globalErrorHandler} from "../src/middlewares/error.middleware.js"
 
app.use('/api/v1/user' , userRouter);
app.use('/api/v1/problem' , problemRouter)

app.use(globalErrorHandler); 

export {app};