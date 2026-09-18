import mongoose , {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";

const userSchema = new Schema({
    username : {
        type : String,
        required : true
    },
    firstName : {
        type : String,
        required : true
    }, 
    secondName : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true 
    },
    password : {
        type : String,
        required : true
    },
    avatar : { 
        url : {
            type : String,
        },
        public_id : {
            type : String,
        },
    },
    refreshToken : {
        type : String,
    },
},{timestamps : true}
);


userSchema.pre("save" , async function() {
    if(!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password , 10);
})

userSchema.methods.passwordValidation = async function (password) { 
    return await bcrypt.compare(password , this.password);   
}

userSchema.methods.generateAccessToken = async function (){
    return await jwt.sign(
        {
            _id : this._id,
            username : this.username,
            email : this.email,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn : process.env.ACCESS_TOKEN_EXPIRY}
    );
};

userSchema.methods.generateRefreshToken = async function () {
    return await jwt.sign(
        {
            _id : this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn : process.env.REFRESH_TOKEN_EXPIRY}
    );
};


const User = mongoose.model("User" , userSchema);

export {User};