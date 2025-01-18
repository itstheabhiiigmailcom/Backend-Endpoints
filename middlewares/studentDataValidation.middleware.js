// validates the data provided by user
import {
  validateDOB,
  validatePhoneNumber,
} from "../utilities/validation.utility.js";
import BaseJoi from "joi";
import JoiDate from "@joi/date";

const Joi = BaseJoi.extend(JoiDate);

// Predefined regular expressions
const nameRegex = /^[a-zA-Z]+$/; // Letters only
const pinCodeRegex = /^[0-9]{6,}$/; // At least 6 digits
const streetRegex = /^[a-z ]+$/; // Lowercase letters and spaces only
const buildingRegex = /^[a-zA-Z0-9 ]+$/; // Alphanumeric and spaces only
const dobRegex = /^([0-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/\d{4}$/; // Validate yy-mm-dd format
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/; // Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number, and 1 special character

export const validateStudent = (isUpdate = false) => {
  return (req, res, next) => {
    const studentSchema = Joi.object({
      first_name: Joi.string()
        .trim()
        .pattern(nameRegex)
        .when(Joi.ref("$isUpdate"), {
          is: true,
          then: Joi.optional(),
          otherwise: Joi.required(),
        })
        .messages({
          "string.empty": "First name is required.",
          "string.pattern.base": "First name must only contain alphabets.",
        }),

      last_name: Joi.string()
        .trim()
        .pattern(nameRegex)
        .when(Joi.ref("$isUpdate"), {
          is: true,
          then: Joi.optional(),
          otherwise: Joi.required(),
        })
        .messages({
          "string.empty": "Last name is required.",
          "string.pattern.base": "Last name must only contain alphabets.",
        }),
        // Adding the roll_no field validation
      roll_no: Joi.string()
      .trim()
      .min(2)  // Assuming the roll number is at least 5 characters long
      .max(5) // Assuming the roll number can be a maximum of 20 characters long
      .alphanum() // Ensuring it contains only alphanumeric characters
      .when(Joi.ref("$isUpdate"), {
        is: true,
        then: Joi.optional(),
        otherwise: Joi.required(),
      })
      .messages({
        "string.empty": "Roll number is required.",
        "string.min": "Roll number must be at least 5 characters long.",
        "string.max": "Roll number must not exceed 20 characters.",
        "string.alphanum": "Roll number must be alphanumeric.",
      }),

      mobile: Joi.string()
        .custom(validatePhoneNumber)
        .when(Joi.ref("$isUpdate"), {
          is: true,
          then: Joi.optional(),
          otherwise: Joi.required(),
        })
        .messages({
          "string.empty": "Mobile number is required.",
          "string.pattern.base":
            "Mobile number must be valid and include a country code.",
        }),

      email: Joi.string()
        .trim()
        .email({ tlds: { allow: false } })
        .lowercase()
        .when(Joi.ref("$isUpdate"), {
          is: true,
          then: Joi.optional(),
          otherwise: Joi.required(),
        })
        .messages({
          "string.empty": "Email is required.",
          "string.email": "Email must be a valid email address.",
        }),

      dob: Joi.string()
        .pattern(dobRegex)  // Validate both yy-mm-dd and yyyy-mm-dd formats
        .custom(validateDOB) // Use the external validateDOB function
        .when(Joi.ref("$isUpdate"), {
          is: true,
          then: Joi.optional(),
          otherwise: Joi.required(),
        })
        .messages({
          "string.empty": "DOB is required.",
          "string.pattern.base":
            "DOB must be in the format yy-mm-dd or yyyy-mm-dd.",
          "date.invalid": "DOB must be a valid date.",
          "date.tooYoung": "Student must be at least 15 years old.",
        }),

      password: Joi.string()
        .trim()
        .pattern(passwordRegex)
        .when(Joi.ref("$isUpdate"), {
          is: true,
          then: Joi.optional(),
          otherwise: Joi.required(),
        })
        .messages({
          "string.empty": "Password is required.",
          "string.pattern.base":
            "Password must be at least 8 characters long, contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.",
        }),

      address: Joi.object({
        building: Joi.string()
          .trim()
          .pattern(buildingRegex)
          .when(Joi.ref("$isUpdate"), {
            is: true,
            then: Joi.optional(),
            otherwise: Joi.required(),
          })
          .messages({
            "string.empty": "Building is required.",
            "string.pattern.base":
              "Building name must not contain special characters.",
          }),

        street: Joi.string()
          .trim()
          .pattern(streetRegex)
          .when(Joi.ref("$isUpdate"), {
            is: true,
            then: Joi.optional(),
            otherwise: Joi.required(),
          })
          .messages({
            "string.empty": "Street is required.",
            "string.pattern.base":
              "Street must be in lowercase and contain only letters and spaces.",
          }),

        pin: Joi.string()
          .pattern(pinCodeRegex)
          .when(Joi.ref("$isUpdate"), {
            is: true,
            then: Joi.optional(),
            otherwise: Joi.required(),
          })
          .messages({
            "string.empty": "PIN code is required.",
            "string.pattern.base": "PIN code must be at least 6 digits long.",
          }),
      }).when(Joi.ref("$isUpdate"), {
        is: true,
        then: Joi.optional(),
        otherwise: Joi.required(),
      }),
    });

    const { error, value } = studentSchema.validate(req.body, {
      abortEarly: false,
      context: { isUpdate },
    });

    if (error) {
      return res.status(400).json({
        message: "Validation failed.",
        details: error.details.map((err) => err.message),
      });
    }

    req.body = value;
    next();
  };
};
