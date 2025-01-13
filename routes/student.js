import { Router } from "express";
import { addStudent, deleteStudentById, getAllStudents, getStudentById, updateStudentById } from "../controllers/student.controller.js";
import { validateStudent } from "../middlewares/student.middleware.js";

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

// CRUD operations
appRouter.post('/student', validateStudent, addStudent);     // create and validate before add
appRouter.get('/student',  getAllStudents);      // read all
appRouter.get('/student/:student_id', getStudentById);    // read
appRouter.put('/student/:student_id', updateStudentById);     // update
appRouter.delete('/student/:student_id', deleteStudentById);  // delete

export default appRouter;