// Seed data for gym classes — kept separate from mockData.ts because
// Vite resolves asset imports at build time into real URL strings.
import Weights from "@/assets/Weights.jpg";
import image2 from "@/assets/image2.png";
import abCoreImg from "@/assets/Ab-core.jpg";
import cardioImg from "@/assets/cardio.jpg";
import fitnessImg from "@/assets/Fitness.webp";
import trainingImg from "@/assets/Training.jpg";
import type { GymClass } from "./mockData";

export const INITIAL_CLASSES: GymClass[] = [
  {
    id: "class-1",
    name: "Weight Training Classes",
    description:
      "Heavy compound lifts, progressive overload, and technical coaching for bigger numbers and stronger bodies.",
    image: Weights,
    coachId: "coach-1",
    schedule: [{ id: "slot-1", weekday: "monday", startTime: "18:00", durationMinutes: 60, capacity: 16 }],
  },
  {
    id: "class-2",
    name: "Yoga Classes",
    description:
      "Mobility and recovery sessions built to keep strong athletes moving, bracing, and lifting well.",
    image: image2,
    coachId: "coach-2",
    schedule: [{ id: "slot-2", weekday: "tuesday", startTime: "17:30", durationMinutes: 60, capacity: 18 }],
  },
  {
    id: "class-3",
    name: "Ab Core Classes",
    description:
      "Core strength, trunk stability, and loaded carries for better power transfer under pressure.",
    image: abCoreImg,
    coachId: "coach-3",
    schedule: [{ id: "slot-3", weekday: "wednesday", startTime: "18:30", durationMinutes: 45, capacity: 20 }],
  },
  {
    id: "class-4",
    name: "Cardio Classes",
    description:
      "Clip in and get lost in the music, high-intensity, low-impact indoor Cardio class",
    image: cardioImg,
    coachId: "coach-3",
    schedule: [{ id: "slot-4", weekday: "thursday", startTime: "19:00", durationMinutes: 45, capacity: 22 }],
  },
  {
    id: "class-5",
    name: "Fitness Classes",
    description:
      "Full-body conditioning sessions for lean muscle, stamina, and relentless pace.",
    image: fitnessImg,
    coachId: "coach-4",
    schedule: [{ id: "slot-5", weekday: "friday", startTime: "18:00", durationMinutes: 60, capacity: 18 }],
  },
  {
    id: "class-6",
    name: "Training Classes",
    description:
      "Coach-led performance sessions focused on strength, speed, and repeatable discipline.",
    image: trainingImg,
    coachId: "coach-1",
    schedule: [{ id: "slot-6", weekday: "saturday", startTime: "10:00", durationMinutes: 75, capacity: 14 }],
  },
];
