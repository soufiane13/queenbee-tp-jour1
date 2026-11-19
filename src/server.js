import express from "express";
import { sendProblem } from "./utils/problem.js";
import { notFoundHandler, errorHandler } from "./middlewares/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 3000;
const VALID_COLONY_STATUSES = new Set(["forte", "normale", "faible", "morte"]);
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

app.use(express.json());

app.use((req, res, next) => {
  const debut = performance.now();
  res.on("finish", () => {
    const dureeMs = Math.round(performance.now() - debut);
    console.log(
      `${new Date().toISOString()} ${req.method} ${req.originalUrl} -> ${res.statusCode} (${dureeMs} ms)`
    );
  });
  next();
});

const hives = [
  { id: "SN-CASA-001", site_id: "SN-CASA", status: "active" },
  { id: "SN-CASA-002", site_id: "SN-CASA", status: "active" },
  { id: "SN-RAB-001", site_id: "SN-RAB", status: "active" },
  { id: "SN-RAB-002", site_id: "SN-RAB", status: "maintenance" },
];

const measures = [];
const inspections = [];

function parseNonNegativeInt(rawValue) {
  if (typeof rawValue !== "string" || !/^\d+$/.test(rawValue.trim())) {
    return null;
  }
  return Number.parseInt(rawValue.trim(), 10);
}

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/api/hives", (req, res) => {
  const { site_id } = req.query;
  if (typeof site_id === "string" && site_id.length > 0) {
    const filtered = hives.filter((hive) => hive.site_id === site_id);
    return res.status(200).json(filtered);
  }
  return res.status(200).json(hives);
});

app.get("/api/hives/:id", (req, res) => {
  const hive = hives.find((item) => item.id === req.params.id);
  if (!hive) {
    return sendProblem(res, 404, `Aucune ruche ne porte l'identifiant ${req.params.id}.`);
  }
  return res.status(200).json(hive);
});

app.post("/api/hives/:id/measures", (req, res) => {
  const hive = hives.find((item) => item.id === req.params.id);
  if (!hive) {
    return sendProblem(res, 404, `Aucune ruche ne porte l'identifiant ${req.params.id}.`);
  }

  const { timestamp, weight_kg, hive_id, ...rest } = req.body ?? {};

  if (
    timestamp === undefined ||
    timestamp === null ||
    timestamp === "" ||
    weight_kg === undefined ||
    weight_kg === null ||
    typeof weight_kg !== "number" ||
    Number.isNaN(weight_kg)
  ) {
    return sendProblem(
      res,
      400,
      "Les champs timestamp et weight_kg (nombre) sont obligatoires."
    );
  }

  if (hive_id !== undefined && hive_id !== hive.id) {
    return sendProblem(
      res,
      400,
      "Le champ hive_id doit correspondre à l'identifiant de la ruche dans l'URL."
    );
  }

  const measure = {
    hive_id: hive.id,
    site_id: req.body.site_id ?? hive.site_id,
    timestamp,
    weight_kg,
    ...rest,
  };

  measures.push(measure);
  return res.status(201).json(measure);
});

app.get("/api/hives/:id/measures", (req, res) => {
  const hive = hives.find((item) => item.id === req.params.id);
  if (!hive) {
    return sendProblem(res, 404, `Aucune ruche ne porte l'identifiant ${req.params.id}.`);
  }

  let limit = 50;
  if (req.query.limit !== undefined) {
    const parsedLimit = parseNonNegativeInt(req.query.limit);
    if (parsedLimit === null || parsedLimit < 1 || parsedLimit > 500) {
      return sendProblem(
        res,
        400,
        "Le paramètre limit doit être un entier compris entre 1 et 500."
      );
    }
    limit = parsedLimit;
  }

  let offset = 0;
  if (req.query.offset !== undefined) {
    const parsedOffset = parseNonNegativeInt(req.query.offset);
    if (parsedOffset === null || parsedOffset < 0) {
      return sendProblem(
        res,
        400,
        "Le paramètre offset doit être un entier supérieur ou égal à 0."
      );
    }
    offset = parsedOffset;
  }

  const hiveMeasures = measures
    .filter((item) => item.hive_id === hive.id)
    .slice()
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));

  const items = hiveMeasures.slice(offset, offset + limit);
  return res.status(200).json({ items, limit, offset });
});

app.get("/api/hives/:id/inspections", (req, res) => {
  const hive = hives.find((item) => item.id === req.params.id);
  if (!hive) {
    return sendProblem(res, 404, `Aucune ruche ne porte l'identifiant ${req.params.id}.`);
  }

  const hiveInspections = inspections.filter((item) => item.hive_id === hive.id);
  return res.status(200).json(hiveInspections);
});

app.post("/api/hives/:id/inspections", (req, res) => {
  const hive = hives.find((item) => item.id === req.params.id);
  if (!hive) {
    return sendProblem(res, 404, `Aucune ruche ne porte l'identifiant ${req.params.id}.`);
  }

  const { id, inspected_at, colony_status, queen_present, observations } = req.body ?? {};

  if (typeof id !== "string" || !UUID_REGEX.test(id)) {
    return sendProblem(res, 400, "Le champ id doit être un UUID valide.");
  }

  if (
    typeof inspected_at !== "string" ||
    inspected_at.trim() === "" ||
    Number.isNaN(Date.parse(inspected_at))
  ) {
    return sendProblem(
      res,
      400,
      "Le champ inspected_at doit être une date ISO 8601 valide."
    );
  }

  if (typeof colony_status !== "string" || !VALID_COLONY_STATUSES.has(colony_status)) {
    return sendProblem(
      res,
      400,
      "Le champ colony_status doit valoir forte, normale, faible ou morte."
    );
  }

  if (queen_present !== undefined && typeof queen_present !== "boolean") {
    return sendProblem(res, 400, "Le champ queen_present doit être un booléen.");
  }

  if (observations !== undefined && typeof observations !== "string") {
    return sendProblem(res, 400, "Le champ observations doit être une chaîne de caractères.");
  }

  const inspection = {
    id,
    hive_id: hive.id,
    inspected_at,
    colony_status,
    ...(queen_present !== undefined ? { queen_present } : {}),
    ...(observations !== undefined ? { observations } : {}),
  };

  inspections.push(inspection);
  return res.status(201).json(inspection);
});

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Serveur TP 3 en écoute sur http://localhost:${PORT}`);
});