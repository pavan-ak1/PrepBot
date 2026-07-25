import { Router } from "express";
import { warmup } from "../warmup/warmupManager.js";

const router = Router();

router.get("/warmup", async (req, res) => {
  try {
    const result = await warmup();
    if (result.success) {
      res.status(200).json({ success: true, ready: true });
    } else {
      res.status(503).json({
        success: false,
        failedServices: result.failedServices,
      });
    }
  } catch (error) {
    console.error("[Warmup Route] Error during warmup:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during warmup",
    });
  }
});

export default router;
