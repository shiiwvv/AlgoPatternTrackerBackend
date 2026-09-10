import {Agenda} from "agenda";
import {MongoBackend} from "@agendajs/mongo-backend";
import "dotenv/config";
import { DB_NAME } from '../constants.js';
import { sendMail } from "./nodemailer.service.js";
import {User} from "../src/models/user.model.js";
import {messages , subjects} from "../src/constants.js"
import { Problem } from "../src/models/problem.model.js";

let agenda;

const initAgenda = async (mongooseConnection) => {
     
    const mongoDbInstance = mongooseConnection.getClient().db(DB_NAME);

    agenda = new Agenda({
        backend : new MongoBackend({mongo : mongoDbInstance}),
    })

    agenda.define("send reminder" , async(job) => {
        //Send Email Functionality
        try{
            const {userId , problemId , message} = job.attrs.data;
            const user = await User.findById(userId);
            if(!user){
                await job.remove();
            }

            const randomIndexMessage = Math.floor(Math.random() * messages.length);
            const randomIndexSubject = Math.floor(Math.random() * subjects.length);

            await sendMail(user.email , subjects[randomIndexSubject] , messages[randomIndexMessage]);

            job.attrs.data.retryCount = 0;
        }
        catch(err){
            let retries = job.attrs.data.retryCount;
            retries += 1;
            job.attrs.data.retryCount = retries;

            if(retries < 3){
                const delayMinutes = Math.pow(5 , retries);
                const nextRun = new Date(delayMinutes * 60 * 1000);

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

            job.attrs.data.retryCount = 0;
        } catch (error) {
            let retries = job.attrs.data.retryCount;
            retries += 1;
            job.attrs.data.retryCount = retries;

            if(retries < 3){
                const delayMinutes = Math.pow(5 , retries);
                const nextRun = new Date(delayMinutes * 60 * 1000);

                job.attrs.nextRunAt = nextRun;
                await job.save();
            }
            else{
                console.log("");
            }

            throw error;
        }
    });


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
};

export {agenda , initAgenda};
