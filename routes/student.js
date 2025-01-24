import { Router } from "express";
import { addStudent, deleteStudentById, getAllStudents, getStudentById, searchStudent, updateStudentById, uploadFile } from "../controllers/student.controller.js";
import { validateStudent } from "../middlewares/studentDataValidation.middleware.js";
import { login, refreshTheToken } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { upload } from "../middlewares/multer.js";
import { getSuggestions, searchItems, searchStudent2 } from "../controllers/search.controller.js";

const appRouter = Router();


appRouter.post("/login", login);
appRouter.post("/refresh", refreshTheToken);

// secure Routes
// CRUD operations
appRouter.post('/student', upload.single("file"), authenticate, validateStudent(false) ,addStudent);     // create and validate before add
appRouter.get('/student', authenticate ,getAllStudents);      // read all
appRouter.get('/student/:student_id', authenticate, getStudentById);    // read
appRouter.put('/student/:student_id', upload.single("file"), authenticate, validateStudent(true), updateStudentById);     // update
appRouter.delete('/student/:student_id', authenticate, deleteStudentById);  // delete

appRouter.post('/search', authenticate, searchStudent)
appRouter.post('/upload', upload.single("file"), uploadFile);

appRouter.post('/search2', authenticate, searchItems)       // query type url searching technique

// Search Engine
appRouter.post('/search3', searchStudent2);
appRouter.get('/suggestions', getSuggestions);

export default appRouter;