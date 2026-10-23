import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ZodType } from "zod";
import { loginBodySchema, refreshBodySchema, registerBodySchema } from "../schemas/auth.schemas.js";
import { commentParamsSchema, createCommentBodySchema } from "../schemas/comments.schemas.js";
import { createProjectBodySchema, projectParamsSchema } from "../schemas/project.schemas.js";
import { createTaskBodySchema, taskParamsSchema, updateTaskBodySchema } from "../schemas/task.schemas.js";
import { createWorkspaceBodySchema, workspaceParamsSchema } from "../schemas/workspace.schemas.js";

const cuid = "cmvfef2m50005xjnk9sgs0wwx";

function messages(schema: ZodType, value: unknown): string[] {
  const result = schema.safeParse(value);
  assert.equal(result.success, false);
  if (result.success) {
    return [];
  }
  return result.error.issues.map((issue) => issue.message);
}

describe("auth schemas", () => {
  const user = {
    email: "ada@example.com",
    password: "Testpass1!",
    name: "Ada",
  };

  it("accepts a valid registration", () => {
    assert.equal(registerBodySchema.safeParse(user).success, true);
  });

  it("rejects a short name and a weak password", () => {
    const errors = messages(registerBodySchema, { ...user, name: "Ad", password: "testpass" });
    assert.ok(errors.includes("Password must contain an uppercase letter"));
    assert.ok(errors.includes("Password must contain a number"));
    assert.ok(errors.includes("Password must contain a special character"));
  });

  it("rejects a password that is too short, too long, or has an invalid character", () => {
    assert.ok(
      messages(registerBodySchema, { ...user, password: "Aa1!" }).includes(
        "Password must be at least 8 characters long",
      ),
    );
    assert.ok(
      messages(registerBodySchema, { ...user, password: `Aa1!${"a".repeat(97)}` }).includes(
        "Password must be less than 100 characters long",
      ),
    );
    assert.ok(
      messages(registerBodySchema, { ...user, password: "Test pass1!" }).includes(
        "Password contains an invalid character",
      ),
    );
  });

  it("rejects an invalid email", () => {
    assert.equal(registerBodySchema.safeParse({ ...user, email: "ada" }).success, false);
  });

  it("accepts a login password that only has to match the allowed characters", () => {
    assert.equal(
      loginBodySchema.safeParse({ email: user.email, password: "abcdefgh" }).success,
      true,
    );
  });

  it("rejects a login password with an invalid character", () => {
    assert.ok(
      messages(loginBodySchema, { email: user.email, password: "abcd efgh" }).includes(
        "Password contains an invalid character",
      ),
    );
  });

  it("requires a refresh token", () => {
    assert.equal(refreshBodySchema.safeParse({ refreshToken: "token" }).success, true);
    assert.ok(
      messages(refreshBodySchema, { refreshToken: "" }).includes("Refresh token is required"),
    );
  });
});

describe("workspace schemas", () => {
  it("accepts a workspace id and body", () => {
    assert.equal(workspaceParamsSchema.safeParse({ workspaceId: cuid }).success, true);
    assert.equal(
      createWorkspaceBodySchema.safeParse({ name: "Orbit", slug: "orbit-board" }).success,
      true,
    );
  });

  it("rejects a workspace id that is not a cuid", () => {
    assert.equal(workspaceParamsSchema.safeParse({ workspaceId: "" }).success, false);
    assert.equal(workspaceParamsSchema.safeParse({ workspaceId: "not-a-cuid" }).success, false);
  });

  it("rejects a short name and a slug with invalid characters", () => {
    const errors = messages(createWorkspaceBodySchema, { name: "Or", slug: "Orbit_Board" });
    assert.ok(errors.includes("Name must be at least 3 characters long"));
    assert.ok(
      errors.includes("Slug must contain only lowercase letters, numbers, and hyphens"),
    );
  });
});

describe("project schemas", () => {
  it("accepts a project id and body", () => {
    assert.equal(projectParamsSchema.safeParse({ projectId: cuid }).success, true);
    assert.equal(createProjectBodySchema.safeParse({ name: "Board" }).success, true);
    assert.equal(
      createProjectBodySchema.safeParse({ name: "Board", description: "First project" }).success,
      true,
    );
  });

  it("rejects a short project name", () => {
    assert.ok(
      messages(createProjectBodySchema, { name: "Bo" }).includes(
        "Name must be at least 3 characters long",
      ),
    );
  });
});

describe("task schemas", () => {
  it("accepts a task id and a create body", () => {
    assert.equal(taskParamsSchema.safeParse({ taskId: cuid }).success, true);
    assert.equal(createTaskBodySchema.safeParse({ title: "Write spec" }).success, true);
    assert.equal(
      createTaskBodySchema.safeParse({
        title: "Write spec",
        description: "First task",
        assigneeId: cuid,
      }).success,
      true,
    );
  });

  it("requires a title and a cuid assignee", () => {
    assert.ok(messages(createTaskBodySchema, { title: "" }).includes("Title is required"));
    assert.equal(createTaskBodySchema.safeParse({ title: "Write spec", assigneeId: "user" }).success, false);
  });

  it("accepts a partial update and rejects an unknown status", () => {
    assert.equal(updateTaskBodySchema.safeParse({}).success, true);
    assert.equal(
      updateTaskBodySchema.safeParse({ status: "IN_PROGRESS", priority: "HIGH" }).success,
      true,
    );
    assert.equal(updateTaskBodySchema.safeParse({ status: "BLOCKED" }).success, false);
  });
});

describe("comment schemas", () => {
  it("accepts a comment id and body", () => {
    assert.equal(commentParamsSchema.safeParse({ commentId: cuid }).success, true);
    assert.equal(createCommentBodySchema.safeParse({ content: "Looks good" }).success, true);
  });

  it("requires comment content", () => {
    assert.ok(messages(createCommentBodySchema, { content: "" }).includes("Content is required"));
  });
});
