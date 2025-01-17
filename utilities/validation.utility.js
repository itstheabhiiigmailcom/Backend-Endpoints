import { parsePhoneNumberFromString } from 'libphonenumber-js';

const validatePhoneNumber = (value, helpers) => {
  const phoneNumber = parsePhoneNumberFromString(value);
  if(!phoneNumber || !phoneNumber.isValid()) {
    return helpers.error("string.pattern.base", {
      message: "Invalid phone number with country code."
    })
  }
  return value;
}

const validateDOB = (value, helpers) => {
  // Manually parse the date string
  const [day, month, year] = value.split("/").map(Number);
  const parsedDate = new Date(year, month - 1, day); // Months are zero-based in JavaScript

  // Validate the parsed date
  if (parsedDate.getFullYear() !== year || parsedDate.getMonth() + 1 !== month || parsedDate.getDate() !== day) {
    return helpers.error("date.invalid");
  }

  // Ensure the user is at least 15 years old
  const minAgeDate = new Date();
  minAgeDate.setFullYear(minAgeDate.getFullYear() - 15);
  if (parsedDate > minAgeDate) {
    return helpers.error("date.tooYoung");
  }

  // Return the Date object instead of a formatted string
  return parsedDate;
};




export { validateDOB, validatePhoneNumber }