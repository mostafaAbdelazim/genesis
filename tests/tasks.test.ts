import { it } from "@jest/globals";
import { expect } from "expect";
import request from "supertest";
import app from "../src/app.js";
import { assertValidationError } from "./assertValidationError.js";
import type { FlowContext } from "./context.js";
import { registerCommentTests } from "./comments.test.js";

function tasksBase(ctx: FlowContext) {
  return `/api/v1/workspaces/${ctx.workspaceId}/projects/${ctx.projectId}/tasks`;
}

export function registerTaskTests(ctx: FlowContext) {
  it("rejects an empty task title", async () => {
    const invalid = await request(app)
      .post(tasksBase(ctx))
      .set("Authorization", `Bearer ${ctx.token}`)
      .send({ title: "" });
    assertValidationError(invalid, "Title is required");
  });

  it("rejects an assignee id that is not a cuid", async () => {
    const invalid = await request(app)
      .post(tasksBase(ctx))
      .set("Authorization", `Bearer ${ctx.token}`)
      .send({ title: "Write spec", assigneeId: "user" });
    assertValidationError(invalid, "Invalid cuid");
  });

  it("creates a task", async () => {
    const created = await request(app)
      .post(tasksBase(ctx))
      .set("Authorization", `Bearer ${ctx.token}`)
      .send({ title: "Write spec", description: "First task", assigneeId: ctx.userId });
    expect(created.status).toBe(201);
    expect(created.body.title).toBe("Write spec");
    expect(created.body.status).toBe("TODO");
    expect(created.body.priority).toBe("MEDIUM");
    ctx.taskId = created.body.id;
  });

  it("lists tasks", async () => {
    const listed = await request(app).get(tasksBase(ctx)).set("Authorization", `Bearer ${ctx.token}`);
    expect(listed.status).toBe(200);
    expect(listed.body.length).toBe(1);
    expect(listed.body[0].id).toBe(ctx.taskId);
  });

  it("gets a task", async () => {
    const fetched = await request(app)
      .get(`${tasksBase(ctx)}/${ctx.taskId}`)
      .set("Authorization", `Bearer ${ctx.token}`);
    expect(fetched.status).toBe(200);
    expect(fetched.body.id).toBe(ctx.taskId);
  });

  it("rejects an unknown task status", async () => {
    const invalid = await request(app)
      .put(`${tasksBase(ctx)}/${ctx.taskId}`)
      .set("Authorization", `Bearer ${ctx.token}`)
      .send({ status: "BLOCKED" });
    assertValidationError(invalid, 'Invalid option: expected one of "TODO"|"IN_PROGRESS"|"DONE"');
  });

  it("updates a task", async () => {
    const updated = await request(app)
      .put(`${tasksBase(ctx)}/${ctx.taskId}`)
      .set("Authorization", `Bearer ${ctx.token}`)
      .send({
        title: "Write spec",
        description: "Updated",
        status: "IN_PROGRESS",
        priority: "HIGH",
      });
    expect(updated.status).toBe(200);
    expect(updated.body.description).toBe("Updated");
    expect(updated.body.status).toBe("IN_PROGRESS");
    expect(updated.body.priority).toBe("HIGH");
  });

  registerCommentTests(ctx);

  it("deletes a task", async () => {
    const deleted = await request(app)
      .delete(`${tasksBase(ctx)}/${ctx.taskId}`)
      .set("Authorization", `Bearer ${ctx.token}`);
    expect(deleted.status).toBe(204);

    const missing = await request(app)
      .get(`${tasksBase(ctx)}/${ctx.taskId}`)
      .set("Authorization", `Bearer ${ctx.token}`);
    expect(missing.status).toBe(404);
    expect(missing.body.error).toBe("Task not found");

    const empty = await request(app).get(tasksBase(ctx)).set("Authorization", `Bearer ${ctx.token}`);
    expect(empty.status).toBe(200);
    expect(empty.body).toEqual([]);
  });
}
