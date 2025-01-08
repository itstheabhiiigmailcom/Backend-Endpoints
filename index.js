import express from 'express';
import cors from 'cors';
import appRouter from './routes/student.js';
import dotenv from 'dotenv';
import connectDB from './db/index.js';

dotenv.config();

const app = express();      // initialize the express js
app.use(cors({
    origin: ['http://localhost:5000'],
    credentials: true
}));
app.use(express.json());
app.use(appRouter)

// app.listen(5000, ()=> {
//     console.log("server is listening on port 5000");
// })

connectDB().then(() => {
    app.listen(process.env.PORT, () => {
        console.log("app is listening now");
    });
})
.catch((err) => {
    console.log(err ,": MongoDB connection Failed");
})