import assert from "node:assert/strict";
import type { TestContext } from "node:test";
import request from "supertest";
import app from "../app.js";
import type { FlowContext } from "./context.js";

export async function runTaskTests(t: TestContext, ctx: FlowContext) {
  const base = `/api/v1/workspaces/${ctx.workspaceId}/projects/${ctx.projectId}/tasks`;
  let taskId = "";

  await t.test("creates a task", async () => {
    const created = await request(app)
      .post(base)
      .set("Authorization", `Bearer ${ctx.token}`)
      .send({ title: "Write spec", description: "First task", assigneeId: ctx.userId });
    assert.equal(created.status, 201);
    assert.equal(created.body.title, "Write spec");
    assert.equal(created.body.status, "TODO");
    assert.equal(created.body.priority, "MEDIUM");
    taskId = created.body.id;
  });

  await t.test("lists tasks", async () => {
    const listed = await request(app).get(base).set("Authorization", `Bearer ${ctx.token}`);
    assert.equal(listed.status, 200);
    assert.equal(listed.body.length, 1);
    assert.equal(listed.body[0].id, taskId);
  });

  await t.test("gets a task", async () => {
    const fetched = await request(app)
      .get(`${base}/${taskId}`)
      .set("Authorization", `Bearer ${ctx.token}`);
    assert.equal(fetched.status, 200);
    assert.equal(fetched.body.id, taskId);
  });

  await t.test("updates a task", async () => {
    const updated = await request(app)
      .put(`${base}/${taskId}`)
      .set("Authorization", `Bearer ${ctx.token}`)
      .send({
        title: "Write spec",
        description: "Updated",
        status: "IN_PROGRESS",
        priority: "HIGH",
      });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.description, "Updated");
    assert.equal(updated.body.status, "IN_PROGRESS");
    assert.equal(updated.body.priority, "HIGH");
  });

  await t.test("deletes a task", async () => {
    const deleted = await request(app)
      .delete(`${base}/${taskId}`)
      .set("Authorization", `Bearer ${ctx.token}`);
    assert.equal(deleted.status, 204);

    const missing = await request(app)
      .get(`${base}/${taskId}`)
      .set("Authorization", `Bearer ${ctx.token}`);
    assert.equal(missing.status, 404);
    assert.equal(missing.body.error, "Task not found");

    const empty = await request(app).get(base).set("Authorization", `Bearer ${ctx.token}`);
    assert.equal(empty.status, 200);
    assert.deepEqual(empty.body, []);
  });
}
