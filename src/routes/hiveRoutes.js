import { Router } from "express";
import {
  listHives,
  getHive,
  addHiveMeasure,
  listHiveMeasures,
  listHiveInspections,
  addHiveInspection,
} from "../services/hiveService.js";

const router = Router();

router.get("/hives", (req, res, next) => {
  try {
    const hives = listHives(req.query.site_id);
    return res.status(200).json(hives);
  } catch (err) {
    return next(err);
  }
});

router.get("/hives/:id", (req, res, next) => {
  try {
    const hive = getHive(req.params.id);
    return res.status(200).json(hive);
  } catch (err) {
    return next(err);
  }
});

router.post("/hives/:id/measures", (req, res, next) => {
  try {
    const measure = addHiveMeasure(req.params.id, req.body);
    return res.status(201).json(measure);
  } catch (err) {
    return next(err);
  }
});

router.get("/hives/:id/measures", (req, res, next) => {
  try {
    const result = listHiveMeasures(req.params.id, req.query);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
});

router.get("/hives/:id/inspections", (req, res, next) => {
  try {
    const inspections = listHiveInspections(req.params.id);
    return res.status(200).json(inspections);
  } catch (err) {
    return next(err);
  }
});

router.post("/hives/:id/inspections", (req, res, next) => {
  try {
    const inspection = addHiveInspection(req.params.id, req.body);
    return res.status(201).json(inspection);
  } catch (err) {
    return next(err);
  }
});

export default router;