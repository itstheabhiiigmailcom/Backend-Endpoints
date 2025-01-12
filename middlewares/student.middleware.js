import Joi from "joi";

// Predefined regular expressions
const nameRegex = /^[a-zA-Z]+$/; // Letters only
const mobileRegex = /^[0-9]{10}$/; // 10 digits only
const pinCodeRegex = /^[0-9]{6,}$/; // At least 6 digits
const streetRegex = /^[a-z ]+$/; // Lowercase letters and spaces only
const buildingRegex = /^[a-zA-Z0-9 ]+$/; // Alphanumeric and spaces only
const dobRegex = /^([0-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/\d{4}$/; // dd/mm/yyyy format
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/; // Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number, and 1 special character


export const validateStudent = (req, res, next) => {
  const studentSchema = Joi.object({
    first_name: Joi.string()
      .trim()
      .required()
      .pattern(nameRegex)
      .messages({
        "string.empty": "First name is required.",
        "string.pattern.base": "First name must only contain alphabets.",
      }),

    last_name: Joi.string()
      .trim()
      .required()
      .pattern(nameRegex)
      .messages({
        "string.empty": "Last name is required.",
        "string.pattern.base": "Last name must only contain alphabets.",
      }),

    mobile: Joi.string()
      .required()
      .pattern(mobileRegex)
      .messages({
        "string.empty": "Mobile number is required.",
        "string.pattern.base": "Mobile number must be exactly 10 digits.",
      }),

    email: Joi.string()
      .trim()
      .required()
      .email({ tlds: { allow: false } }) // This ensures that only emails with a valid TLD (top-level domain) are allowed, preventing fake email validation attempts.
      .lowercase() // Normalize email
      .messages({
        "string.empty": "Email is required.",
        "string.email": "Email must be a valid email address.",
      }),

    dob: Joi.string()
      .required()
      .pattern(dobRegex)
      .custom((value, helpers) => {
        const [day, month, year] = value.split("/").map(Number);
        const parsedDate = new Date(year, month - 1, day);

        // Check if the parsed date is valid
        if (
          parsedDate.getFullYear() !== year ||
          parsedDate.getMonth() + 1 !== month ||
          parsedDate.getDate() !== day
        ) {
          return helpers.error("date.invalid");
        }

        // Ensure the date is at least 15 years old
        const minAgeDate = new Date();
        minAgeDate.setFullYear(minAgeDate.getFullYear() - 15);
        if (parsedDate > minAgeDate) {
          return helpers.error("date.tooYoung");
        }

        return value;
      })
      .messages({
        "string.empty": "DOB is required.",
        "string.pattern.base": "DOB must be in the format dd/mm/yyyy.",
        "date.invalid": "DOB must be a valid date.",
        "date.tooYoung": "Student must be at least 15 years old.",
      }),
    
    password: Joi.string()
      .required()
      .trim()
      .pattern(passwordRegex)
      .messages({
        "string.empty": "password is required.",
        "string.pattern.base": "Password must be at least 8 characters long, contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.",
      }),

    address: Joi.object({
      building: Joi.string()
        .trim()
        .required()
        .pattern(buildingRegex)
        .messages({
          "string.empty": "Building is required.",
          "string.pattern.base": "Building name must not contain special characters.",
        }),

      street: Joi.string()
        .trim()
        .required()
        .pattern(streetRegex)
        .messages({
          "string.empty": "Street is required.",
          "string.pattern.base": "Street must be in lowercase and contain only letters and spaces.",
        }),

      pin: Joi.string()
        .required()
        .pattern(pinCodeRegex)
        .messages({
          "string.empty": "PIN code is required.",
          "string.pattern.base": "PIN code must be at least 6 digits long.",
        }),
    }).required(),
  });

  const { error } = studentSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      message: "Validation failed.",
      details: error.details.map((err) => err.message),
    });
  }

  next();
};
