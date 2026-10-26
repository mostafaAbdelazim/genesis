import { expect } from "expect";
import { describe, it } from "@jest/globals";
import type { ZodType } from "zod";
import { loginBodySchema, refreshBodySchema, registerBodySchema } from "../src/schemas/auth.schemas.js";
import { commentParamsSchema, createCommentBodySchema } from "../src/schemas/comments.schemas.js";
import { createProjectBodySchema, projectParamsSchema } from "../src/schemas/project.schemas.js";
import { createTaskBodySchema, taskParamsSchema, updateTaskBodySchema } from "../src/schemas/task.schemas.js";
import { createWorkspaceBodySchema, workspaceParamsSchema } from "../src/schemas/workspace.schemas.js";

const cuid = "cmvfef2m50005xjnk9sgs0wwx";

function messages(schema: ZodType, value: unknown): string[] {
  const result = schema.safeParse(value);
  expect(result.success).toBe(false);
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
    expect(registerBodySchema.safeParse(user).success).toBe(true);
  });

  it("rejects a short name and a weak password", () => {
    const errors = messages(registerBodySchema, { ...user, name: "Ad", password: "testpass" });
    expect(errors).toContain("Password must contain an uppercase letter");
    expect(errors).toContain("Password must contain a number");
    expect(errors).toContain("Password must contain a special character");
  });

  it("rejects a password that is too short, too long, or has an invalid character", () => {
    expect(messages(registerBodySchema, { ...user, password: "Aa1!" })).toContain(
      "Password must be at least 8 characters long",
    );
    expect(messages(registerBodySchema, { ...user, password: `Aa1!${"a".repeat(97)}` })).toContain(
      "Password must be less than 100 characters long",
    );
    expect(messages(registerBodySchema, { ...user, password: "Test pass1!" })).toContain(
      "Password contains an invalid character",
    );
  });

  it("rejects an invalid email", () => {
    expect(registerBodySchema.safeParse({ ...user, email: "ada" }).success).toBe(false);
  });

  it("accepts a valid login", () => {
    expect(loginBodySchema.safeParse({ email: user.email, password: user.password }).success).toBe(
      true,
    );
  });

  it("rejects a login password with an invalid character", () => {
    expect(messages(loginBodySchema, { email: user.email, password: "abcd efgh" })).toContain(
      "Password contains an invalid character",
    );
  });

  it("requires a refresh token", () => {
    expect(refreshBodySchema.safeParse({ refreshToken: "token" }).success).toBe(true);
    expect(messages(refreshBodySchema, { refreshToken: "" })).toContain("Refresh token is required");
  });
});

describe("workspace schemas", () => {
  it("accepts a workspace id and body", () => {
    expect(workspaceParamsSchema.safeParse({ workspaceId: cuid }).success).toBe(true);
    expect(createWorkspaceBodySchema.safeParse({ name: "Orbit", slug: "orbit-board" }).success).toBe(
      true,
    );
  });

  it("rejects a workspace id that is not a cuid", () => {
    expect(workspaceParamsSchema.safeParse({ workspaceId: "" }).success).toBe(false);
    expect(workspaceParamsSchema.safeParse({ workspaceId: "not-a-cuid" }).success).toBe(false);
  });

  it("rejects a short name and a slug with invalid characters", () => {
    const errors = messages(createWorkspaceBodySchema, { name: "Or", slug: "Orbit_Board" });
    expect(errors).toContain("Name must be at least 3 characters long");
    expect(errors).toContain("Slug must contain only lowercase letters, numbers, and hyphens");
  });
});

describe("project schemas", () => {
  it("accepts a project id and body", () => {
    expect(projectParamsSchema.safeParse({ projectId: cuid }).success).toBe(true);
    expect(createProjectBodySchema.safeParse({ name: "Board" }).success).toBe(true);
    expect(
      createProjectBodySchema.safeParse({ name: "Board", description: "First project" }).success,
    ).toBe(true);
  });

  it("rejects a short project name", () => {
    expect(messages(createProjectBodySchema, { name: "Bo" })).toContain(
      "Name must be at least 3 characters long",
    );
  });
});

describe("task schemas", () => {
  it("accepts a task id and a create body", () => {
    expect(taskParamsSchema.safeParse({ taskId: cuid }).success).toBe(true);
    expect(createTaskBodySchema.safeParse({ title: "Write spec" }).success).toBe(true);
    expect(
      createTaskBodySchema.safeParse({
        title: "Write spec",
        description: "First task",
        assigneeId: cuid,
      }).success,
    ).toBe(true);
  });

  it("requires a title and a cuid assignee", () => {
    expect(messages(createTaskBodySchema, { title: "" })).toContain("Title is required");
    expect(createTaskBodySchema.safeParse({ title: "Write spec", assigneeId: "user" }).success).toBe(
      false,
    );
  });

  it("accepts a partial update and rejects an unknown status", () => {
    expect(updateTaskBodySchema.safeParse({}).success).toBe(true);
    expect(
      updateTaskBodySchema.safeParse({ status: "IN_PROGRESS", priority: "HIGH" }).success,
    ).toBe(true);
    expect(updateTaskBodySchema.safeParse({ status: "BLOCKED" }).success).toBe(false);
  });
});

describe("comment schemas", () => {
  it("accepts a comment id and body", () => {
    expect(commentParamsSchema.safeParse({ commentId: cuid }).success).toBe(true);
    expect(createCommentBodySchema.safeParse({ content: "Looks good" }).success).toBe(true);
  });

  it("requires comment content", () => {
    expect(messages(createCommentBodySchema, { content: "" })).toContain("Content is required");
  });
});
