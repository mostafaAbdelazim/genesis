import { it } from "@jest/globals";
import { expect } from "expect";
import request from "supertest";
import app from "../src/app.js";
import { assertValidationError } from "./assertValidationError.js";
import type { FlowContext } from "./context.js";
import { registerProjectTests } from "./projects.test.js";

export function registerWorkspaceTests(ctx: FlowContext) {
  const slug = `workspace-${Date.now()}`;

  it("rejects a workspace request without a token", async () => {
    const unauthenticated = await request(app)
      .post("/api/v1/workspaces")
      .send({ name: "Orbit", slug });
    expect(unauthenticated.status).toBe(401);
  });

  it("rejects an empty workspace name", async () => {
    const invalid = await request(app)
      .post("/api/v1/workspaces")
      .set("Authorization", `Bearer ${ctx.token}`)
      .send({ name: "", slug });
    assertValidationError(invalid, "Name must be at least 3 characters long");
  });

  it("rejects a slug with invalid characters", async () => {
    const invalid = await request(app)
      .post("/api/v1/workspaces")
      .set("Authorization", `Bearer ${ctx.token}`)
      .send({ name: "Orbit", slug: "Orbit_Board" });
    assertValidationError(
      invalid,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    );
  });

  it("rejects a workspace id that is not a cuid", async () => {
    const invalid = await request(app)
      .get("/api/v1/workspaces/not-a-cuid")
      .set("Authorization", `Bearer ${ctx.token}`);
    assertValidationError(invalid, "Invalid cuid");
  });

  it("creates and reads a workspace", async () => {
    const created = await request(app)
      .post("/api/v1/workspaces")
      .set("Authorization", `Bearer ${ctx.token}`)
      .send({ name: "Orbit", slug });
    expect(created.status).toBe(201);
    expect(created.body.workspace.name).toBe("Orbit");
    expect(created.body.workspace.slug).toBe(slug);
    ctx.workspaceId = created.body.workspace.id;

    const duplicate = await request(app)
      .post("/api/v1/workspaces")
      .set("Authorization", `Bearer ${ctx.token}`)
      .send({ name: "Orbit again", slug });
    expect(duplicate.status).toBe(500);

    const fetched = await request(app)
      .get(`/api/v1/workspaces/${ctx.workspaceId}`)
      .set("Authorization", `Bearer ${ctx.token}`);
    expect(fetched.status).toBe(200);
    expect(fetched.body.id).toBe(ctx.workspaceId);
  });

  registerProjectTests(ctx);

  it("deletes the workspace", async () => {
    const deleted = await request(app)
      .delete(`/api/v1/workspaces/${ctx.workspaceId}`)
      .set("Authorization", `Bearer ${ctx.token}`);
    expect(deleted.status).toBe(200);
    expect(deleted.body.message).toBe("Workspace deleted successfully");

    const missing = await request(app)
      .get(`/api/v1/workspaces/${ctx.workspaceId}`)
      .set("Authorization", `Bearer ${ctx.token}`);
    expect(missing.status).toBe(404);
    expect(missing.body.error).toBe("Workspace not found");
    ctx.workspaceId = "";
  });
}
