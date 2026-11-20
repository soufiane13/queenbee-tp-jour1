import test from "node:test";
import assert from "node:assert/strict";
import { validate } from "../src/middlewares/validate.js";
import {
  hivesQuerySchema,
  measureSchema,
  paginationSchema,
  inspectionSchema,
} from "../src/validators/schemas.js";
import { ValidationError } from "../src/errors.js";

function runMiddleware(middleware, req = {}) {
  const fullReq = {
    body: {},
    query: {},
    ...req,
  };
  let nextCalled = false;
  middleware(fullReq, {}, () => {
    nextCalled = true;
  });
  return { req: fullReq, nextCalled };
}

test("hivesQuerySchema allows optional site_id", () => {
  const { req, nextCalled } = runMiddleware(
    validate(hivesQuerySchema, "query"),
    { query: { site_id: "SN-CASA" } }
  );
  assert.equal(nextCalled, true);
  assert.deepEqual(req.validated, { site_id: "SN-CASA" });
});

test("paginationSchema applies defaults and rejects invalid limit", () => {
  const valid = runMiddleware(validate(paginationSchema, "query"), { query: {} });
  assert.equal(valid.nextCalled, true);
  assert.deepEqual(valid.req.validated, { limit: 50, offset: 0 });

  assert.throws(() => {
    runMiddleware(validate(paginationSchema, "query"), {
      query: { limit: "abc" },
    });
  }, ValidationError);
});

test("measureSchema rejects out-of-range weight and humidity", () => {
  assert.throws(() => {
    runMiddleware(validate(measureSchema), {
      body: {
        timestamp: "2026-10-31T10:00:00Z",
        weight_kg: 500,
        humidity_pct: 120,
      },
    });
  }, ValidationError);
});

test("inspectionSchema rejects future date and invalid colony_status", () => {
  assert.throws(() => {
    runMiddleware(validate(inspectionSchema), {
      body: {
        id: "550e8400-e29b-41d4-a716-446655440000",
        inspected_at: "2099-01-01T00:00:00Z",
        colony_status: "unknown",
      },
    });
  }, ValidationError);
});