import { AppError } from "../errors.js";

const TITLES = {
  400: "Requête invalide",
  404: "Ressource introuvable",
  409: "Conflit",
  413: "Contenu trop volumineux",
  500: "Erreur interne du serveur",
};

function sendProblem(res, status, detail, instance) {
  res
    .status(status)
    .type("application/problem+json")
    .json({
      type: "about:blank",
      title: TITLES[status] ?? "Erreur",
      status,
      detail,
      ...(instance ? { instance } : {}),
    });
}

export function notFoundHandler(req, res) {
  sendProblem(res, 404, `Route introuvable : ${req.method} ${req.originalUrl}`, req.originalUrl);
}

export function errorHandler(err, req, res, _next) {
  if (err instanceof AppError) {
    return sendProblem(res, err.status, err.message, req.originalUrl);
  }

  if (err?.type === "entity.parse.failed") {
    return sendProblem(res, 400, "Corps JSON mal formé.", req.originalUrl);
  }

  if (err?.type === "entity.too.large") {
    return sendProblem(res, 413, "Le corps de la requête dépasse la limite autorisée de 1 Mo.", req.originalUrl);
  }

  if (err?.code === "23505") {
    return sendProblem(res, 409, "Cette ressource existe déjà.", req.originalUrl);
  }

  if (err?.code === "23503" || err?.code === "23514" || err?.code === "22P02") {
    return sendProblem(res, 400, "Les données fournies sont invalides.", req.originalUrl);
  }

  console.error(err);
  return sendProblem(res, 500, "Une erreur interne est survenue.", req.originalUrl);
}