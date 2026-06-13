import express from "express";
import type{Request, Response} from "express";
import dotenv from 'dotenv'
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./db/db.js";
import cookieParser from 'cookie-parser';
import cors from 'cors';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

const app = express();


//router imports
import authRouter from './routes/authRoutes.js'
import { connectRedis } from "./config/redis.js";

//middlewares
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));

//router middleware
app.use('/api/v1/auth', authRouter); //usecase /register, /login


app.get('/', (req:Request,res:Response)=>{
    res.send('Server up and running');
});

const PORT = process.env.PORT || 8080;

const start = async ()=>{
   await connectRedis();
   await connectDB();
    app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`);
})
}

start();