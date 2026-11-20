const memoryHives = [
    { id: "SN-CASA-001", site_id: "SN-CASA", status: "active" },
    { id: "SN-CASA-002", site_id: "SN-CASA", status: "active" },
    { id: "SN-RAB-001", site_id: "SN-RAB", status: "active" },
    { id: "SN-RAB-002", site_id: "SN-RAB", status: "maintenance" },
  ];
  
  const memoryMeasures = [];
  const memoryInspections = [];
  
  export function createMemoryRepositories() {
    return {
      hivesRepository: {
        async findAll({ site_id } = {}) {
          if (site_id) {
            return memoryHives.filter((hive) => hive.site_id === site_id);
          }
          return memoryHives;
        },
        async findById(id) {
          return memoryHives.find((hive) => hive.id === id) ?? null;
        },
      },
      measuresRepository: {
        async add(measure) {
          memoryMeasures.push(measure);
          return measure;
        },
        async findByHive(hiveId, { limit = 50, offset = 0 } = {}) {
          const filtered = memoryMeasures
            .filter((item) => item.hive_id === hiveId)
            .slice()
            .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
          return filtered.slice(offset, offset + limit);
        },
      },
      inspectionsRepository: {
        async add(inspection) {
          memoryInspections.push(inspection);
          return inspection;
        },
        async findByHive(hiveId) {
          return memoryInspections.filter((item) => item.hive_id === hiveId);
        },
      },
    };
  }