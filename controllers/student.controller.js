import Student from "../models/student.model.js";
import { v4 as uuidv4 } from "uuid";

const addStudent = async (req, res) => {
  const { first_name, last_name, mobile, email, dob, password, address } =
    req.body;

  // Validate that all fields are present and not empty
  if (
    !first_name?.trim() ||
    !last_name?.trim() ||
    !mobile ||
    !email?.trim() ||
    !dob?.trim() ||
    !password?.trim() ||
    !address ||
    !address.building?.trim() ||
    !address.street?.trim() ||
    !address.pin?.trim()
  ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Business Validation 1: Check if first name and last name are identical
    if (first_name.trim().toLowerCase() === last_name.trim().toLowerCase()) {
      return res.status(400).json({
        message: "First name and last name cannot be the same.",
      });
    }

    // Business Validation 2: Check if a student with the same name already exists in db
    const duplicateNameStudent = await Student.findOne({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
    });
    if (duplicateNameStudent) {
      return res.status(409).json({
        message: "A student with the same name already exists!",
      });
    }

    // Business Validation 3: Check if a student with the same email already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(409).json({
        message: "A student with this email already exists!",
      });
    }


    // Business Validation 4: Check if the mobile number is already registered
    const existingMobileStudent = await Student.findOne({ mobile });
    if (existingMobileStudent) {
      return res.status(409).json({
        message: "A student with the same mobile number already exists!",
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
      password,
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
    return res
      .status(400)
      .json({ message: "Student_ID is required to update the student." });
  }

  try {
    // Before updating check business requirement again 

    // **Business Validation Checks:**
    // Check if the email is being updated and already exists for another student
    if (updates.email) {
      const emailExists = await Student.findOne({
        email: updates.email,
        student_id: { $ne: student_id }, // Ensure it's not the same which we are updating for
      });
      if (emailExists) {
        return res
          .status(409)
          .json({ message: "Email is already in use by another student." });
      }
    }

    // Check if the name is being updated and matches an existing record
    if (updates.first_name && updates.last_name) {
      const nameExists = await Student.findOne({
        first_name: updates.first_name,
        last_name: updates.last_name,
        student_id: { $ne: student_id }, // Ensure it's not the same student
      });
      if (nameExists) {
        return res
          .status(409)
          .json({
            message:
              "A student with the same first and last name already exists.",
          });
      }
    }

    // Check if first_name and last_name are being updated to the same value
    if (updates.first_name && updates.last_name) {
      if (updates.first_name.trim().toLowerCase() === updates.last_name.trim().toLowerCase()) {
        return res
          .status(400)
          .json({
            message: "First name and last name cannot be the same.",
          });
      }
    }


    const student = await Student.findOneAndUpdate(
      { student_id }, // Find the student by their unique ID
      { $set: updates }, // Update only the fields provided in the request body
      { new: true } // Return the updated student
    );

    if (!student) {
      return res
        .status(404)
        .json({ message: "Student not found with this Student_ID." });
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
    const student = await Student.findOneAndDelete({ student_id });
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
