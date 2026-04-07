import { Router, Request, Response } from "express";
import { insertEvent } from "../services/event.service.js";
import { getAnalytics } from "../services/analytics.service.js";
import { validateEvent } from "../validators/event.validator.js";
import { AnalyticsEvent } from "../types/analytics.types.js";

const router = Router();

router.post("/analytics", async (req: Request, res: Response): Promise<void> => {
  const validation = validateEvent(req.body);

  if (!validation.isValid) {
    res.status(400).json({ error: validation.error });
    return;
  }

  try {
    await insertEvent(req.body as AnalyticsEvent);
    res.status(201).json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    res.status(500).json({ error: message });
  }
});

router.get("/stats", async (_req: Request, res: Response): Promise<void> => {
  try {
    const analytics = await getAnalytics();
    res.status(200).json(analytics);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    res.status(500).json({ error: message });
  }
});

export default router;
