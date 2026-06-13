import { Router } from "express";
import { authenticateUser } from "../middleware/authMiddleware";
import { getInterviewResults, startInterviewSession, submitAnswer, getSessionByReportId } from "../controllers/sessionController";

const router = Router();


router.post("/start", startInterviewSession);

router.post("/answer", submitAnswer);

router.get("/report/:reportId", getSessionByReportId);

router.get("/:id/results", getInterviewResults)

export default router;