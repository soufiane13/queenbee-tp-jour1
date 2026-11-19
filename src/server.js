import express from "express";
import hiveRoutes from "./routes/hiveRoutes.js";
import { notFoundHandler, errorHandler } from "./middlewares/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 3000;

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

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api", hiveRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Serveur TP 4 en écoute sur http://localhost:${PORT}`);
});