import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { UnauthorizedError, ForbiddenError } from "../errors.js";

export function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw new UnauthorizedError("Token Bearer manquant ou mal formé.");
  }

  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    throw new UnauthorizedError("Token Bearer manquant.");
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = payload;
    next();
  } catch {
    throw new UnauthorizedError("Token JWT invalide ou expiré.");
  }
}

export function authorize(...allowedRoles) {
  return function checkRole(req, res, next) {
    if (!req.user) {
      throw new UnauthorizedError("Authentification requise.");
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError("Rôle insuffisant pour accéder à cette ressource.");
    }

    next();
  };
}