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
  // Split the input value into day, month, and year
  const [day, month, year] = value.split("/").map(Number);
  const parsedDate = new Date(year, month - 1, day);      // 30-1-2024  ---> 01-2-2024

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
};

export { validateDOB, validatePhoneNumber }