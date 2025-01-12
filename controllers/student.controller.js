import { Student } from "../models/student.model.js";
import { v4 as uuidv4 } from "uuid";

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
    // Check if a student with the same email already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(409).json({
        message: "A student with this email already exists!",
      });
    }

    // Generate a unique student_id
    const student_id = uuidv4();

    // Add a new student
    const student = await Student.create({
      student_id,
      first_name,
      last_name,
      mobile,
      email,
      dob,
      address,
    });

    return res.status(201).json({
      message: "Student added successfully!",
      student,
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
      students,
    });
  } catch (err) {
    console.error("Error retrieving students:", err.message);
    return res.status(500).json({
      message: "Server error. Please try again later.",
    });
  }
};

const getStudentById = async (req, res) => {
  const { student_id } = req.params;
  // console.log(student_id)
  if (!student_id) {
    return res
      .status(400)
      .json({ message: "Student ID is required to fetch student data." });
  }

  try {
    // Ensure `student_id` is treated as a number if stored as such
    const student = await Student.findOne({ student_id });

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    res.status(200).json({
      message: "Student retrieved successfully!",
      student,
    });
  } catch (err) {
    console.log("Error retrieving student by ID:", err.message);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};


const updateStudentById = async (req, res) => {
  const { student_id } = req.params; // Extract ID from the URL
  const updates = req.body; // Extract only the fields the user wants to update

  if (!student_id) {
    return res.status(400).json({ message: "Student_ID is required to update the student." });
  }

  try {
    const student = await Student.findOneAndUpdate(
      {student_id}, // Find the student by their unique ID
      { $set: updates }, // Update only the fields provided in the request body
      { new: true } // Return the updated student
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found with this Student_ID." });
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

const deleteStudentById = async (req, res) => {
  const { student_id } = req.params;
  if (!student_id) {
    return res
      .status(400)
      .json({ message: "Student_ID is required to delete the student." });
  }

  try {
    const student = await Student.findOneAndDelete({student_id});
    if (!student) {
      return res
        .status(404)
        .json({ message: "Student not found with this Student_ID." });
    }

    res.status(200).json({ message: "Student deleted successfully!" });
  } catch (err) {
    console.log("Error deleting student : ", err.message);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

export {
  addStudent,
  getAllStudents,
  getStudentById,
  updateStudentById,
  deleteStudentById,
};
