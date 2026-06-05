import { Router, type Request, type Response } from "express";
import { getMeUser, loginUser, logoutUser, registerUser } from "../controllers/authController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const authRouter:Router = Router();

authRouter.post("/register",registerUser);

authRouter.post("/login", loginUser);

authRouter.get("/logout",authenticateUser,logoutUser);

authRouter.get('/getMe',authenticateUser,getMeUser);

export default authRouter;