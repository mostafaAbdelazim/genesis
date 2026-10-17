import assert from "node:assert/strict";
import type { TestContext } from "node:test";
import request from "supertest";
import app from "../app.js";
import type { FlowContext } from "./context.js";
import { runWorkspaceTests } from "./workspaces.test.js";

export async function runAuthTests(t: TestContext, ctx: FlowContext) {
  await t.test("rejects an empty registration", async () => {
    const invalid = await request(app).post("/api/v1/auth/register").send({
      email: "",
      password: ctx.password,
      name: "Auth Tester",
    });
    assert.equal(invalid.status, 400);
  });

  await t.test("registers a user", async () => {
    const registered = await request(app).post("/api/v1/auth/register").send({
      email: ctx.email,
      password: ctx.password,
      name: "Auth Tester",
    });
    assert.equal(registered.status, 201);
    assert.equal(typeof registered.body.accessToken, "string");
    assert.equal(typeof registered.body.refreshToken, "string");
    assert.equal(registered.body.user.email, ctx.email);
    ctx.token = registered.body.accessToken;
    ctx.userId = registered.body.user.id;
  });

  await t.test("rejects a duplicate email", async () => {
    const duplicate = await request(app).post("/api/v1/auth/register").send({
      email: ctx.email,
      password: ctx.password,
      name: "Auth Tester",
    });
    assert.equal(duplicate.status, 409);
    assert.equal(duplicate.body.error, "Email already in use");
  });

  await t.test("logs in", async () => {
    const invalid = await request(app).post("/api/v1/auth/login").send({
      email: ctx.email,
      password: "Wrongpass1!",
    });
    assert.equal(invalid.status, 401);

    const loggedIn = await request(app).post("/api/v1/auth/login").send({
      email: ctx.email,
      password: ctx.password,
    });
    assert.equal(loggedIn.status, 200);
    assert.equal(loggedIn.body.user.id, ctx.userId);
    ctx.token = loggedIn.body.accessToken;
  });

  await t.test("returns the current user", async () => {
    const missing = await request(app).get("/api/v1/auth/me");
    assert.equal(missing.status, 401);

    const me = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${ctx.token}`);
    assert.equal(me.status, 200);
    assert.equal(me.body.id, ctx.userId);
    assert.equal(me.body.email, ctx.email);
    assert.equal(me.body.passwordHash, undefined);
  });

  await runWorkspaceTests(t, ctx);
}
