import { Router, type Request, type Response } from "express";
import { upload } from "../middleware/fileMiddleware.js";
import { generateInterviewReport, getInterviewReportById, getAllInterviewReports, deleteInterviewReport } from "../controller/interviewController.js";

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

interviewRoute.delete(
  '/reports/:id',
  deleteInterviewReport
);

interviewRoute.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "UP", service: "JobPrep Service" });
});

export default interviewRoute;