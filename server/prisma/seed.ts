import { PrismaClient, Role, EquipmentType, EquipmentStatus } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Hash passwords
  const adminPassword = await argon2.hash("adminpassword");
  const memberPassword = await argon2.hash("password");
  const coachPassword = await argon2.hash("coachpassword");

  // 2. Upsert Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@gym.com" },
    update: {
      passwordHash: adminPassword,
      role: Role.ADMIN,
      name: "System Admin",
    },
    create: {
      email: "admin@gym.com",
      passwordHash: adminPassword,
      role: Role.ADMIN,
      name: "System Admin",
    },
  });
  console.log("Seeded Admin:", admin.email);

  // 3. Upsert Demo Member
  const member = await prisma.user.upsert({
    where: { email: "demo@gym.com" },
    update: {
      passwordHash: memberPassword,
      role: Role.MEMBER,
      name: "Demo Member",
      phoneNumber: "+1 555-0199",
      personalGoals: "Build strength and maintain consistency",
    },
    create: {
      email: "demo@gym.com",
      passwordHash: memberPassword,
      role: Role.MEMBER,
      name: "Demo Member",
      phoneNumber: "+1 555-0199",
      personalGoals: "Build strength and maintain consistency",
    },
  });
  console.log("Seeded Member:", member.email);

  // 4. Upsert Coach + CoachProfile
  const coachUser = await prisma.user.upsert({
    where: { email: "coach@gym.com" },
    update: {
      passwordHash: coachPassword,
      role: Role.COACH,
      name: "Alex Thorne",
    },
    create: {
      email: "coach@gym.com",
      passwordHash: coachPassword,
      role: Role.COACH,
      name: "Alex Thorne",
    },
  });

  await prisma.coachProfile.upsert({
    where: { userId: coachUser.id },
    update: {
      specialization: "Strength & Conditioning",
      bio: "Former powerlifter specializing in compound movement optimization, barbell technique, and hypertrophy phases.",
    },
    create: {
      userId: coachUser.id,
      specialization: "Strength & Conditioning",
      bio: "Former powerlifter specializing in compound movement optimization, barbell technique, and hypertrophy phases.",
    },
  });
  console.log("Seeded Coach:", coachUser.email);

  // 5. Seed Subscription Plans
  const plansData = [
    {
      name: "Plan 1",
      price: 1000,
      description: "Entry access for members starting their training routine.",
      features: ["Gym floor access", "Locker room access", "Basic equipment use"],
      displayOrder: 1,
    },
    {
      name: "Plan 2",
      price: 2000,
      description: "Performance access for consistent strength and conditioning work.",
      features: ["Everything in Plan 1", "Group classes", "Monthly progress check"],
      displayOrder: 2,
    },
    {
      name: "Plan 3",
      price: 3000,
      description: "Full access for members who want coaching and priority support.",
      features: ["Everything in Plan 2", "Priority class access", "Coach consultation"],
      displayOrder: 3,
    },
  ];

  for (const plan of plansData) {
    const existing = await prisma.subscriptionPlan.findFirst({
      where: { name: plan.name },
    });
    if (existing) {
      await prisma.subscriptionPlan.update({
        where: { id: existing.id },
        data: plan,
      });
    } else {
      await prisma.subscriptionPlan.create({
        data: plan,
      });
    }
  }
  console.log("Seeded Subscription Plans");

  // 6. Seed Equipment
  const equipmentData = [
    { name: "Power Rack Stations", type: EquipmentType.Strength, quantity: 6, status: EquipmentStatus.Operational },
    { name: "Commercial Treadmills", type: EquipmentType.Cardio, quantity: 12, status: EquipmentStatus.Operational },
    { name: "Olympic Barbells & Bumper Plates", type: EquipmentType.Strength, quantity: 15, status: EquipmentStatus.Operational },
    { name: "StairMaster Climbers", type: EquipmentType.Cardio, quantity: 4, status: EquipmentStatus.Under_Maintenance },
    { name: "Concept2 Rowing Machines", type: EquipmentType.Cardio, quantity: 8, status: EquipmentStatus.Operational },
    { name: "Adjustable Dumbbells Set (5-100 lbs)", type: EquipmentType.Strength, quantity: 10, status: EquipmentStatus.Operational },
  ];

  for (const eq of equipmentData) {
    const existing = await prisma.equipment.findFirst({
      where: { name: eq.name },
    });
    if (existing) {
      await prisma.equipment.update({
        where: { id: existing.id },
        data: eq,
      });
    } else {
      await prisma.equipment.create({
        data: eq,
      });
    }
  }
  console.log("Seeded Equipment");

  // 7. Seed Gym Classes
  const class1 = await prisma.gymClass.findFirst({ where: { name: "Weightlifting Foundation" } });
  if (!class1) {
    const createdClass = await prisma.gymClass.create({
      data: {
        name: "Weightlifting Foundation",
        description: "Master the fundamentals of squat, bench press, deadlift, and overhead press with structured coaching.",
        coachId: coachUser.id,
        schedules: {
          create: [
            { weekday: "monday", startTime: "10:00", durationMinutes: 60, capacity: 12 },
            { weekday: "wednesday", startTime: "10:00", durationMinutes: 60, capacity: 12 },
          ],
        },
      },
    });
    console.log("Seeded Class:", createdClass.name);
  }

  console.log("Database seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
