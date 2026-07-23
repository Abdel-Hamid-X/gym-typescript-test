import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/utils/prisma.js";

const app = createApp();

describe("Authentication & Authorization API", () => {
  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = "SecurePassword123!";
  let sessionCookie: string;

  beforeAll(async () => {
    // Clean up any previous test user with exact same email just in case
    await prisma.user.deleteMany({
      where: { email: testEmail },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: testEmail },
    });
    await prisma.$disconnect();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new member successfully and set session cookie", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test Member",
          email: testEmail,
          password: testPassword,
        });

      expect(response.status).toBe(201);
      expect(response.body.data.user).toHaveProperty("email", testEmail);
      expect(response.body.data.user).toHaveProperty("role", "MEMBER");
      expect(response.body.data.user).not.toHaveProperty("passwordHash");
      expect(response.body.data).toHaveProperty("token");

      const cookies = response.headers["set-cookie"];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain("evogym_session=");
      sessionCookie = cookies[0];
    });

    it("should reject duplicate email registration with 409", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Another Member",
          email: testEmail,
          password: testPassword,
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toContain("already exists");
    });

    it("should reject registration with weak password or invalid email with 400", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "T",
          email: "invalid-email",
          password: "123",
        });

      expect(response.status).toBe(400);
      expect(response.body.details).toBeDefined();
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login successfully with valid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: testEmail,
          password: testPassword,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.user).toHaveProperty("email", testEmail);
      expect(response.body.data).toHaveProperty("token");
    });

    it("should fail login with incorrect password with 401", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: testEmail,
          password: "WrongPassword123!",
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain("Invalid email or password");
    });
  });

  describe("GET /api/auth/me", () => {
    it("should retrieve current user profile when authenticated via cookie", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Cookie", sessionCookie);

      expect(response.status).toBe(200);
      expect(response.body.data.user).toHaveProperty("email", testEmail);
    });

    it("should retrieve current user profile when authenticated via Bearer token", async () => {
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({
          email: testEmail,
          password: testPassword,
        });
      const token = loginRes.body.data.token;

      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.user).toHaveProperty("email", testEmail);
    });

    it("should return 401 when unauthenticated", async () => {
      const response = await request(app).get("/api/auth/me");
      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should logout cleanly and invalidate session", async () => {
      const response = await request(app)
        .post("/api/auth/logout")
        .set("Cookie", sessionCookie);

      expect(response.status).toBe(200);

      // Verify that after logout, using the old cookie on /me returns 401
      const meRes = await request(app)
        .get("/api/auth/me")
        .set("Cookie", sessionCookie);

      expect(meRes.status).toBe(401);
    });
  });
});
