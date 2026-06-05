import express from "express";
import type{Request, Response} from "express";
import dotenv from 'dotenv'
import { connectDB } from "./db/db.js";
import cookieParser from 'cookie-parser';
import interviewRoute from "./routes/interviewRoutes.js";
import cors from "cors";

dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL : 'http://localhost:3000',
    credentials: true
}));

//middlewares
app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/interview', interviewRoute)


app.get('/', (req:Request,res:Response)=>{
    res.send('Server up and running');
});



const PORT = process.env.PORT || 8081;


const start = async ()=>{
   await connectDB();
    app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`);
})
}

start();