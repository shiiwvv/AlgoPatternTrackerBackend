import { sendMail } from "../../service/nodemailer.service.js";
import {customSubjects , customMessages} from "../constants.js";

export const sendCurrentBatchMail = async (currentBatch) => {
    try {
        const emailPromises = currentBatch.map((user) => {
            const messages = customMessages(user.totalCount);
            const subjects = customSubjects(user.totalCount);
    
            const randomIndexMessage = Math.floor(Math.random() * messages.length);
            const randomIndexSubject = Math.floor(Math.random() * subjects.length);
    
            return sendMail(
                user.userDetails.email, 
                subjects[randomIndexSubject], 
                messages[randomIndexMessage]
            );
        });
        
        const response = await Promise.allSettled(emailPromises);
        
        let failedUsers = [];
        let successfullUserIds = [];
        response.forEach((user , index) => {
            if(user.status === 'rejected'){
                console.log(`Mail failed for ${currentBatch[index].userDetails.email}:` , user.reason);
                failedUsers.push(currentBatch[index]);
            }
            else{
                successfullUserIds.push(currentBatch[index]._id);
            }
        })
        
        console.log("Response(promise.all): " , response);

        return {successfullUserIds , failedUsers};
    } catch (error) {
        throw error;
    }
}