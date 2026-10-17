import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import type { TestContext } from "node:test";
import request from "supertest";
import app from "../app.js";
import { prisma } from "../lib/prisma.js";
import type { FlowContext } from "./context.js";
import { runAuthTests } from "./auth.test.js";

describe("api flow", () => {
  const ctx: FlowContext = {
    email: `flowtest${Date.now()}@example.com`,
    password: "Testpass1!",
    token: "",
    userId: "",
    workspaceId: "",
    projectId: "",
  };

  after(async () => {
    if (ctx.workspaceId) {
      await prisma.workspace.delete({ where: { id: ctx.workspaceId } }).catch(() => undefined);
    }
    if (ctx.userId) {
      await prisma.user.delete({ where: { id: ctx.userId } }).catch(() => undefined);
    }
    await prisma.$disconnect();
  });

  it("runs health, auth, workspace, project, and task routes", async (t: TestContext) => {
    await runHealthTests(t);
    await runAuthTests(t, ctx);
  });
});

async function runHealthTests(t: TestContext) {
  await t.test("reports that the api and database are up", async () => {
    const health = await request(app).get("/api/v1/health");
    assert.equal(health.status, 200);
    assert.equal(health.body.status, "ok");
    assert.equal(health.body.database, "up");
    assert.equal(typeof health.body.uptime, "number");
  });
}
