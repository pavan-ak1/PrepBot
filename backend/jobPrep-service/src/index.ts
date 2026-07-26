import express from "express";
import type{Request, Response} from "express";
import dotenv from 'dotenv'
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./db/db.js";
import cookieParser from 'cookie-parser';
import interviewRoute from "./routes/interviewRoutes.js";
import cors from "cors";
import { attachUser } from "./middleware/attachUserMiddleware.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

const app = express();

app.use(cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
    exposedHeaders: ["Set-Cookie"]
}));

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(attachUser);

app.use('/api/v1/interview', interviewRoute)

app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: "UP", service: "JobPrep Service" });
});

app.get('/', (req:Request,res:Response)=>{
    res.send('Server up and running');
});



const PORT = process.env.PORT || process.env.PORT_JOB || 8081;


const start = async ()=>{
   await connectDB();
    app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`);
})
}

start();