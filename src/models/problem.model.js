import mongoose, { Schema } from "mongoose";

const problemSchema = new Schema({
    title: {
        type: String,
        required: true, 
    },
    platform: {
        type: String,
        required: true,
    },
    topic: {
        type: String,
        required: true,
    },
    difficulty: {
        type: String,
        required: true,
    }, 
    time: {  
        type: String,
    },
    notes: {
        type: String,
    },
    link : {
        type : String,
        required : true,
    },
    solved: {
        type: Boolean,
        required: true,
        default: false,
    },
    reminderTime: {
        type: Date,
        default: null,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    lastRemindedAt: { 
        type: Date, 
        default: null 
    }
}, { timestamps: true });

problemSchema.index({ solved: 1, reminderTime: 1, lastRemindedAt: 1, onwer: 1 });

problemSchema.pre("save" , async function(){

    if(this.isModified("title") || this.isModified("platform")){
        
        const requiredTitle = this.title.trim().toLowerCase().split(" ").join("-");
        const requiredPlatform = this.platform.trim().toLowerCase();
        
        this.link = `https://${requiredPlatform}.com/problems/${requiredTitle}/`;
    }
});
 
const Problem = mongoose.model("Problem", problemSchema);

export { Problem };