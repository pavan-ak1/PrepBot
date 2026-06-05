import { Router } from "express";
import { authenticateUser } from "../middleware/authMiddleware";
import { getInterviewResults, startInterviewSession, submitAnswer } from "../controllers/sessionController";

const router = Router();


router.post("/start", authenticateUser, startInterviewSession);

router.post("/answer", authenticateUser, submitAnswer);

router.get("/:id/results", authenticateUser, getInterviewResults)

export default router;