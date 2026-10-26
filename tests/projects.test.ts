import { it } from "@jest/globals";
import { expect } from "expect";
import request from "supertest";
import app from "../src/app.js";
import { assertValidationError } from "./assertValidationError.js";
import type { FlowContext } from "./context.js";
import { registerTaskTests } from "./tasks.test.js";

function projectsBase(ctx: FlowContext) {
  return `/api/v1/workspaces/${ctx.workspaceId}/projects`;
}

export function registerProjectTests(ctx: FlowContext) {
  it("rejects a project request without a token", async () => {
    const unauthenticated = await request(app).post(projectsBase(ctx)).send({ name: "Board" });
    expect(unauthenticated.status).toBe(401);
  });

  it("requires a project name", async () => {
    const invalid = await request(app)
      .post(projectsBase(ctx))
      .set("Authorization", `Bearer ${ctx.token}`)
      .send({ description: "missing name" });
    assertValidationError(invalid, "Invalid input: expected string, received undefined");
  });

  it("rejects a short project name", async () => {
    const invalid = await request(app)
      .post(projectsBase(ctx))
      .set("Authorization", `Bearer ${ctx.token}`)
      .send({ name: "Bo" });
    assertValidationError(invalid, "Name must be at least 3 characters long");
  });

  it("creates, lists, and reads a project", async () => {
    const created = await request(app)
      .post(projectsBase(ctx))
      .set("Authorization", `Bearer ${ctx.token}`)
      .send({ name: "Board", description: "First project" });
    expect(created.status).toBe(201);
    expect(created.body.name).toBe("Board");
    expect(created.body.workspaceId).toBe(ctx.workspaceId);
    ctx.projectId = created.body.id;

    const listed = await request(app)
      .get(projectsBase(ctx))
      .set("Authorization", `Bearer ${ctx.token}`);
    expect(listed.status).toBe(200);
    expect(listed.body.length).toBe(1);
    expect(listed.body[0].id).toBe(ctx.projectId);

    const fetched = await request(app)
      .get(`${projectsBase(ctx)}/${ctx.projectId}`)
      .set("Authorization", `Bearer ${ctx.token}`);
    expect(fetched.status).toBe(200);
    expect(fetched.body.id).toBe(ctx.projectId);
  });

  registerTaskTests(ctx);

  it("deletes the project", async () => {
    const deleted = await request(app)
      .delete(`${projectsBase(ctx)}/${ctx.projectId}`)
      .set("Authorization", `Bearer ${ctx.token}`);
    expect(deleted.status).toBe(200);
    expect(deleted.body.message).toBe("Project deleted successfully");

    const missing = await request(app)
      .get(`${projectsBase(ctx)}/${ctx.projectId}`)
      .set("Authorization", `Bearer ${ctx.token}`);
    expect(missing.status).toBe(404);
    expect(missing.body.error).toBe("Project not found");
  });
}
