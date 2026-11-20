import test from "node:test";
import assert from "node:assert/strict";
import { addHiveMeasure } from "../src/services/hiveService.js";
import { ValidationError } from "../src/errors.js";

test("addHiveMeasure throws ValidationError when payload hive_id mismatches URL hiveId", () => {
  assert.throws(() => {
    addHiveMeasure("SN-CASA-001", {
      hive_id: "SN-CASA-002",
      timestamp: "2026-10-31T10:00:00Z",
      weight_kg: 35.5,
    });
  }, ValidationError);
});