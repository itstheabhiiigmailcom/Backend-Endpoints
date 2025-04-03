import { uploadToS3 } from '../middlewares/aws_s3.js';
import Student from '../models/student.model.js';
import { v4 as uuidv4 } from 'uuid';
import { deleteFileFromS3 } from '../middlewares/aws_s3.js';

const addStudent = async (req, res) => {
  const {
    first_name,
    last_name,
    roll_no,
    mobile,
    email,
    dob,
    password,
    address,
  } = req.body;
  // Validate that all fields are present and not empty
  if (
    !first_name?.trim() ||
    !last_name?.trim() ||
    !roll_no ||
    !mobile ||
    !email?.trim() ||
    !dob ||
    !password?.trim() ||
    !address ||
    !address.building?.trim() ||
    !address.street?.trim() ||
    !address.pin?.trim()
  ) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // store into database
  try {
    // Business Validation 1: Check if first name and last name are identical
    if (first_name.trim().toLowerCase() === last_name.trim().toLowerCase()) {
      return res.status(400).json({
        message: 'First name and last name cannot be the same.',
      });
    }

    // Business Validation 2: Check if a student with the same name already exists in db
    const duplicateNameStudent = await Student.findOne({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
    });
    if (duplicateNameStudent) {
      return res.status(409).json({
        message: 'A student with the same name already exists!',
      });
    }
    // Business Validation 3: Check if a student with the same email already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(409).json({
        message: 'A student with this email already exists!',
      });
    }
    // Business Validation 4: Check if the mobile number is already registered
    const existingMobileStudent = await Student.findOne({ mobile });
    if (existingMobileStudent) {
      return res.status(409).json({
        message: 'A student with the same mobile number already exists!',
      });
    }
    // Business Validation 5: Check if roll_no already exists
    const existingRollStudent = await Student.findOne({ roll_no });
    if (existingRollStudent) {
      return res.status(409).json({
        message: 'A student with the same roll no already exists!',
      });
    }

    // Upload image to AWS S3 and save URL in database
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }
    // Get the file path
    const localFilePath = file.path;
    if (!localFilePath) {
      return res.status(409).json({
        message: 'Student profile image is required!',
      });
    }

    // Upload file to AWS S3 using the local file path
    let AWSs3Url;
    try {
      const uploadResult = await uploadToS3({
        filePath: localFilePath,
        fileName: file.originalname, // Maintain the original file name
        mimetype: file.mimetype, // Pass the MIME type for content-type headers
      });
      AWSs3Url = uploadResult.Location; // S3 URL for the profile photo
    } catch (err) {
      return res.status(500).json({ message: 'Failed to upload image.' });
    }
    // Generate a unique student_id
    const student_id = uuidv4();
    // Add a new student
    const student = await Student.create({
      student_id,
      first_name,
      last_name,
      roll_no,
      mobile,
      email,
      dob,
      password,
      address, // Use parsedAddress here
      profile_photo: AWSs3Url, // Store the uploaded file's S3 URL in profile_photo
    });

    return res.status(201).json({
      message: 'Student added successfully!',
      student,
    });
  } catch (err) {
    console.log('Error adding student : ', err.message);
    return res
      .status(500)
      .json({ message: 'Server error. Please try again later.' });
  }
};

const getAllStudents = async (req, res) => {
  try {
    // Extract page and limit from query parameters, with default values
    const { page = 1, limit = 10 } = req.query;

    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // Fetch students with pagination
    const students = await Student.find()
      .skip(skip) // Skip records
      .limit(Number(limit)); // Limit the number of records

    // Get the total count of students in the database
    const totalCount = await Student.countDocuments();

    // Check if there are no students in the database
    if (students.length === 0) {
      return res.status(404).json({
        message: 'No students found.',
      });
    }

    // Return the paginated list of students with metadata
    return res.status(200).json({
      message: 'Students retrieved successfully!',
      students,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalCount / limit),
        totalStudents: totalCount,
        pageSize: Number(limit),
      },
    });
  } catch (err) {
    console.error('Error retrieving students:', err.message);
    return res.status(500).json({
      message: 'Server error. Please try again later.',
    });
  }
};

const getStudentById = async (req, res) => {
  const { student_id, first_name } = req.params;

  // Ensure either student_id or first_name is provided
  if (!student_id && !first_name) {
    return res
      .status(400)
      .json({
        message:
          'Either Student ID or First Name is required to fetch student data.',
      });
  }

  try {
    let student;

    // Fetch by student_id if it's provided
    if (student_id) {
      student = await Student.findOne({ student_id });
    }
    // Otherwise, fetch by first_name if it's provided
    else if (first_name) {
      student = await Student.findOne({ first_name });
    }

    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    res.status(200).json({
      message: 'Student retrieved successfully!',
      student,
    });
  } catch (err) {
    console.log('Error retrieving student:', err.message);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

const updateStudentById = async (req, res) => {
  const { student_id } = req.params; // Extract ID from the URL
  const updates = req.body; // Extract only the fields the user wants to update
  const file = req.file; // Check if there's a new file uploaded

  if (!student_id) {
    return res
      .status(400)
      .json({ message: 'Student_ID is required to update the student.' });
  }

  try {
    // Before updating check business requirements again

    // Check if the email is being updated and already exists for another student
    if (updates.email) {
      const emailExists = await Student.findOne({
        email: updates.email,
        student_id: { $ne: student_id }, // Ensure it's not the same student which we are updating for
      });
      if (emailExists) {
        return res
          .status(409)
          .json({ message: 'Email is already in use by another student.' });
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
        return res.status(409).json({
          message:
            'A student with the same first and last name already exists.',
        });
      }
    }

    // Check if first_name and last_name are being updated to the same value
    if (updates.first_name && updates.last_name) {
      if (
        updates.first_name.trim().toLowerCase() ===
        updates.last_name.trim().toLowerCase()
      ) {
        return res.status(400).json({
          message: 'First name and last name cannot be the same.',
        });
      }
    }

    // Handle the profile photo update (if any)
    let profile_photo = null;
    const student = await Student.findOne({ student_id }); // Find the student by ID

    if (file) {
      // If a new file is uploaded, upload it to AWS S3
      const localFilePath = file.path;
      if (!localFilePath) {
        return res.status(409).json({
          message: 'Profile photo is required!',
        });
      }

      // Delete the old profile photo from S3 if it exists
      if (student && student.profile_photo) {
        await deleteFileFromS3(student.profile_photo); // Delete the old profile photo
      }

      // Upload new file to AWS S3
      const uploadResult = await uploadToS3({
        filePath: localFilePath,
        fileName: file.originalname,
        mimetype: file.mimetype,
      });

      // Get the S3 URL for the uploaded image
      profile_photo = uploadResult.Location;
    } else {
      // If no file is uploaded, retain the old profile photo
      profile_photo = student.profile_photo;
    }

    // Update student record
    const updatedStudent = await Student.findOneAndUpdate(
      { student_id }, // Find the student by their unique ID
      {
        $set: {
          ...updates,
          profile_photo: profile_photo || undefined, // Update profile photo if provided, otherwise leave unchanged
        },
      },
      { new: true } // Return the updated student
    );

    if (!updatedStudent) {
      return res
        .status(404)
        .json({ message: 'Student not found with this Student_ID.' });
    }

    res.status(200).json({
      message: 'Student updated successfully!',
      student: updatedStudent,
    });
  } catch (err) {
    console.log('Error updating student:', err.message);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

const deleteStudentById = async (req, res) => {
  const { student_id } = req.params;
  if (!student_id) {
    return res
      .status(400)
      .json({ message: 'Student_ID is required to delete the student.' });
  }

  try {
    const student = await Student.findOneAndDelete({ student_id });
    if (!student) {
      return res
        .status(404)
        .json({ message: 'Student not found with this Student_ID.' });
    }

    res.status(200).json({ message: 'Student deleted successfully!' });
  } catch (err) {
    console.log('Error deleting student : ', err.message);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

const searchStudent = async (req, res) => {
  const { key_name, key_value, key_type } = req.body;

  // Validate input
  if (!key_name || !key_value || !key_type) {
    return res
      .status(400)
      .json({ message: 'key_name, key_value, and key_type are required.' });
  }

  // Initialize the query object
  let query = {};

  // Construct the query based on key_type
  switch (key_type) {
    case 'exact_text':
      // For exact text match
      query[key_name] = key_value;
      break;
    case 'text_contains':
      // For partial text match (case-insensitive)
      query[key_name] = { $regex: key_value, $options: 'i' };
      break;
    case 'text_starts_with':
      // For text starting with key_value
      query[key_name] = { $regex: `^${key_value}`, $options: 'i' };
      break;
    case 'text_ends_with':
      // For text ending with key_value
      query[key_name] = { $regex: `${key_value}$`, $options: 'i' };
      break;
    case 'exact_number':
      // For exact number match
      query[key_name] = Number(key_value);
      break;
    case 'number_greater_than':
      // For numbers greater than key_value
      query[key_name] = { $gt: Number(key_value) };
      break;
    case 'number_less_than':
      // For numbers less than key_value
      query[key_name] = { $lt: Number(key_value) };
      break;
    case 'exact_date':
      // For exact date match
      const [d1, m1, y1] = key_value.split('/');
      const exactDate = new Date(`${y1}-${m1}-${d1}`);
      query[key_name] = new Date(exactDate);
      break;
    case 'date_before':
      // For dates before key_value
      const [day, month, year] = key_value.split('/');
      const dateBefore = new Date(`${year}-${month}-${day}`);
      query[key_name] = { $lt: dateBefore };
      break;
    case 'date_after':
      // For dates after key_value
      const [d, m, y] = key_value.split('/');
      const dateAfter = new Date(`${y}-${m}-${d}`);
      query[key_name] = { $gt: new Date(dateAfter) };
      break;
    case 'in_list':
      // For matching values in a list
      const valueList = key_value.split(',').map((value) => value.trim()); // Split and trim the list of values
      query[key_name] = { $in: valueList };
      break;
    default:
      return res.status(400).json({ message: 'Invalid key_type provided.' });
  }

  try {
    // Execute the query using Mongoose
    const results = await Student.find(query);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error executing search:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

const uploadFile = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    // Get the file path
    const localFilePath = file.path;
    if (!localFilePath) {
      return res.status(409).json({
        message: 'student Profile is required!',
      });
    }

    // Upload file to AWS S3 using the local file path
    const uploadResult = await uploadToS3({
      filePath: localFilePath,
      fileName: file.originalname, // Maintain the original file name
      mimetype: file.mimetype, // Pass the MIME type for content-type headers
    });

    // Return success response
    return res.status(200).json({
      message: 'File uploaded successfully!',
      fileUrl: uploadResult.Location, // S3 file URL
    });
  } catch (err) {
    console.error('Error uploading file:', err.message);
    return res.status(500).json({
      message: 'Failed to upload file.',
      error: err.message,
    });
  }
};

export {
  addStudent,
  getAllStudents,
  getStudentById,
  updateStudentById,
  deleteStudentById,
  searchStudent,
  uploadFile,
};
