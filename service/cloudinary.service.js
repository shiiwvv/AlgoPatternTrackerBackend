import {v2 as cloudinary} from "cloudinary";
import fs from 'fs';
import { ApiError } from "../src/utils/apiError.js";
import { asyncHandler } from "../src/utils/asyncHandler.js";

cloudinary.config({ 
    cloud_name: `${process.env.CLOUDINARY_CLOUD_NAME}`, 
    api_key: `${process.env.CLOUDINARY_API_KEY}`, 
    api_secret: `${process.env.CLOUDINARY_API_SECRET}`
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        
        if(!localFilePath){
            return null;
        }

        console.log("localFilePath: " , localFilePath);

        const response = await cloudinary.uploader.upload(localFilePath , {
            resource_type : "image",
        });

        console.log("response: " , response);
        
        fs.unlinkSync(localFilePath);
        return response;
        
    } catch (error) {
        fs.unlinkSync(localFilePath);
        return null;
    }
};

const deleteFromCloudinary = async (public_id , resource_type = "image") => {
    if(!public_id){
        throw new ApiError(500 , "public_id not Found");
    }

    const result = await cloudinary.uploader.destroy(
        public_id,
        {
            resource_type : resource_type,
            invalidate : true,
        } 
    );

    if(result.result !== 'ok'){
        throw new ApiError(500 , "Deletion Failed");
    }

    return result;
};

export {uploadOnCloudinary , deleteFromCloudinary};
