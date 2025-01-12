import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
    {
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
    }
)
const studentSchema = new mongoose.Schema(
    {
        student_id: {
            type: String,
            required: true,
            unique: true,
        },
        first_name: {
            type: String,
            required: true,
            trim: true
        },
        last_name: {
            type: String,
            required: true,
            trim: true
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
            trim: true
        },
        dob: {
            type: String,
            required: true,
            trim: true
        },
        address: {
            type: addressSchema,
            required: true,
        }
    }
)

const Student = mongoose.model("Student", studentSchema);

export { Student };