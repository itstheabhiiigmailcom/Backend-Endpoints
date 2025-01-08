// import fs from 'fs';
import { Student } from "../models/student.model.js";

// const filePath = "./student_record";

// function addStudent(data) {
//     try {
//         // Check if the file exists
//         if (!fs.existsSync(filePath)) {
//             const initialData = [data];
//             fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2), "utf-8");
//         } else {
//             // If the file exists, read the old data
//             const fileContent = fs.readFileSync(filePath, "utf-8").trim();
//             let students = [];

//             if (fileContent) {
//                 try {
//                     students = JSON.parse(fileContent);
//                 } catch (error) {
//                     console.error("Invalid JSON in file. Overwriting the file.");
//                     students = [];
//                 }
//             }

//             // Append the new student data to the array
//             students.push(data);

//             // Write the updated array back to the file
//             fs.writeFileSync(filePath, JSON.stringify(students, null, 2), "utf-8");
//         }
//     } catch (error) {
//         console.error("Error writing to file:", error.message);
//         throw error;
//     }
// }

// function getStudent() {
//     try {
//         if (!fs.existsSync(filePath)) {
//             return { message: "No student data found!" };
//         }
//         const data = fs.readFileSync(filePath, "utf-8");
//         return JSON.parse(data);
//     } catch (error) {
//         console.error("Error reading from file:", error.message);
//         throw error;
//     }
// }

const addStudent = async (req, res) => {
  const { first_name, last_name, mobile, email, dob, address } = req.body;

  // Validate that all fields are present and not empty
  if (
    !first_name?.trim() ||
    !last_name?.trim() ||
    !mobile ||
    !email?.trim() ||
    !dob?.trim() ||
    !address ||
    !address.building?.trim() ||
    !address.street?.trim() ||
    !address.pin?.trim()
  ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Check if a student with the same email or mobile already exists
    const existingStudent = await Student.findOne({
      $or: [{ email }, { mobile }],
    });
    if (existingStudent) {
      return res.status(409).json({
        message: "A student with this email or mobile number already exists!",
      });
    }

    // student does not exist
    const student = await Student.create({
      first_name,
      last_name,
      mobile,
      email,
      dob,
      address,
    });

    return res.status(201).json({
      message: "Student added successfully!",
      student: student,
    });
  } catch (err) {
    console.log("Error adding student : ", err.message);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};

const getAllStudents = async (req, res) => {
  try {
    // Fetch all students from the database
    const students = await Student.find();

    // Check if there are no students in the database
    if (students.length === 0) {
      return res.status(404).json({
        message: "No students found.",
      });
    }

    // Return the list of students
    return res.status(200).json({
      message: "Students retrieved successfully!",
      students: students,
    });
  } catch (err) {
    // Handle errors
    console.error("Error retrieving students:", err.message);
    return res.status(500).json({
      message: "Server error. Please try again later.",
    });
  }
};

const getStudentByEmail = async (req, res) => {
  const { email } = req.params;

  if (!email) {
    return res
      .status(400)
      .json({ message: "Email is required to fetch student data." });
  }

  try {
    const student = await Student.findOne({ email });

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    res.status(200).json({
      message: "Student retrieved successfully!",
      student,
    });
  } catch (err) {
    console.log("Error retrieving student by email:", err.message);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

const updateStudentByEmail = async (req, res) => {
  const { email } = req.params; // Extract email from the URL
  const { first_name, last_name, mobile, dob, address } = req.body; // Extract data to update

  if (!email || !first_name || !last_name || !mobile || !dob || !address) {
    return res
      .status(400)
      .json({ message: "All fields are required to update the student." });
  }

  try {
    const student = await Student.findOneAndUpdate(
      { email }, // Find the student by their unique email
      { first_name, last_name, mobile, dob, address }, // Data to update
      { new: true } // Return the updated student
    );

    if (!student) {
      return res
        .status(404)
        .json({ message: "Student not found with this email." });
    }

    res.status(200).json({
      message: "Student updated successfully!",
      student,
    });
  } catch (err) {
    console.log("Error updating student:", err.message);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

const deleteStudentByEmail = async (req, res) => {
  const { email } = req.params;
  if (!email) {
    return res
      .status(400)
      .json({
        message: "Email is required to delete the student from the database",
      });
  }

  // search for stuent
  try {
    const student = await Student.findOneAndDelete({ email });
    if (!student) {
      return res
        .status(404)
        .json({ message: "Student not found with this email id." });
    }
    // if student found and deleted then send response
    res.status(200).json({ message: "Student deleted successfully!" });
  } catch (err) {
    console.log("Error deleting student : ", err.message);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

export { addStudent, getAllStudents, getStudentByEmail, updateStudentByEmail, deleteStudentByEmail };
