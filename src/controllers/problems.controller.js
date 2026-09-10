import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import {Problem} from "../models/problem.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import {inputValidate} from "../utils/inputValidation.js"
import mongoose , {isValidObjectId} from "mongoose";
import {allowValidInputs} from "../utils/validInputCheck.js";
import {scheduleCustomReminder} from "../utils/scheduleCustomReminder.js";
import {agenda} from "../../service/agenda.service.js"

const handleUploadProblemReq = asyncHandler(async(req ,res) => {
    if(isValidObjectId(req.user?._id)){
        throw new ApiError(400 , "Invalid UserId");
    }
    const userId = String(req.user?._id);

    const {title , platform , topic , difficulty , time , notes , ISOString} = req.body;

    if(inputValidate([title , platform , topic , difficulty , ISOString])){
        throw new ApiError(400 , "Title , Platform , Topic , Difficulty, ISOString required");
    }

    const problemAlreadyExist = await Problem.find({title , platform , ownwer : userId});

    if(problemAlreadyExist){
        return res
                .status(200)
                .json(new ApiResponse(
                    200,
                    problemAlreadyExist,
                    "Problem Alreadyy Existed",
            ));
    }

    const createProblem = await Problem.create({
        title,
        platform,
        difficulty,
        topic,
        time : time ? time : null,
        notes : notes ? notes : null,
        reminderTime : ISOString,
        solved : false,
        owner : userId,
    });

    if(!createProblem){
        throw new ApiError(500 , "Failed to Store the Problem in DB");
    }

    const problemId = String(createProblem._id);

    await scheduleCustomReminder(ISOString , userId , problemId);

    const dateObj = new Date(ISOString);
    dateObj.setDate(dateObj.getDate() + 1);

    await agenda.schedule(dateObj.toISOString() , "check streak" , {userId , problemId});

    return res
            .status(200)
            .json(new ApiResponse(
                200,
                createProblem,
                "Successfully saved Users Problem",
        ));
});
 
const handleUpdateLastDateReq = asyncHandler(async(req , res) => {
    if(!isValidObjectId(req.user?._id)){
        throw new ApiError(400 , "Invalid userId");
    }

    const userId = String(req.user?._id);

    const {ISOString} = req.body;
    const {problemId} = req.params;

    if(!isValidObjectId(problemId)){
        throw new ApiError(400 , "Invalid problemId");
    }

    const problem = await Problem.findById(problemId);
    if(!problem){
        throw new ApiError(500 , "No problem with such problemId found");
    }

    if(ISOString < new Date().toISOString()){
        throw new ApiError("Can't set reminder for a previous date...");
    }

    problem.reminderTime = ISOString;

    await agenda.cancel({
        name: "send reminder",
        'data.userId' : userId,
        'data.problemId' : problemId,
    });

    await scheduleCustomReminder(ISOString , userId , problemId);

    await problem.save();

    return res
            .status(200)
            .json(new ApiResponse(
                200,
                {},
                "Successfully saved the new date",
        ));
});

const handleMarkProblemReq = asyncHandler(async(req , res) => {
    if(isValidObjectId(req.user?._id)){
        throw new ApiError(400 , "Invalid UserId");
    }

    const {problemId} = req.body;
    if(inputValidate([problemId])){
        throw new ApiError(400 , "Missing ProblemId");
    }
    if(!isValidObjectId(problemId)){
        throw new ApiError(400 , "Invalid problemId");
    }

    const problem = await Problem.findById(problemId);

    if(!problem){
        throw new ApiError(500 , `Problem with ${problemId} doesn't exist`);
    }

    problem.solved = !problem.solved;

    await problem.save();

    return res
            .status(200)
            .json(new ApiResponse(
                200,
                problem,
                "Problem Solved Field Updates",
        ));
}); 

const handleUpdateProblem = asyncHandler(async (req , res) => {
    const {problemId} = req.query;
    
    if(isValidObjectId(req.user?._id)){
        throw new ApiError(400 , "Invalid UserId");
    }
    if(isValidObjectId(problemId)){
        throw new ApiError(400 , "Invalid problemId");
    }
    
    const {title , platform , topic , difficulty , time , notes} = req.body;

    const updateObject = allowValidInputs([{title} , {platform} , {topic} , {difficulty} , {time} , {notes}]);
    if(!updateObject){
        const user = await Problem.findById(problemId);
        if(!user){
            throw new ApiError(500 , "Failed to Fetch the user object");
        }

        return res
                .status(200)
                .json(new ApiResponse(
                    200,
                    user,
                    "Nothing to change.. User returned successfully",
            ));
    }

    const updatedProblem = await Problem.findByIdAndUpdate(      
        problemId,
        updateObject,
        {returnDocument : "after"},
    );

    if(!updatedProblem){
        throw new ApiError(500 , "Failed to Fetch the user object");
    }

    return res
            .status(200)
            .json(new ApiResponse(
                200,
                updatedProblem,
                "Successfully changed problemId",
        ));
});

const handleDeleteProblem = asyncHandler(async (req , res) => {
    if(isValidObjectId(req.user?._id)){
        throw new ApiError(400 , "Invalid userId");
    }
    
    const {problemId} = req.params;

    if(isValidObjectId(req.user?._id)){
        throw new ApiError(400 , "Invalid problemId");
    }

    const problem = await Problem.findByIdAndDelete(problemId);

    return res
            .status(200)
            .json(new ApiResponse(
                200,
                problem,
                "Deleted Successulyy",
        ));
});

export {handleUploadProblemReq , handleMarkProblemReq , handleUpdateProblem , handleUpdateLastDateReq , handleDeleteProblem}; 