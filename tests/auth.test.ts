import { it } from "@jest/globals";
import { expect } from "expect";
import request from "supertest";
import app from "../src/app.js";
import { assertValidationError } from "./assertValidationError.js";
import type { FlowContext } from "./context.js";
import { registerWorkspaceTests } from "./workspaces.test.js";

export function registerAuthTests(ctx: FlowContext) {
  it("rejects an empty registration", async () => {
    const invalid = await request(app).post("/api/v1/auth/register").send({
      email: "",
      password: ctx.password,
      name: "Auth Tester",
    });
    assertValidationError(invalid, "Invalid email address");
  });

  it("rejects a short password", async () => {
    const invalid = await request(app).post("/api/v1/auth/register").send({
      email: ctx.email,
      password: "Aa1!",
      name: "Auth Tester",
    });
    assertValidationError(invalid, "Password must be at least 8 characters long");
  });

  it("registers a user", async () => {
    const registered = await request(app).post("/api/v1/auth/register").send({
      email: ctx.email,
      password: ctx.password,
      name: "Auth Tester",
    });
    expect(registered.status).toBe(201);
    expect(registered.body.accessToken).toEqual(expect.any(String));
    expect(registered.body.refreshToken).toEqual(expect.any(String));
    expect(registered.body.user.email).toBe(ctx.email);
    ctx.token = registered.body.accessToken;
    ctx.userId = registered.body.user.id;
  });

  it("rejects a duplicate email", async () => {
    const duplicate = await request(app).post("/api/v1/auth/register").send({
      email: ctx.email,
      password: ctx.password,
      name: "Auth Tester",
    });
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error).toBe("Email already in use");
  });

  it("rejects a login password with an invalid character", async () => {
    const invalid = await request(app).post("/api/v1/auth/login").send({
      email: ctx.email,
      password: "Wrong pass1!",
    });
    assertValidationError(invalid, "Password contains an invalid character");
  });

  it("logs in", async () => {
    const invalid = await request(app).post("/api/v1/auth/login").send({
      email: ctx.email,
      password: "Wrongpass1!",
    });
    expect(invalid.status).toBe(401);

    const loggedIn = await request(app).post("/api/v1/auth/login").send({
      email: ctx.email,
      password: ctx.password,
    });
    expect(loggedIn.status).toBe(200);
    expect(loggedIn.body.user.id).toBe(ctx.userId);
    ctx.token = loggedIn.body.accessToken;
  });

  it("returns the current user", async () => {
    const missing = await request(app).get("/api/v1/auth/me");
    expect(missing.status).toBe(401);

    const me = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${ctx.token}`);
    expect(me.status).toBe(200);
    expect(me.body.id).toBe(ctx.userId);
    expect(me.body.email).toBe(ctx.email);
    expect(me.body.passwordHash).toBe(undefined);
  });

  registerWorkspaceTests(ctx);
}
