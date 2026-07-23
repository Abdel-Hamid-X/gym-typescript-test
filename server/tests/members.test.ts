import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/utils/prisma.js";
import { createSession } from "../src/utils/session.js";
import argon2 from "argon2";
import { Role, MembershipStatus } from "@prisma/client";

const app = createApp();

describe("Milestone 3: Members & Manual Memberships API", () => {
  const adminEmail = `m3_admin_${Date.now()}@example.com`;
  const memberEmail = `m3_member_${Date.now()}@example.com`;
  let adminToken: string;
  let memberToken: string;
  let adminId: string;
  let memberId: string;
  let planId: string;
  let membershipId: string;

  beforeAll(async () => {
    // Clean up
    await prisma.user.deleteMany({
      where: { email: { in: [adminEmail, memberEmail] } },
    });

    const passwordHash = await argon2.hash("Password123!");

    // Create Admin
    const admin = await prisma.user.create({
      data: { name: "M3 Admin", email: adminEmail, passwordHash, role: Role.ADMIN },
    });
    adminId = admin.id;
    const adminSession = await createSession(admin.id);
    adminToken = adminSession.token;

    // Create Member
    const member = await prisma.user.create({
      data: { name: "M3 Member", email: memberEmail, passwordHash, role: Role.MEMBER },
    });
    memberId = member.id;
    const memberSession = await createSession(member.id);
    memberToken = memberSession.token;

    // Get an active plan
    const plan = await prisma.subscriptionPlan.findFirst({
      where: { active: true },
    });
    if (plan) {
      planId = plan.id;
    } else {
      const createdPlan = await prisma.subscriptionPlan.create({
        data: {
          name: "Test Plan M3",
          price: 1500,
          description: "Test M3 plan description",
          features: ["Access"],
          displayOrder: 1,
        },
      });
      planId = createdPlan.id;
    }
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: [adminEmail, memberEmail] } },
    });
    await prisma.$disconnect();
  });

  describe("GET /api/plans (Public Catalogue)", () => {
    it("should return a list of active plans", async () => {
      const response = await request(app).get("/api/plans");
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data.plans)).toBe(true);
      expect(response.body.data.plans.length).toBeGreaterThanOrEqual(1);
    });

    it("should return details for a specific plan by ID", async () => {
      const response = await request(app).get(`/api/plans/${planId}`);
      expect(response.status).toBe(200);
      expect(response.body.data.plan).toHaveProperty("id", planId);
    });
  });

  describe("Member Profile (/api/users/me)", () => {
    it("should retrieve authenticated member profile and null activeMembership initially", async () => {
      const response = await request(app)
        .get("/api/users/me")
        .set("Authorization", `Bearer ${memberToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.user).toHaveProperty("email", memberEmail);
      expect(response.body.data.activeMembership).toBeNull();
    });

    it("should allow member to update profile fields (name, goals)", async () => {
      const response = await request(app)
        .patch("/api/users/me")
        .set("Authorization", `Bearer ${memberToken}`)
        .send({
          name: "Updated M3 Member",
          personalGoals: "Hypertrophy and mobility",
        });

      expect(response.status).toBe(200);
      expect(response.body.data.user).toHaveProperty("name", "Updated M3 Member");
      expect(response.body.data.user).toHaveProperty("personalGoals", "Hypertrophy and mobility");
    });
  });

  describe("Admin User Management & Manual Memberships (/api/admin/users)", () => {
    it("should reject non-admin users from accessing admin endpoints with 403", async () => {
      const response = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${memberToken}`);

      expect(response.status).toBe(403);
    });

    it("should allow admin to list and search users", async () => {
      const response = await request(app)
        .get(`/api/admin/users?search=m3_member`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.users.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data.users[0]).toHaveProperty("email", memberEmail);
    });

    it("should allow admin to manually assign a membership to a user", async () => {
      const startsAt = new Date().toISOString();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const response = await request(app)
        .post(`/api/admin/users/${memberId}/memberships`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          planId,
          startsAt,
          expiresAt,
          notes: "Assigned during M3 test",
        });

      expect(response.status).toBe(201);
      expect(response.body.data.membership).toHaveProperty("memberId", memberId);
      expect(response.body.data.membership).toHaveProperty("planId", planId);
      expect(response.body.data.membership).toHaveProperty("computedStatus", MembershipStatus.ACTIVE);
      membershipId = response.body.data.membership.id;
    });

    it("should reflect activeMembership dynamically on member profile fetch", async () => {
      const response = await request(app)
        .get("/api/users/me")
        .set("Authorization", `Bearer ${memberToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.activeMembership).not.toBeNull();
      expect(response.body.data.activeMembership).toHaveProperty("planId", planId);
    });

    it("should allow admin to extend membership expiration", async () => {
      const newExpiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();
      const response = await request(app)
        .post(`/api/admin/memberships/${membershipId}/extend`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          expiresAt: newExpiresAt,
          notes: "Extended by 30 more days",
        });

      expect(response.status).toBe(200);
      expect(response.body.data.membership).toHaveProperty("notes", "Extended by 30 more days");
    });

    it("should allow admin to cancel a membership", async () => {
      const response = await request(app)
        .post(`/api/admin/memberships/${membershipId}/cancel`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.membership).toHaveProperty("computedStatus", MembershipStatus.CANCELLED);
    });

    it("should allow admin to deactivate a user and terminate their active sessions", async () => {
      const response = await request(app)
        .post(`/api/admin/users/${memberId}/deactivate`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.user).toHaveProperty("active", false);

      // Verify member token no longer works
      const meRes = await request(app)
        .get("/api/users/me")
        .set("Authorization", `Bearer ${memberToken}`);
      expect(meRes.status).toBe(401);
    });
  });
});
