import { Router, type Request, type Response } from "express";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/fileMiddleware.js";
import { generateInterviewReport, getInterviewReportById, getAllInterviewReports } from "../controller/interviewController.js";

const interviewRoute:Router = Router();

interviewRoute.post('/', authenticateUser, upload.single('resume'), generateInterviewReport)

interviewRoute.get(
  "/reports",
  authenticateUser,
  getAllInterviewReports
);

interviewRoute.get(
  "/reports/:id",
  authenticateUser,
  getInterviewReportById
);

export default interviewRoute;