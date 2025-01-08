import mongoose from "mongoose";


const connectDB = async () => {
    try {
        const conn = await mongoose.connect(`${process.env.MONGo_URI}`);
        console.log("MongoDb is connected successfully!");
    }
    catch (err) {
        console.log(err ,": Error in connecting databse");
    }
}

export default connectDB;