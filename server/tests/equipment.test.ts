import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/utils/prisma.js";
import { createSession } from "../src/utils/session.js";
import argon2 from "argon2";
import { Role, EquipmentType, EquipmentStatus } from "@prisma/client";
import path from "path";
import fs from "fs";

const app = createApp();

describe("Milestone 4: Equipment & Inventory APIs", () => {
  const adminEmail = `m4_admin_${Date.now()}@example.com`;
  const memberEmail = `m4_member_${Date.now()}@example.com`;
  let adminToken: string;
  let memberToken: string;
  let createdEquipmentId: string;
  let uploadedImageUrl: string;

  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: [adminEmail, memberEmail] } },
    });

    const passwordHash = await argon2.hash("Password123!");

    const admin = await prisma.user.create({
      data: { name: "M4 Admin", email: adminEmail, passwordHash, role: Role.ADMIN },
    });
    const adminSession = await createSession(admin.id);
    adminToken = adminSession.token;

    const member = await prisma.user.create({
      data: { name: "M4 Member", email: memberEmail, passwordHash, role: Role.MEMBER },
    });
    const memberSession = await createSession(member.id);
    memberToken = memberSession.token;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: [adminEmail, memberEmail] } },
    });
    await prisma.$disconnect();
  });

  describe("Public Equipment Directory (/api/equipment)", () => {
    it("should list operational equipment items", async () => {
      const response = await request(app).get("/api/equipment");
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data.equipment)).toBe(true);
    });
  });

  describe("Admin Equipment CRUD (/api/admin/equipment)", () => {
    it("should reject non-admin users with 403", async () => {
      const response = await request(app)
        .post("/api/admin/equipment")
        .set("Authorization", `Bearer ${memberToken}`)
        .send({
          name: "Test Rack",
          type: EquipmentType.Strength,
          quantity: 2,
        });

      expect(response.status).toBe(403);
    });

    it("should allow admin to create new equipment", async () => {
      const response = await request(app)
        .post("/api/admin/equipment")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Pro Squat Rack M4",
          type: EquipmentType.Strength,
          quantity: 4,
          status: EquipmentStatus.Operational,
        });

      expect(response.status).toBe(201);
      expect(response.body.data.equipment).toHaveProperty("name", "Pro Squat Rack M4");
      expect(response.body.data.equipment).toHaveProperty("type", EquipmentType.Strength);
      createdEquipmentId = response.body.data.equipment.id;
    });

    it("should retrieve specific equipment item by ID from public directory", async () => {
      const response = await request(app).get(`/api/equipment/${createdEquipmentId}`);
      expect(response.status).toBe(200);
      expect(response.body.data.equipment).toHaveProperty("id", createdEquipmentId);
    });

    it("should allow admin to update equipment inventory properties", async () => {
      const response = await request(app)
        .patch(`/api/admin/equipment/${createdEquipmentId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          quantity: 6,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.equipment).toHaveProperty("quantity", 6);
    });

    it("should allow admin to quick transition equipment status", async () => {
      const response = await request(app)
        .post(`/api/admin/equipment/${createdEquipmentId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          status: EquipmentStatus.Under_Maintenance,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.equipment).toHaveProperty("status", EquipmentStatus.Under_Maintenance);
    });
  });

  describe("Image Upload Service (/api/admin/uploads)", () => {
    it("should allow admin to upload an image and serve it statically", async () => {
      // Create a small temporary image buffer for upload testing
      const dummyFileContent = Buffer.from("dummy-image-binary-content-for-test");
      const tempFilePath = path.resolve("temp-test-image.jpg");
      fs.writeFileSync(tempFilePath, dummyFileContent);

      try {
        const response = await request(app)
          .post("/api/admin/uploads")
          .set("Authorization", `Bearer ${adminToken}`)
          .attach("image", tempFilePath);

        expect(response.status).toBe(201);
        expect(response.body.data).toHaveProperty("imageUrl");
        uploadedImageUrl = response.body.data.imageUrl;
        expect(uploadedImageUrl).toContain("/uploads/");

        // Verify that the static file endpoint returns the uploaded file
        const staticResponse = await request(app).get(uploadedImageUrl);
        expect(staticResponse.status).toBe(200);
      } finally {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      }
    });
  });

  describe("Delete Equipment Item", () => {
    it("should allow admin to delete equipment item and return 404 on subsequent get", async () => {
      const response = await request(app)
        .delete(`/api/admin/equipment/${createdEquipmentId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);

      const getRes = await request(app).get(`/api/equipment/${createdEquipmentId}`);
      expect(getRes.status).toBe(404);
    });
  });
});
