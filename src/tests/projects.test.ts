import assert from "node:assert/strict";
import type { TestContext } from "node:test";
import request from "supertest";
import app from "../app.js";
import { assertValidationError } from "./assertValidationError.js";
import type { FlowContext } from "./context.js";
import { runTaskTests } from "./tasks.test.js";

export async function runProjectTests(t: TestContext, ctx: FlowContext) {
  const base = `/api/v1/workspaces/${ctx.workspaceId}/projects`;

  await t.test("rejects a project request without a token", async () => {
    const unauthenticated = await request(app).post(base).send({ name: "Board" });
    assert.equal(unauthenticated.status, 401);
  });

  await t.test("requires a project name", async () => {
    const invalid = await request(app)
      .post(base)
      .set("Authorization", `Bearer ${ctx.token}`)
      .send({ description: "missing name" });
    assertValidationError(invalid, "Invalid input: expected string, received undefined");
  });

  await t.test("rejects a short project name", async () => {
    const invalid = await request(app)
      .post(base)
      .set("Authorization", `Bearer ${ctx.token}`)
      .send({ name: "Bo" });
    assertValidationError(invalid, "Name must be at least 3 characters long");
  });

  await t.test("creates, lists, reads, and deletes a project", async () => {
    const created = await request(app)
      .post(base)
      .set("Authorization", `Bearer ${ctx.token}`)
      .send({ name: "Board", description: "First project" });
    assert.equal(created.status, 201);
    assert.equal(created.body.name, "Board");
    assert.equal(created.body.workspaceId, ctx.workspaceId);
    ctx.projectId = created.body.id;

    const listed = await request(app).get(base).set("Authorization", `Bearer ${ctx.token}`);
    assert.equal(listed.status, 200);
    assert.equal(listed.body.length, 1);
    assert.equal(listed.body[0].id, ctx.projectId);

    const fetched = await request(app)
      .get(`${base}/${ctx.projectId}`)
      .set("Authorization", `Bearer ${ctx.token}`);
    assert.equal(fetched.status, 200);
    assert.equal(fetched.body.id, ctx.projectId);
  });

  await runTaskTests(t, ctx);

  await t.test("deletes the project", async () => {
    const deleted = await request(app)
      .delete(`${base}/${ctx.projectId}`)
      .set("Authorization", `Bearer ${ctx.token}`);
    assert.equal(deleted.status, 200);
    assert.equal(deleted.body.message, "Project deleted successfully");

    const missing = await request(app)
      .get(`${base}/${ctx.projectId}`)
      .set("Authorization", `Bearer ${ctx.token}`);
    assert.equal(missing.status, 404);
    assert.equal(missing.body.error, "Project not found");
  });
}
