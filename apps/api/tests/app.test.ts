import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

describe("QueueMate API", () => {
  it("returns the standard not-found contract", async () => {
    const response = await request(createApp()).get("/api/v1/does-not-exist");
    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({ success: false, error: { code: "NOT_FOUND" } });
  });
});
