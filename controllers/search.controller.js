import qs from "qs";
import Student from "../models/student.model.js";

const searchItems = async (req, res) => {
  try {
    // Parse query parameters
    const queryParams = qs.parse(req.query);
    console.log("Query Parameters:", queryParams); // Debugging

    const mongoQuery = convertToMongoQuery(queryParams);
    
    // Execute the query
    const students = await Student.find(mongoQuery);
    res.status(200).json(students);
  } catch (err) {
    console.error("Error executing search:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

function convertToMongoQuery(queryParams) {
  const mongoQuery = {};

  // Handling 'roll_no' range query
  if (queryParams.roll_no) {
    const roll_noQuery = {};
    if (queryParams.roll_no.gte)
      roll_noQuery.$gte = parseInt(queryParams.roll_no.gte);
    if (queryParams.roll_no.lte)
      roll_noQuery.$lte = parseInt(queryParams.roll_no.lte);
    if (Object.keys(roll_noQuery).length > 0) mongoQuery.roll_no = roll_noQuery;
  }

  // Handling 'or' conditions
  if (queryParams.or) {
    const orConditions = [];

    // Iterate over each condition in the 'or' array
    queryParams.or.forEach((condition) => {
      if (condition.email && condition.email.contains) {
        orConditions.push({
          email: { $regex: condition.email.contains, $options: "i" },
        });
      }

      if (condition.dob && condition.dob.gte) {
        orConditions.push({ dob: { $gte: new Date(condition.dob.gte) } });
      }
    });

    // If there are any 'or' conditions, add them to the MongoDB query
    if (orConditions.length > 0) mongoQuery.$or = orConditions;
  }

  console.log("Mongodb query : ", mongoQuery); // Debugging
  return mongoQuery;
}

const searchStudent2 = async (req, res) => {
  const { key_value } = req.body;

  // Validate input
  if (!key_value) {
    return res.status(400).json({ message: "key_value is required." });
  }

  try {
    // Search for records where first_name contains key_value (case-insensitive)
    const results = await Student.find({
      first_name: { $regex: key_value, $options: "i" },
    });

    res.status(200).json(results);
  } catch (error) {
    console.error("Error executing search:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};


const getSuggestions = async (req, res) => {
  const { query } = req.query;

  // Validate input
  if (!query) {
    return res.status(400).json({ message: "Query parameter is required." });
  }

  // Define fields to search (adjust based on your schema)
  const searchableFields = ["first_name"];

  // Build the $or query for suggestions to match anywhere in the string
  const suggestionQuery = searchableFields.map((field) => ({
    [field]: { $regex: query, $options: "i" }, // Removed ^ to allow matching anywhere in the string
  }));

  try {
    // Execute the query using Mongoose
    const suggestions = await Student.find({ $or: suggestionQuery }).select(
      searchableFields.join(" ")
    );
    console.log("suggestions:", suggestions);
    res.status(200).json(suggestions);
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};



export { searchItems, searchStudent2, getSuggestions };
