import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { ApiError } from "../utils/apiError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination : function(req , file , cb){
        const uploadPath = path.join(__dirname, "../../public/temp");
        cb(null , uploadPath);
    },
    filename: function(req , file , cb){
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req , file , cb) => {
    const allowedTypes = ['image/jpeg' , 'image/jpg' , 'image/png'];
    if(allowedTypes.includes(file.mimetype)){
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