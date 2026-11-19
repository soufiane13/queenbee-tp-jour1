const hives = [
    { id: "SN-CASA-001", site_id: "SN-CASA", status: "active" },
    { id: "SN-CASA-002", site_id: "SN-CASA", status: "active" },
    { id: "SN-RAB-001", site_id: "SN-RAB", status: "active" },
    { id: "SN-RAB-002", site_id: "SN-RAB", status: "maintenance" },
  ];
  
  const measures = [];
  const inspections = [];
  
  export function findAllHives(siteId) {
    if (typeof siteId === "string" && siteId.length > 0) {
      return hives.filter((hive) => hive.site_id === siteId);
    }
    return hives;
  }
  
  export function findHiveById(id) {
    return hives.find((hive) => hive.id === id) ?? null;
  }
  
  export function createMeasure(measure) {
    measures.push(measure);
    return measure;
  }
  
  export function findMeasuresByHiveId(hiveId) {
    return measures.filter((item) => item.hive_id === hiveId);
  }
  
  export function findInspectionsByHiveId(hiveId) {
    return inspections.filter((item) => item.hive_id === hiveId);
  }
  
  export function createInspection(inspection) {
    inspections.push(inspection);
    return inspection;
  }