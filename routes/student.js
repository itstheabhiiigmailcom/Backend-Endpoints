import { Router } from "express";
import { addStudent, deleteStudentByEmail, getAllStudents, getStudentByEmail, updateStudentByEmail } from "../controllers/student.controller.js";

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

appRouter.post('/student', addStudent);
appRouter.get('/student', getAllStudents);
appRouter.get('/student/:email', getStudentByEmail);
appRouter.put('/student/:email', updateStudentByEmail);
appRouter.delete('/student/:email', deleteStudentByEmail);

export default appRouter;