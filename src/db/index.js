import mongoose from "mongoose";
import "dotenv/config";
import { DB_NAME } from '../constants.js';

const connectDB = async() => {
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}?appName=BackendProjectCluster`);

        console.log(`\n MONGODB CONNECTED, DB HOST: ${connectionInstance.connection.host}`);
        return mongoose.connection;
    }
    catch(err){
        console.error("MONGODB CONNECTION ERROR: " , err);
        process.exit(1);
    }
};

export {connectDB};