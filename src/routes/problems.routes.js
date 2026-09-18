import { Router } from "express";
import {handleDeleteProblem , handleMarkProblemReq , handleUpdateLastDateReq , handleUpdateProblem , handleUploadProblemReq , handleGetAllProblemsReq , handleGetParticularProblem} from "../controllers/problems.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";
import {upload} from "../middlewares/multer.middleare.js"

const problemRouter = Router();

problemRouter.use(verifyJWT);

problemRouter
    .route('/')
    .post(handleUploadProblemReq)
    .get(handleGetAllProblemsReq);

problemRouter
    .route('/get-problem')
    .get(handleGetParticularProblem);

problemRouter
    .route('/update/:problemId')
    .patch(handleUpdateProblem);

problemRouter
    .route('/update/reminder/:problemId')
    .patch(handleUpdateLastDateReq);

problemRouter
    .route('/update/mark/:problemId')
    .patch(handleMarkProblemReq);

problemRouter
    .route('/delete/:problemId')
    .delete(handleDeleteProblem);

export {problemRouter};
