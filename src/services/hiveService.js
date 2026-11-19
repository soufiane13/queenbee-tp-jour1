import {
    findAllHives,
    findHiveById,
    createMeasure,
    findMeasuresByHiveId,
    findInspectionsByHiveId,
    createInspection,
  } from "../repositories/hiveRepository.js";
  
  const VALID_COLONY_STATUSES = new Set(["forte", "normale", "faible", "morte"]);
  const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  function createHttpError(statusCode, detail) {
    const err = new Error(detail);
    err.statusCode = statusCode;
    err.detail = detail;
    return err;
  }
  
  function parseNonNegativeInt(rawValue) {
    if (typeof rawValue !== "string" || !/^\d+$/.test(rawValue.trim())) {
      return null;
    }
    return Number.parseInt(rawValue.trim(), 10);
  }
  
  function requireHive(hiveId) {
    const hive = findHiveById(hiveId);
    if (!hive) {
      throw createHttpError(404, `Aucune ruche ne porte l'identifiant ${hiveId}.`);
    }
    return hive;
  }
  
  export function listHives(siteId) {
    return findAllHives(siteId);
  }
  
  export function getHive(hiveId) {
    return requireHive(hiveId);
  }
  
  export function addHiveMeasure(hiveId, payload = {}) {
    const hive = requireHive(hiveId);
    const { timestamp, weight_kg, hive_id, ...rest } = payload ?? {};
  
    if (
      timestamp === undefined ||
      timestamp === null ||
      timestamp === "" ||
      weight_kg === undefined ||
      weight_kg === null ||
      typeof weight_kg !== "number" ||
      Number.isNaN(weight_kg)
    ) {
      throw createHttpError(
        400,
        "Les champs timestamp et weight_kg (nombre) sont obligatoires."
      );
    }
  
    if (hive_id !== undefined && hive_id !== hive.id) {
      throw createHttpError(
        400,
        "Le champ hive_id doit correspondre à l'identifiant de la ruche dans l'URL."
      );
    }
  
    const measure = {
      hive_id: hive.id,
      site_id: payload.site_id ?? hive.site_id,
      timestamp,
      weight_kg,
      ...rest,
    };
  
    return createMeasure(measure);
  }
  
  export function listHiveMeasures(hiveId, query = {}) {
    const hive = requireHive(hiveId);
  
    let limit = 50;
    if (query.limit !== undefined) {
      const parsedLimit = parseNonNegativeInt(query.limit);
      if (parsedLimit === null || parsedLimit < 1 || parsedLimit > 500) {
        throw createHttpError(
          400,
          "Le paramètre limit doit être un entier compris entre 1 et 500."
        );
      }
      limit = parsedLimit;
    }
  
    let offset = 0;
    if (query.offset !== undefined) {
      const parsedOffset = parseNonNegativeInt(query.offset);
      if (parsedOffset === null || parsedOffset < 0) {
        throw createHttpError(
          400,
          "Le paramètre offset doit être un entier supérieur ou égal à 0."
        );
      }
      offset = parsedOffset;
    }
  
    const sorted = findMeasuresByHiveId(hive.id)
      .slice()
      .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
  
    const items = sorted.slice(offset, offset + limit);
    return { items, limit, offset };
  }
  
  export function listHiveInspections(hiveId) {
    const hive = requireHive(hiveId);
    return findInspectionsByHiveId(hive.id);
  }
  
  export function addHiveInspection(hiveId, payload = {}) {
    const hive = requireHive(hiveId);
    const { id, inspected_at, colony_status, queen_present, observations } = payload ?? {};
  
    if (typeof id !== "string" || !UUID_REGEX.test(id)) {
      throw createHttpError(400, "Le champ id doit être un UUID valide.");
    }
  
    if (
      typeof inspected_at !== "string" ||
      inspected_at.trim() === "" ||
      Number.isNaN(Date.parse(inspected_at))
    ) {
      throw createHttpError(
        400,
        "Le champ inspected_at doit être une date ISO 8601 valide."
      );
    }
  
    if (typeof colony_status !== "string" || !VALID_COLONY_STATUSES.has(colony_status)) {
      throw createHttpError(
        400,
        "Le champ colony_status doit valoir forte, normale, faible ou morte."
      );
    }
  
    if (queen_present !== undefined && typeof queen_present !== "boolean") {
      throw createHttpError(400, "Le champ queen_present doit être un booléen.");
    }
  
    if (observations !== undefined && typeof observations !== "string") {
      throw createHttpError(400, "Le champ observations doit être une chaîne de caractères.");
    }
  
    const inspection = {
      id,
      hive_id: hive.id,
      inspected_at,
      colony_status,
      ...(queen_present !== undefined ? { queen_present } : {}),
      ...(observations !== undefined ? { observations } : {}),
    };
  
    return createInspection(inspection);
  }