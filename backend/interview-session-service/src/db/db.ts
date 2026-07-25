import mongoose from 'mongoose';

export const connectDb = async ()=>{
    const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URI_SESSION;

    if(!MONGO_URI){
        throw new Error('Mongo db url not present');
    }
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');
}

