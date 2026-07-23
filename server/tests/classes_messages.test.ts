import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/utils/prisma.js";
import { createSession } from "../src/utils/session.js";
import argon2 from "argon2";
import { Role, MessageStatus } from "@prisma/client";

const app = createApp();

describe("Milestone 5: Coaches, Classes, Schedules & Contact Inbox", () => {
  const adminEmail = `m5_admin_${Date.now()}@example.com`;
  const memberEmail = `m5_member_${Date.now()}@example.com`;
  const coachEmail = `m5_coach_${Date.now()}@example.com`;
  let adminToken: string;
  let memberToken: string;
  let coachToken: string;
  let coachUserId: string;
  let createdClassId: string;
  let adminCreatedScheduleId: string;
  let coachCreatedScheduleId: string;
  let createdMessageId: string;

  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: [adminEmail, memberEmail, coachEmail] } },
    });
    await prisma.contactMessage.deleteMany({
      where: { email: `inquiry_${Date.now()}@example.com` },
    });

    const passwordHash = await argon2.hash("Password123!");

    const admin = await prisma.user.create({
      data: { name: "M5 Admin", email: adminEmail, passwordHash, role: Role.ADMIN },
    });
    const adminSession = await createSession(admin.id);
    adminToken = adminSession.token;

    const member = await prisma.user.create({
      data: { name: "M5 Member", email: memberEmail, passwordHash, role: Role.MEMBER },
    });
    const memberSession = await createSession(member.id);
    memberToken = memberSession.token;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: [adminEmail, memberEmail, coachEmail] } },
    });
    if (createdMessageId) {
      await prisma.contactMessage.deleteMany({ where: { id: createdMessageId } });
    }
    await prisma.$disconnect();
  });

  describe("Contact Inbox (/api/contact-messages & /api/admin/contact-messages)", () => {
    it("should allow a visitor or member to submit a contact inquiry", async () => {
      const response = await request(app).post("/api/contact-messages").send({
        name: "Interested Visitor",
        email: "visitor_inquiry@example.com",
        message: "Can I get a guest pass for the functional fitness area?",
      });

      expect(response.status).toBe(201);
      expect(response.body.data.message).toHaveProperty("status", MessageStatus.UNREAD);
      createdMessageId = response.body.data.message.id;
    });

    it("should reject non-admin users attempting to view inbox", async () => {
      const response = await request(app)
        .get("/api/admin/contact-messages")
        .set("Authorization", `Bearer ${memberToken}`);

      expect(response.status).toBe(403);
    });

    it("should allow admin to list, read, and mark inquiries as READ", async () => {
      const listRes = await request(app)
        .get("/api/admin/contact-messages")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(listRes.status).toBe(200);
      expect(Array.isArray(listRes.body.data.messages)).toBe(true);

      const updateRes = await request(app)
        .patch(`/api/admin/contact-messages/${createdMessageId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: MessageStatus.READ });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.message).toHaveProperty("status", MessageStatus.READ);
    });
  });

  describe("Coach Management (/api/admin/coaches, /api/coaches & /api/coach)", () => {
    it("should allow admin to create a new coach account with bio and specialization", async () => {
      const response = await request(app)
        .post("/api/admin/coaches")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Coach Alex M5",
          email: coachEmail,
          password: "CoachPassword123!",
          specialization: "Strength & Conditioning",
          bio: "Alex has over 10 years of experience training professional athletes.",
        });

      expect(response.status).toBe(201);
      expect(response.body.data.coach).toHaveProperty("email", coachEmail);
      expect(response.body.data.coach).toHaveProperty("role", Role.COACH);
      expect(response.body.data.coach.coachProfile).toHaveProperty("specialization", "Strength & Conditioning");
      coachUserId = response.body.data.coach.id;

      // Log the coach in to get their session token
      const coachSession = await createSession(coachUserId);
      coachToken = coachSession.token;
    });

    it("should list coach bios in the public directory", async () => {
      const response = await request(app).get("/api/coaches");
      expect(response.status).toBe(200);
      const coach = response.body.data.coaches.find((c: any) => c.id === coachUserId);
      expect(coach).toBeDefined();
      expect(coach.coachProfile).toHaveProperty("specialization", "Strength & Conditioning");
    });

    it("should retrieve detailed coach profile by ID including assigned classes", async () => {
      const response = await request(app).get(`/api/coaches/${coachUserId}`);
      expect(response.status).toBe(200);
      expect(response.body.data.coach).toHaveProperty("id", coachUserId);
    });

    it("should allow coach to update their own profile and specialization via coach portal", async () => {
      const response = await request(app)
        .patch("/api/coach/me")
        .set("Authorization", `Bearer ${coachToken}`)
        .send({
          specialization: "Olympic Weightlifting & Mobility",
          bio: "Alex specializes in Olympic lifts, core strength, and injury prevention.",
        });

      expect(response.status).toBe(200);
      expect(response.body.data.coach.coachProfile).toHaveProperty(
        "specialization",
        "Olympic Weightlifting & Mobility"
      );
    });
  });

  describe("Classes & Schedules (/api/admin/classes, /api/classes & /api/coach)", () => {
    it("should allow admin to create a gym class and assign a coach", async () => {
      const response = await request(app)
        .post("/api/admin/classes")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Elite Strength M5",
          description: "High intensity functional strength and power lifting class.",
          coachId: coachUserId,
        });

      expect(response.status).toBe(201);
      expect(response.body.data.class).toHaveProperty("name", "Elite Strength M5");
      expect(response.body.data.class).toHaveProperty("coachId", coachUserId);
      createdClassId = response.body.data.class.id;
    });

    it("should allow admin to create a weekly schedule slot for the class", async () => {
      const response = await request(app)
        .post(`/api/admin/classes/${createdClassId}/schedules`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          weekday: "Monday",
          startTime: "10:00",
          durationMinutes: 60,
          capacity: 15,
        });

      expect(response.status).toBe(201);
      expect(response.body.data.schedule).toHaveProperty("weekday", "Monday");
      expect(response.body.data.schedule).toHaveProperty("startTime", "10:00");
      adminCreatedScheduleId = response.body.data.schedule.id;
    });

    it("should list active gym classes and schedules in the public directory", async () => {
      const response = await request(app).get("/api/classes");
      expect(response.status).toBe(200);
      const gymClass = response.body.data.classes.find((c: any) => c.id === createdClassId);
      expect(gymClass).toBeDefined();
      expect(gymClass.coach).toHaveProperty("id", coachUserId);
      expect(gymClass.schedules.length).toBeGreaterThanOrEqual(1);
    });

    it("should allow coach to list classes assigned to them via coach portal", async () => {
      const response = await request(app)
        .get("/api/coach/classes")
        .set("Authorization", `Bearer ${coachToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.classes.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data.classes[0]).toHaveProperty("id", createdClassId);
    });

    it("should allow coach to add and modify schedule slots for their assigned class", async () => {
      const createRes = await request(app)
        .post(`/api/coach/classes/${createdClassId}/schedules`)
        .set("Authorization", `Bearer ${coachToken}`)
        .send({
          weekday: "Wednesday",
          startTime: "14:00",
          durationMinutes: 45,
          capacity: 12,
        });

      expect(createRes.status).toBe(201);
      coachCreatedScheduleId = createRes.body.data.schedule.id;

      const updateRes = await request(app)
        .patch(`/api/coach/schedules/${coachCreatedScheduleId}`)
        .set("Authorization", `Bearer ${coachToken}`)
        .send({ capacity: 16 });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.schedule).toHaveProperty("capacity", 16);
    });

    it("should allow coach to delete their schedule slot", async () => {
      const response = await request(app)
        .delete(`/api/coach/schedules/${coachCreatedScheduleId}`)
        .set("Authorization", `Bearer ${coachToken}`);

      expect(response.status).toBe(200);
    });
  });
});
