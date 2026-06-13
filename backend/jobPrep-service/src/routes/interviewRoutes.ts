import { Router, type Request, type Response } from "express";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/fileMiddleware.js";
import { generateInterviewReport, getInterviewReportById, getAllInterviewReports } from "../controller/interviewController.js";

const interviewRoute:Router = Router();

interviewRoute.post(
  '/',
  upload.single('resume'),
  generateInterviewReport
);

interviewRoute.get(
  '/reports',
  getAllInterviewReports
);

interviewRoute.get(
  '/reports/:id',
  getInterviewReportById
);

export default interviewRoute;