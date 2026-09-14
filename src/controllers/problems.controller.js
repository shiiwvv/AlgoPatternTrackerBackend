import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import {Problem} from "../models/problem.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import {inputValidate} from "../utils/inputValidation.js"
import mongoose , {isValidObjectId} from "mongoose";
import {allowValidInputs} from "../utils/validInputCheck.js";
import {capitalizeInitialsInString} from "../utils/capitalizeInitialsInString.js"

const handleUploadProblemReq = asyncHandler(async(req ,res) => {
    if(isValidObjectId(req.user?._id)){
        throw new ApiError(400 , "Invalid UserId");
    }
    const userId = String(req.user?._id);

    const {title , platform , topic , difficulty , time , notes , ISOString} = req.body;

    if(inputValidate([title , platform , topic , difficulty , ISOString])){
        throw new ApiError(400 , "Title , Platform , Topic , Difficulty, ISOString required");
    }

    if(ISOString < new Date().toISOString()){
        throw new ApiError("Can't set reminder for a previous date...");
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

    const requiredTitle = title.trim().toLowerCase().split(" ").join("-");
    const requiredPlatform = platform.trim().toLowerCase();

    title         = capitalizeInitialsInString(title);
    platform      = capitalizeInitialsInString(platform);
    topic         = capitalizeInitialsInString(topic);
    difficulty    = capitalizeInitialsInString(difficulty);


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
        link : `https://${requiredPlatform}.com/problems/${requiredTitle}/`,
    });

    if(!createProblem){
        throw new ApiError(500 , "Failed to Store the Problem in DB");
    }

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

    const {ISOString} = req.body;
    const {problemId} = req.params;

    if(!isValidObjectId(problemId)){
        throw new ApiError(400 , "Invalid problemId");
    }

    if(ISOString < new Date().toISOString()){
        throw new ApiError("Can't set reminder for a previous date...");
    }

    const problem = await Problem.findByIdAndUpdate(
        problemId,
        {
            reminderTime : ISOString,
        },
        {returnDocument : 'after'}
    );

    if(!problem){
        throw new ApiError(500 , "Failed to update the ISOString");
    }

    return res
            .status(200)
            .json(new ApiResponse(
                200,
                problem,
                "Successfully saved the new date",
        ));
});

const handleMarkProblemReq = asyncHandler(async(req , res) => {
    if(isValidObjectId(req.user?._id)){
        throw new ApiError(400 , "Invalid UserId");
    }

    const {problemId} = req.params;
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

    title      = capitalizeInitialsInString(title);
    platform   = capitalizeInitialsInString(platform);
    topic      = capitalizeInitialsInString(topic);
    difficulty = capitalizeInitialsInString(difficulty);


    const updateObject = allowValidInputs({title , platform , topic , difficulty , time , notes});
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

const handleGetAllProblemsReq = asyncHandler(async (req , res) => {
    if(!isValidObjectId(req.user?._id)){
        throw new ApiError(400 , "Invalid userId");
    }
    
    const userId = String(req.user?._id);

    const problems = await Problem.find({owner : userId});
    
    if(!problems){
        throw new ApiError(500 , "No Problems Found, Log One To View");
    }

    return res  
            .status(200)
            .json(new ApiResponse(
                200,
                problems,
                "SuccessFully Fetched all the user Problems"
        ));
}) 

const handleGetParticularProblem = asyncHandler(async (req , res) => {
    if(isValidObjectId(req.user?._id)){
        throw new ApiError(400 , "Incorrect userId");
    }

    const {title} = req.body;

    title = capitalizeInitialsInString(title);

    const problem = await Problem.find({title});

    if(!problem){
        throw new ApiError(500 , "No Problem With Such Title Found");
    }

    return res
            .status(200)
            .json(new ApiResponse(
                200,
                problem,
                `Problem with title ${title} found`,
            ));
});

export {handleUploadProblemReq , handleMarkProblemReq , handleUpdateProblem , handleUpdateLastDateReq , handleDeleteProblem , handleGetAllProblemsReq , handleGetParticularProblem}; 