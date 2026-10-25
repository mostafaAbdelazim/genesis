import assert from "node:assert/strict";
import { describe, it } from "node:test";
import request from "supertest";
import app from "../app.js";
import { env } from "../config/env.js";

const allowedOrigin = env.corsOrigin.split(",")[0].trim();

describe("cors", () => {
  it("allows a configured origin", async () => {
    const response = await request(app).get("/api/v1/health").set("Origin", allowedOrigin);
    assert.equal(response.headers["access-control-allow-origin"], allowedOrigin);
    assert.equal(response.headers["access-control-allow-credentials"], "true");
    assert.notEqual(response.status, 403);
  });

  it("allows a request with no origin", async () => {
    const response = await request(app).get("/api/v1/health");
    assert.notEqual(response.body.error, "Not allowed by CORS");
  });

  it("rejects an origin that is not configured", async () => {
    const response = await request(app).get("/api/v1/health").set("Origin", "https://evil.example");
    assert.equal(response.status, 403);
    assert.equal(response.body.statusCode, 403);
    assert.equal(response.body.error, "Not allowed by CORS");
  });

  it("answers a preflight for a configured origin", async () => {
    const response = await request(app)
      .options("/api/v1/health")
      .set("Origin", allowedOrigin)
      .set("Access-Control-Request-Method", "GET");
    assert.equal(response.status, 204);
    assert.equal(response.headers["access-control-allow-origin"], allowedOrigin);
  });
});

describe("json body limit", () => {
  it("accepts a body under 10kb", async () => {
    const response = await request(app)
      .post("/api/v1/workspaces")
      .send({ name: "Orbit", slug: "orbit" });
    assert.equal(response.status, 401);
  });

  it("rejects a body over 10kb", async () => {
    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "ada@example.com", password: "x".repeat(11 * 1024) });
    assert.equal(response.status, 413);
    assert.equal(response.body.statusCode, 413);
    assert.equal(response.body.error, "Request body is too large");
  });
});

describe("rate limit", () => {
  it("blocks login after 10 attempts", async () => {
    const responses = [];
    for (let attempt = 0; attempt < 11; attempt += 1) {
      responses.push(
        await request(app)
          .post("/api/v1/auth/login")
          .send({ email: "ada@example.com", password: "short" }),
      );
    }

    for (const response of responses.slice(0, 10)) {
      assert.equal(response.status, 400);
    }
    assert.equal(responses[10].status, 429);
    assert.equal(responses[10].body.statusCode, 429);
    assert.equal(responses[10].body.error, "Too many login attempts, please try again later.");
  });

  it("blocks an address after 100 requests", async () => {
    let limited = null;
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const response = await request(app).get("/api/v1/does-not-exist");
      if (response.status === 429) {
        limited = response;
        break;
      }
    }

    assert.ok(limited);
    assert.equal(limited.status, 429);
    assert.equal(limited.body.statusCode, 429);
    assert.equal(limited.body.error, "Too many requests, please try again later.");
  });
});
