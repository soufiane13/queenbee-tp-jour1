import { NotFoundError, ValidationError } from "../errors.js";
import {
  findAllHives,
  findHiveById,
  createMeasure,
  findMeasuresByHiveId,
  findInspectionsByHiveId,
  createInspection,
} from "../repositories/hiveRepository.js";

function requireHive(hiveId) {
  const hive = findHiveById(hiveId);
  if (!hive) {
    throw new NotFoundError(`Aucune ruche ne porte l'identifiant ${hiveId}.`);
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

  if (hive_id !== undefined && hive_id !== hive.id) {
    throw new ValidationError(
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
  const limit = query.limit ?? 50;
  const offset = query.offset ?? 0;

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

export function syncLot(payload = {}) {
  const items = payload.inspections ?? [];
  const imported = [];

  for (const item of items) {
    const hive = requireHive(item.hive_id);
    const inspection = {
      id: item.id,
      hive_id: hive.id,
      inspected_at: item.inspected_at,
      colony_status: item.colony_status,
      ...(item.queen_present !== undefined ? { queen_present: item.queen_present } : {}),
      ...(item.observations !== undefined ? { observations: item.observations } : {}),
    };
    imported.push(createInspection(inspection));
  }

  return {
    imported_count: imported.length,
    inspections: imported,
  };
}