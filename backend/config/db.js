import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log(process.env.MONGO_URI);
    const mongodb = await mongoose.connect(process.env.MONGO_URI);
    console.log(`mongodb connected ${mongodb.connection.host}`);
  } catch (error) {
    console.error(`error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

