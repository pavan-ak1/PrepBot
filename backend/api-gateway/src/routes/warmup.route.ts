import { Router } from "express";
import { warmup } from "../warmup/warmupManager.js";

const router = Router();

router.get("/warmup", async (req, res) => {
  try {
    const force = req.query.force === "true";
    const status = await warmup(force);
    res.status(200).json(status);
  } catch (error) {
    console.error("[Warmup Route] Error during warmup:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during warmup",
    });
  }
});

export default router;
