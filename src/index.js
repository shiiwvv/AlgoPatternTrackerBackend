import "dotenv/config";

import {connectDB} from './db/index.js';
import { app } from "./app.js";
import {initAgenda} from "../service/agenda.service.js"

connectDB()
.then(async (mongooseConnection) => {

    await initAgenda(mongooseConnection);

    app.on("error" , (error) => {
        console.log("ERROR: " , error);
        throw error;
    });

    app.listen(process.env.PORT || 8000 , () => console.log(`Server Started at PORT: ${process.env.PORT || 8000}`))
})
.catch((err) => {
    console.log("MONGODB CONNECTION FAILURE: " , err);
    process.exit(1);
});

