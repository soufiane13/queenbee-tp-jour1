import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import { authenticate, authorize } from "../src/middlewares/auth.js";
import { config } from "../src/config.js";
import { UnauthorizedError, ForbiddenError } from "../src/errors.js";

function runMiddleware(middleware, req = {}) {
  const fullReq = {
    headers: {},
    ...req,
  };
  let nextCalled = false;
  middleware(fullReq, {}, () => {
    nextCalled = true;
  });
  return { req: fullReq, nextCalled };
}

test("authenticate throws UnauthorizedError when Authorization header is missing", () => {
  assert.throws(() => {
    runMiddleware(authenticate, { headers: {} });
  }, UnauthorizedError);
});

test("authenticate throws UnauthorizedError when token is invalid", () => {
  assert.throws(() => {
    runMiddleware(authenticate, {
      headers: { authorization: "Bearer not-a-valid-jwt" },
    });
  }, UnauthorizedError);
});

test("authenticate attaches decoded payload to req.user for valid token", () => {
  const token = jwt.sign({ sub: "user-1", role: "operator" }, config.jwtSecret, {
    expiresIn: "1h",
  });

  const { req, nextCalled } = runMiddleware(authenticate, {
    headers: { authorization: `Bearer ${token}` },
  });

  assert.equal(nextCalled, true);
  assert.equal(req.user.sub, "user-1");
  assert.equal(req.user.role, "operator");
});

test("authorize throws ForbiddenError when role is not allowed", () => {
  const checkAdminOrOperator = authorize("admin", "operator");

  assert.throws(() => {
    runMiddleware(checkAdminOrOperator, {
      user: { sub: "user-2", role: "viewer" },
    });
  }, ForbiddenError);
});

test("authorize calls next() when role is allowed", () => {
  const checkAdminOrOperator = authorize("admin", "operator");

  const { nextCalled } = runMiddleware(checkAdminOrOperator, {
    user: { sub: "user-1", role: "operator" },
  });

  assert.equal(nextCalled, true);
});