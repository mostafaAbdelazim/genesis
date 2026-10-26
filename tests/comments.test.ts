import { it } from "@jest/globals";
import { expect } from "expect";
import request from "supertest";
import app from "../src/app.js";
import { assertValidationError } from "./assertValidationError.js";
import type { FlowContext } from "./context.js";

function commentsBase(ctx: FlowContext) {
  return `/api/v1/workspaces/${ctx.workspaceId}/projects/${ctx.projectId}/tasks/${ctx.taskId}/comments`;
}

export function registerCommentTests(ctx: FlowContext) {
  let commentId = "";

  it("rejects a comment request without a token", async () => {
    const unauthenticated = await request(app).post(commentsBase(ctx)).send({ content: "Looks good" });
    expect(unauthenticated.status).toBe(401);
  });

  it("requires comment content", async () => {
    const invalid = await request(app)
      .post(commentsBase(ctx))
      .set("Authorization", `Bearer ${ctx.token}`)
      .send({ content: "" });
    assertValidationError(invalid, "Content is required");
  });

  it("creates a comment", async () => {
    const created = await request(app)
      .post(commentsBase(ctx))
      .set("Authorization", `Bearer ${ctx.token}`)
      .send({ content: "Looks good" });
    expect(created.status).toBe(201);
    expect(created.body.body).toBe("Looks good");
    expect(created.body.taskId).toBe(ctx.taskId);
    expect(created.body.authorId).toBe(ctx.userId);
    commentId = created.body.id;
  });

  it("lists comments", async () => {
    const listed = await request(app)
      .get(commentsBase(ctx))
      .set("Authorization", `Bearer ${ctx.token}`);
    expect(listed.status).toBe(200);
    expect(listed.body.length).toBe(1);
    expect(listed.body[0].id).toBe(commentId);
  });

  it("deletes a comment", async () => {
    const deleted = await request(app)
      .delete(`${commentsBase(ctx)}/${commentId}`)
      .set("Authorization", `Bearer ${ctx.token}`);
    expect(deleted.status).toBe(204);

    const missing = await request(app)
      .delete(`${commentsBase(ctx)}/${commentId}`)
      .set("Authorization", `Bearer ${ctx.token}`);
    expect(missing.status).toBe(404);
    expect(missing.body.error).toBe("Comment not found");

    const empty = await request(app).get(commentsBase(ctx)).set("Authorization", `Bearer ${ctx.token}`);
    expect(empty.status).toBe(200);
    expect(empty.body).toEqual([]);
  });
}
