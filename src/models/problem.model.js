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
    }
}, { timestamps: true });
 
const Problem = mongoose.model("Problem", problemSchema);

export { Problem };