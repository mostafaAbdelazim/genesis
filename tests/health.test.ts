import { afterAll, describe, it } from "@jest/globals";
import { expect } from "expect";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import type { FlowContext } from "./context.js";
import { registerAuthTests } from "./auth.test.js";

describe("api flow", () => {
  const ctx: FlowContext = {
    email: `flowtest${Date.now()}@example.com`,
    password: "Testpass1!",
    token: "",
    userId: "",
    workspaceId: "",
    projectId: "",
    taskId: "",
  };

  afterAll(async () => {
    if (ctx.workspaceId) {
      await prisma.workspace.delete({ where: { id: ctx.workspaceId } }).catch(() => undefined);
    }
    if (ctx.userId) {
      await prisma.user.delete({ where: { id: ctx.userId } }).catch(() => undefined);
    }
    await prisma.$disconnect();
  });

  it("reports that the api and database are up", async () => {
    const health = await request(app).get("/api/v1/health");
    expect(health.status).toBe(200);
    expect(health.body.status).toBe("ok");
    expect(health.body.database).toBe("up");
    expect(health.body.uptime).toEqual(expect.any(Number));
  });

  registerAuthTests(ctx);
});
