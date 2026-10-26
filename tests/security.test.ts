import { expect } from "expect";
import { afterAll, describe, it } from "@jest/globals";
import { prisma } from "../src/lib/prisma.js";
import request from "supertest";
import app from "../src/app.js";
import { env } from "../src/config/env.js";

const allowedOrigin = env.corsOrigin.split(",")[0].trim();

afterAll(async () => {
  await prisma.$disconnect();
});

describe("cors", () => {
  it("allows a configured origin", async () => {
    const response = await request(app).get("/api/v1/health").set("Origin", allowedOrigin);
    expect(response.headers["access-control-allow-origin"]).toBe(allowedOrigin);
    expect(response.headers["access-control-allow-credentials"]).toBe("true");
    expect(response.status).not.toBe(403);
  });

  it("allows a request with no origin", async () => {
    const response = await request(app).get("/api/v1/health");
    expect(response.body.error).not.toBe("Not allowed by CORS");
  });

  it("rejects an origin that is not configured", async () => {
    const response = await request(app).get("/api/v1/health").set("Origin", "https://evil.example");
    expect(response.status).toBe(403);
    expect(response.body.statusCode).toBe(403);
    expect(response.body.error).toBe("Not allowed by CORS");
  });

  it("answers a preflight for a configured origin", async () => {
    const response = await request(app)
      .options("/api/v1/health")
      .set("Origin", allowedOrigin)
      .set("Access-Control-Request-Method", "GET");
    expect(response.status).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBe(allowedOrigin);
  });
});

describe("json body limit", () => {
  it("accepts a body under 10kb", async () => {
    const response = await request(app)
      .post("/api/v1/workspaces")
      .send({ name: "Orbit", slug: "orbit" });
    expect(response.status).toBe(401);
  });

  it("rejects a body over 10kb", async () => {
    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "ada@example.com", password: "x".repeat(11 * 1024) });
    expect(response.status).toBe(413);
    expect(response.body.statusCode).toBe(413);
    expect(response.body.error).toBe("Request body is too large");
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
      expect(response.status).toBe(400);
    }
    expect(responses[10].status).toBe(429);
    expect(responses[10].body.statusCode).toBe(429);
    expect(responses[10].body.error).toBe("Too many login attempts, please try again later.");
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

    expect(limited).not.toBeNull();
    expect(limited?.status).toBe(429);
    expect(limited?.body.statusCode).toBe(429);
    expect(limited?.body.error).toBe("Too many requests, please try again later.");
  });
});
