import {agenda} from "../../service/agenda.service.js";
import { ApiError } from "./apiError.js";

export const scheduleCustomReminder = (async (ISOdate , userId , problemId) => {
    const reminderTime = new Date(ISOdate);
    
    if(isNaN(reminderTime) || reminderTime < new Date()){
        throw new ApiError(400 , "Need to set a date in the future");
    }

    await agenda.schedule(reminderTime , 'send reminder' , {
        userId : userId,
        problemId : problemId,
        message : "send reminder by fetching email from the DB",
    });

    return true;
});