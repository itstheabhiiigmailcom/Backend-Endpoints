import { Router } from "express";
import { addStudent, deleteStudentById, getAllStudents, getStudentById, searchStudent, updateStudentById, uploadFile } from "../controllers/student.controller.js";
import { validateStudent } from "../middlewares/studentDataValidation.middleware.js";
import { login, refreshTheToken } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import upload from "../middlewares/multer.js";

const appRouter = Router();

// appRouter.post('/add-student', (req, res) => {
//     const studentData = req.body;
//     try {
//         addStudent(studentData);
//         res.status(201).send({ message: "student data added successfully!" });
//     } catch(err) {
//         res.status(500).send({ err: "Error in writing student data" });
//     }
// });

// appRouter.get('/get-student', (req, res) => {
//     try {
//         const data = getStudent();
//         res.status(200).json(data);
//     } catch (err) {
//         res.status(500).send({ err: "Error in reading the data" });
//     }
// })


appRouter.post("/login", login);
appRouter.post("/refresh", refreshTheToken);

// secure Routes
// CRUD operations
appRouter.post('/student', authenticate, validateStudent(false), addStudent);     // create and validate before add
appRouter.get('/student', authenticate ,getAllStudents);      // read all
appRouter.get('/student/:student_id', authenticate, getStudentById);    // read
appRouter.put('/student/:student_id', authenticate, validateStudent(true), updateStudentById);     // update
appRouter.delete('/student/:student_id', authenticate, deleteStudentById);  // delete

appRouter.post('/search', authenticate, searchStudent)
appRouter.post('/upload', upload.single("file"), uploadFile);

export default appRouter;