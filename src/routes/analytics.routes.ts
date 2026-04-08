import { Router, Request, Response } from "express";
import { insertEvent } from "../services/event.service.js";
import { getAnalytics } from "../services/analytics.service.js";
import { validateEvent } from "../validators/event.validator.js";
import { AnalyticsEvent } from "../types/analytics.types.js";

const router = Router();

router.post("/analytics", async (req: Request, res: Response): Promise<void> => {
  // Consolidate identifiers from query parameters and body
  const eventBody = {
    ...(req.body || {}),
    workspace_id: req.query.workspaceId || req.query.workspace_id || req.body?.workspace_id,
    collection_id: req.query.collectionId || req.query.collection_id || req.body?.collection_id,
  };

  const validation = validateEvent(eventBody);

  if (!validation.isValid) {
    res.status(400).json({ error: validation.error });
    return;
  }

  try {
    await insertEvent(eventBody as AnalyticsEvent);
    res.status(201).json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    res.status(500).json({ error: message });
  }
});

router.get("/stats/:workspaceId/:collectionId", async (req: Request, res: Response): Promise<void> => {
  try {
    const { workspaceId, collectionId } = req.params;

    const analytics = await getAnalytics(workspaceId as string, collectionId as string);
    res.status(200).json(analytics);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    res.status(500).json({ error: message });
  }
});

export default router;
