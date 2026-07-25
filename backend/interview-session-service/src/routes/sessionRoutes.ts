import { Router } from "express";
import { getInterviewResults, startInterviewSession, submitAnswer, getSessionByReportId, deleteSessionsByReportId } from "../controllers/sessionController.js";

const router = Router();


router.post("/start", startInterviewSession);

router.post("/answer", submitAnswer);

router.get("/report/:reportId", getSessionByReportId);

router.delete("/report/:reportId", deleteSessionsByReportId);

router.get("/:id/results", getInterviewResults)

export default router;