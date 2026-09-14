import { validate } from "deep-email-validator";
import { asyncHandler } from "./asyncHandler.js"; 
import { ApiError } from "./apiError.js";

const validateEmail = asyncHandler(async (email) => {
    
    const emailValidation = await validate({
        email: email,
        validateRegex: true,
        validateMx: true,
        validateTypo: true,
        validateDisposable: true,
        validateSMTP: true,
    });

    console.log("emailValidation: " , emailValidation);

    const checkValidationSuccessful = 
        emailValidation.validators.regex.valid &&
        emailValidation.validators.typo.valid &&
        emailValidation.validators.disposable.valid && 
        emailValidation.validators.mx.valid;

    if (!checkValidationSuccessful) {
        throw new ApiError(400, "Invalid or unverified email address.");
    }

    return true;
});

export { validateEmail };