import assert from "node:assert/strict";
import type { TestContext } from "node:test";
import request from "supertest";
import app from "../app.js";
import { assertValidationError } from "./assertValidationError.js";
import type { FlowContext } from "./context.js";

export async function runCommentTests(t: TestContext, ctx: FlowContext) {
  const base = `/api/v1/workspaces/${ctx.workspaceId}/projects/${ctx.projectId}/tasks/${ctx.taskId}/comments`;
  let commentId = "";

  await t.test("rejects a comment request without a token", async () => {
    const unauthenticated = await request(app).post(base).send({ content: "Looks good" });
    assert.equal(unauthenticated.status, 401);
  });

  await t.test("requires comment content", async () => {
    const invalid = await request(app)
      .post(base)
      .set("Authorization", `Bearer ${ctx.token}`)
      .send({ content: "" });
    assertValidationError(invalid, "Content is required");
  });

  await t.test("creates a comment", async () => {
    const created = await request(app)
      .post(base)
      .set("Authorization", `Bearer ${ctx.token}`)
      .send({ content: "Looks good" });
    assert.equal(created.status, 201);
    assert.equal(created.body.body, "Looks good");
    assert.equal(created.body.taskId, ctx.taskId);
    assert.equal(created.body.authorId, ctx.userId);
    commentId = created.body.id;
  });

  await t.test("lists comments", async () => {
    const listed = await request(app).get(base).set("Authorization", `Bearer ${ctx.token}`);
    assert.equal(listed.status, 200);
    assert.equal(listed.body.length, 1);
    assert.equal(listed.body[0].id, commentId);
  });

  await t.test("deletes a comment", async () => {
    const deleted = await request(app)
      .delete(`${base}/${commentId}`)
      .set("Authorization", `Bearer ${ctx.token}`);
    assert.equal(deleted.status, 204);

    const missing = await request(app)
      .delete(`${base}/${commentId}`)
      .set("Authorization", `Bearer ${ctx.token}`);
    assert.equal(missing.status, 404);
    assert.equal(missing.body.error, "Comment not found");

    const empty = await request(app).get(base).set("Authorization", `Bearer ${ctx.token}`);
    assert.equal(empty.status, 200);
    assert.deepEqual(empty.body, []);
  });
}
