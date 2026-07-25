import mongoose from "mongoose";

export async function connectDB() {
  const mongoURI = process.env.MONGO_URI || process.env.MONGO_URI_JOB_PREP;

  if (!mongoURI) {
    throw new Error("Db string not available");
  }

  try {
    await mongoose.connect(mongoURI);
    console.log(`Connected to database`);
  } catch (err) {
    console.log(err);
  }
}


