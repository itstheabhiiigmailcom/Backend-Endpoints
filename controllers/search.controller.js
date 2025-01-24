import qs from "qs";
import Student from "../models/student.model.js";
// Improving search technique

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


// For search Engine

const searchStudent2 = async (req, res) => {
  const { key_type, key_value } = req.body;

  // Validate input
  if (!key_type || !key_value) {
    return res
      .status(400)
      .json({ message: "Both key_type and key_value are required." });
  }

  try {
    // Utility function to escape regex-sensitive characters
    const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Escape the input key_value to handle special characters
    const sanitizedValue = escapeRegex(key_value);

    // Dynamically build the search query based on key_type and sanitizedValue
    const query = {
      [key_type]: { $regex: sanitizedValue, $options: "i" }, // Case-insensitive partial match
    };

    // Search in the database
    const results = await Student.find(query);

    // Return results
    res.status(200).json(results);
  } catch (error) {
    console.error("Error executing search:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};


const getSuggestions = async (req, res) => {
  const { key_type, query } = req.query;

  // Validate input
  if (!key_type || !query) {
    return res
      .status(400)
      .json({ message: "Both key_type and query parameters are required." });
  }

  try {
    // Dynamically build the suggestion query based on key_type and query
    const suggestionQuery = {
      [key_type]: { $regex: query, $options: "i" }, // Case-insensitive partial match
    };
    // Fetch suggestions from the database
    const suggestions = await Student.find(suggestionQuery).select(key_type);

    res.status(200).json(suggestions);
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};




export { searchItems, searchStudent2, getSuggestions };
