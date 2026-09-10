import express from 'express';
import cookieParser from 'cookie-parser';

const app = express();

//MiddleWares
app.use(cookieParser());
app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended : false , limit : "16kb"}));
app.use(express.static("public"));


export {app};