import express from "express";
import dotenv from "dotenv";
import path from "path";
import { connectDb } from "./db/db.js";
import cors from "cors";


import sessionRoutes from "./routes/sessionRoutes.js"
import { attachUser } from "./middleware/attachUserMiddleware.js";
import { requireGateway } from "./middleware/requireGateway.js";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true 
}));

app.use(attachUser);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", service: "Session Service" });
});

app.get("/api/v1/session/health", (req, res) => {
  res.status(200).json({ status: "UP", service: "Session Service" });
});

app.use(requireGateway);


app.get("/", (req, res) => {
  res.send("Web portal running");
});


app.use("/api/v1/session", sessionRoutes);

const start = async () => {
  const PORT = process.env.PORT || 8082;
  try {
    await connectDb();
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start session service:", error);
    process.exit(1);
  }
};


start();
