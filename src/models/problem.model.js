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
 
const Problem = mongoose.model("Problem", problemSchema);

export { Problem };