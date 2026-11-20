export function createMeasuresRepository(pool) {
    return {
      async add(measure) {
        const { rows } = await pool.query(
          `INSERT INTO measures (
             hive_id,
             measured_at,
             weight_kg,
             temp_internal_c,
             temp_external_c,
             humidity_pct,
             acoustic_activity_score,
             battery_pct,
             lat,
             lon
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           RETURNING
             hive_id,
             measured_at AS timestamp,
             weight_kg,
             temp_internal_c,
             temp_external_c,
             humidity_pct,
             acoustic_activity_score,
             battery_pct,
             lat AS position_lat,
             lon AS position_lon`,
          [
            measure.hive_id,
            measure.timestamp,
            measure.weight_kg,
            measure.temp_internal_c ?? null,
            measure.temp_external_c ?? null,
            measure.humidity_pct ?? null,
            measure.acoustic_activity_score ?? null,
            measure.battery_pct ?? null,
            measure.position_lat ?? null,
            measure.position_lon ?? null,
          ]
        );
  
        return {
          ...rows[0],
          site_id: measure.site_id,
        };
      },
  
      async findByHive(hiveId, { limit = 50, offset = 0 } = {}) {
        const { rows } = await pool.query(
          `SELECT
             m.hive_id,
             h.site_id,
             m.measured_at AS timestamp,
             m.weight_kg,
             m.temp_internal_c,
             m.temp_external_c,
             m.humidity_pct,
             m.acoustic_activity_score,
             m.battery_pct,
             m.lat AS position_lat,
             m.lon AS position_lon
           FROM measures m
           JOIN hives h ON h.id = m.hive_id
           WHERE m.hive_id = $1
           ORDER BY m.measured_at DESC
           LIMIT $2 OFFSET $3`,
          [hiveId, limit, offset]
        );
        return rows;
      },
    };
  }