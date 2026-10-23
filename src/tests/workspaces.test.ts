import assert from "node:assert/strict";
import type { TestContext } from "node:test";
import request from "supertest";
import app from "../app.js";
import { assertValidationError } from "./assertValidationError.js";
import type { FlowContext } from "./context.js";
import { runProjectTests } from "./projects.test.js";

export async function runWorkspaceTests(t: TestContext, ctx: FlowContext) {
  const slug = `workspace-${Date.now()}`;

  await t.test("rejects a workspace request without a token", async () => {
    const unauthenticated = await request(app)
      .post("/api/v1/workspaces")
      .send({ name: "Orbit", slug });
    assert.equal(unauthenticated.status, 401);
  });

  await t.test("rejects an empty workspace name", async () => {
    const invalid = await request(app)
      .post("/api/v1/workspaces")
      .set("Authorization", `Bearer ${ctx.token}`)
      .send({ name: "", slug });
    assertValidationError(invalid, "Name must be at least 3 characters long");
  });

  await t.test("rejects a slug with invalid characters", async () => {
    const invalid = await request(app)
      .post("/api/v1/workspaces")
      .set("Authorization", `Bearer ${ctx.token}`)
      .send({ name: "Orbit", slug: "Orbit_Board" });
    assertValidationError(
      invalid,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    );
  });

  await t.test("rejects a workspace id that is not a cuid", async () => {
    const invalid = await request(app)
      .get("/api/v1/workspaces/not-a-cuid")
      .set("Authorization", `Bearer ${ctx.token}`);
    assertValidationError(invalid, "Invalid cuid");
  });

  await t.test("creates and reads a workspace", async () => {
    const created = await request(app)
      .post("/api/v1/workspaces")
      .set("Authorization", `Bearer ${ctx.token}`)
      .send({ name: "Orbit", slug });
    assert.equal(created.status, 201);
    assert.equal(created.body.workspace.name, "Orbit");
    assert.equal(created.body.workspace.slug, slug);
    ctx.workspaceId = created.body.workspace.id;

    const duplicate = await request(app)
      .post("/api/v1/workspaces")
      .set("Authorization", `Bearer ${ctx.token}`)
      .send({ name: "Orbit again", slug });
    assert.equal(duplicate.status, 500);

    const fetched = await request(app)
      .get(`/api/v1/workspaces/${ctx.workspaceId}`)
      .set("Authorization", `Bearer ${ctx.token}`);
    assert.equal(fetched.status, 200);
    assert.equal(fetched.body.id, ctx.workspaceId);
  });

  await runProjectTests(t, ctx);

  await t.test("deletes the workspace", async () => {
    const deleted = await request(app)
      .delete(`/api/v1/workspaces/${ctx.workspaceId}`)
      .set("Authorization", `Bearer ${ctx.token}`);
    assert.equal(deleted.status, 200);
    assert.equal(deleted.body.message, "Workspace deleted successfully");

    const missing = await request(app)
      .get(`/api/v1/workspaces/${ctx.workspaceId}`)
      .set("Authorization", `Bearer ${ctx.token}`);
    assert.equal(missing.status, 404);
    assert.equal(missing.body.error, "Workspace not found");
    ctx.workspaceId = "";
  });
}
