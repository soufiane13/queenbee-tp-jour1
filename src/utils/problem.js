const TITLES = {
    400: "Requête invalide",
    404: "Ressource introuvable",
    500: "Erreur interne",
  };
  
  export function sendProblem(res, status, detail) {
    const title = TITLES[status] ?? "Erreur";
    return res
      .status(status)
      .type("application/problem+json")
      .json({
        type: "about:blank",
        title,
        status,
        detail,
      });
  }