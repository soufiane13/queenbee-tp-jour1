import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Middleware de journalisation (une ligne par requête à la fin de la réponse)
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

// Données en mémoire : quelques ruches de deux sites différents
const hives = [
  { id: "SN-CASA-001", site_id: "SN-CASA", status: "active" },
  { id: "SN-CASA-002", site_id: "SN-CASA", status: "active" },
  { id: "SN-RAB-001", site_id: "SN-RAB", status: "active" },
  { id: "SN-RAB-002", site_id: "SN-RAB", status: "maintenance" },
];

const measures = [];

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
    return res.status(404).json({ error: "Ruche introuvable" });
  }
  return res.status(200).json(hive);
});

app.post("/api/hives/:id/measures", (req, res) => {
  const hive = hives.find((item) => item.id === req.params.id);
  if (!hive) {
    return res.status(404).json({ error: "Ruche introuvable" });
  }

  const { timestamp, weight_kg, hive_id, ...rest } = req.body ?? {};

  if (timestamp === undefined || timestamp === null || timestamp === "" || weight_kg === undefined || weight_kg === null) {
    return res.status(400).json({ error: "Les champs timestamp et weight_kg sont obligatoires" });
  }

  if (hive_id !== undefined && hive_id !== hive.id) {
    return res.status(400).json({ error: "hive_id doit correspondre à l'identifiant de la ruche dans l'URL" });
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

app.listen(PORT, () => {
  console.log(`Serveur TP 2 en écoute sur http://localhost:${PORT}`);
});