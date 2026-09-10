import multer from "multer";
import path from "path";
import fs from "fs";
import { ApiError } from "../utils/apiError.js";

const storage = multer.diskStorage({
    destination : function(req , file , cb){
        cb(null , "./public/temp");
    },
    filename: function(req , file , cb){
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req , file , cb) => {
    const allowedTypes = ['image.jpeg' , 'image.jpg' , 'image.png'];

    if(allowedTypes.include(file.mimetype)){
        cb(null , true);
    }
    else{
        cb(new ApiError(400 , "Unsupported File Format"));
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits : {
        fileSize : 5 * 1024 * 1024,
    }
})