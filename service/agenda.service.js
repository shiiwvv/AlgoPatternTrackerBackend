import {Agenda} from "agenda";
import {MongoBackend} from "@agendajs/mongo-backend";
import "dotenv/config";
import { DB_NAME } from '../src/constants.js';
import { sendMail } from "./nodemailer.service.js";
import {User} from "../src/models/user.model.js";
import { Problem } from "../src/models/problem.model.js";
import { sendCurrentBatchMail } from "../src/utils/sendBatchEmails.js";

let agenda;

const markLastReminderDate = async (successfullUserIds, startOfDay, endOfDay) => {
    if (!successfullUserIds || successfullUserIds.length === 0) return;

    await Problem.updateMany(
        {
            owner: { $in: successfullUserIds },
            reminderTime: { $gte: startOfDay, $lte: endOfDay },
        },
        {
            $set: { lastRemindedAt: new Date() } 
        }
    );
};

const initAgenda = async (mongooseConnection) => {
     
    const mongoDbInstance = mongooseConnection.getClient().db(DB_NAME);

    agenda = new Agenda({
        backend : new MongoBackend({mongo : mongoDbInstance}),
    })

    agenda.define("send reminder" , async(job) => {
        //Send Email Functionality
        try{
            const startOfDay = new Date();
            startOfDay.setHours(0 , 0 , 0 , 0);
            const endOfDay = new Date();
            endOfDay.setHours(23 , 59 , 59 , 999);

            const problems = await Problem.aggregate([
                {
                    $match : {
                        solved : false,
                        reminderTime : {
                            $gte : startOfDay,
                            $lte : endOfDay,
                        },
                    },
                },
                {
                    $group : {
                        _id : "$owner",
                        problemsToSolve : {
                            $push : {title : "$title" , link : "$link"},
                        },
                        totalCount : {$sum : 1},
                    }
                },
                {
                    $lookup : {
                        from : "users",
                        localField : "_id",
                        foreignField : "_id",
                        as : "userDetails",
                        pipeline : [
                            {
                                $project : {
                                    username : 1,
                                    email : 1,
                                }
                            }
                        ]
                    },
                },
                {
                    $unwind: "$userDetails"
                }
            ]).cursor();

            let BATCH_SIZE = 50;
            let currentBatch = [];

            let failedRequests = [];

            for await(const userDoc of problems){

                currentBatch.push(userDoc);

                if(currentBatch.length === BATCH_SIZE){
                    const {successfullUserIds , failedUsers} = await sendCurrentBatchMail(currentBatch);

                    await markLastReminderDate(successfullUserIds , startOfDay , endOfDay);

                    failedRequests.push(...failedUsers);
                    currentBatch = [];

                    await new Promise(res => setTimeout(res , 1000));
                }
            }

            if(currentBatch.length > 0){
                const {successfullUserIds , failedMails} = await sendCurrentBatchMail(currentBatch);
                await markLastReminderDate(successfullUserIds , startOfDay , endOfDay);
                failedRequests.push(...failedMails);
            }

            if(failedRequests.length > 0){
                console.log(`Job finished, but ${allFailedUsers.length} emails failed to send.`);
                throw new Error(`${allFailedUsers.length} emails failed`);
            }

            job.attrs.data.retryCount = 0;
        }
        catch(err){
            let retries = job.attrs.data.retryCount;
            retries += 1;
            job.attrs.data.retryCount = retries;

            if(retries < 3){
                const delayMinutes = Math.pow(5 , retries);
                const nextRun = new Date(Date.now() + delayMinutes * 60 * 1000);

                job.attrs.nextRunAt = nextRun;
                await job.save();
            }
            else{
                console.log('Failed 3 times. Giving up for good.');
            }

            throw err;
        }
    });
    
    agenda.define("send welcome email" , async(job) => {
        try {
            const {to , subject , text , html} = job.attrs.data;
            await sendMail(to , subject , text , html)
            console.log("Sent welcome Email");
            job.attrs.data.retryCount = 0;
        } catch (error) {
            let retries = job.attrs.data.retryCount;
            retries += 1;
            job.attrs.data.retryCount = retries;

            if(retries < 3){
                const delayMinutes = Math.pow(5 , retries);
                const nextRun = new Date(Date.now() + delayMinutes * 60 * 1000);

                job.attrs.nextRunAt = nextRun;
                await job.save();
            }
            else{
                console.log("");
            }

            throw error;
        }
    });

    agenda.define("change email" , async(job) => {
        try {
            const {email} = job.attrs.data;
            const subject = `Email ID Change Request Successfully Completed`;
            const message = `
                    Hi, User

Your request to change the email address associated with your BruteForce.com account has been accepted and completed successfully.

Your new email address is now linked to your account, and you can use it for all future communications and account-related activities.

If you did not request this change, please contact our support team immediately.

Keep learning. Keep solving. 💻

Team bruteForce.com
                `
            await sendMail(email , subject , message);

            job.attrs.data.retryCount = 0;
        } catch (error) {
            let retries = job.attrs.data.retryCount;
            retries += 1;
            job.attrs.data.retryCount = retries;

            if(retries < 3){
                const delayMinutes = Math.pow(5 , retries);
                const nextRun = new Date(Date.now() + delayMinutes * 60 * 1000);

                job.attrs.nextRunAt = nextRun;
                await job.save();
            }
            else{
                console.log("");
            }

            throw error;
        }
    })


    agenda.on('fail', (error, job) => {
        console.log(`🚨 ALERT: Job [${job.attrs.name}] failed!`);
        console.log(`Reason: ${error.message}`);
        //Will update this using slack or sentry applications...
    });

    agenda.on('success', (job) => {
        console.log(`✅ SUCCESS: Job [${job.attrs.name}] completed.`);
    });

    await agenda.start();
    console.log("agenda worker started successfully");

    await agenda.every('0 0 * * *' , "send reminder");
};

export {agenda , initAgenda};
