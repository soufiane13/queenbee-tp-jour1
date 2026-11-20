import { Router } from "express";
import { validate } from "../middlewares/validate.js";
import {
  hivesQuerySchema,
  measureSchema,
  paginationSchema,
  inspectionSchema,
} from "../validators/schemas.js";
import {
  listHives,
  getHive,
  addHiveMeasure,
  listHiveMeasures,
  listHiveInspections,
  addHiveInspection,
} from "../services/hiveService.js";

const router = Router();

router.get("/hives", validate(hivesQuerySchema, "query"), async (req, res) => {
  const hives = await listHives(req.validated.site_id);
  return res.status(200).json(hives);
});

router.get("/hives/:id", async (req, res) => {
  const hive = await getHive(req.params.id);
  return res.status(200).json(hive);
});

router.post("/hives/:id/measures", validate(measureSchema), async (req, res) => {
  const measure = await addHiveMeasure(req.params.id, req.validated);
  return res.status(201).json(measure);
});

router.get("/hives/:id/measures", validate(paginationSchema, "query"), async (req, res) => {
  const result = await listHiveMeasures(req.params.id, req.validated);
  return res.status(200).json(result);
});

router.get("/hives/:id/inspections", async (req, res) => {
  const inspections = await listHiveInspections(req.params.id);
  return res.status(200).json(inspections);
});

router.post("/hives/:id/inspections", validate(inspectionSchema), async (req, res) => {
  const inspection = await addHiveInspection(req.params.id, req.validated);
  return res.status(201).json(inspection);
});

export default router;