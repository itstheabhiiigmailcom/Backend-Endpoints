import mongoose from "mongoose";
import bcrypt from "bcrypt";

const addressSchema = new mongoose.Schema({
  building: {
    type: String,
    required: true,
  },
  street: {
    type: String,
    required: true,
  },
  pin: {
    type: String,
    required: true,
  },
});
const studentSchema = new mongoose.Schema({
  student_id: {
    type: String,
    required: true,
    unique: true,
  },
  first_name: {
    type: String,
    required: true,
    trim: true,
  },
  last_name: {
    type: String,
    required: true,
    trim: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  dob: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: addressSchema,
    required: true,
  },
  refreshToken: { type: String }, // Store the latest refresh token
});

studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // skip hashing if password hasn't changed
  this.password = await bcrypt.hash(this.password, 10); // hash the password with salt of 10
  next();
});

studentSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const Student = mongoose.model("Student", studentSchema);

export default Student;
