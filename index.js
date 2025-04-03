import express from 'express';
import cors from 'cors';
import appRouter from './routes/student.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './db/index.js';

dotenv.config();

const app = express(); // initialize the express js
app.use(
  cors({
    origin: [
      'http://localhost:5000',
      'http://127.0.0.1:5500',
<<<<<<< HEAD
      'https://backend-endpoints-fcs5.onrender.com',
=======
      'http://localhost:5173',
>>>>>>> 28707575a345d2fa211c8476b1c244b072f203e6
    ],
    credentials: true,
  })
);
app.use(express.json());
// Middleware to parse incoming requests with URL-encoded payloads
app.use(express.urlencoded({ extended: true })); // For URL-encoded bodies
app.use(cookieParser());
app.use('/api/v1', appRouter);

connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log('app is listening now');
    });
  })
  .catch((err) => {
    console.log(err, ': MongoDB connection Failed');
  });
