export interface User {
  name: string;
  email: string;
  role: "member" | "coach" | "admin";
  password?: string;
  coachId?: string;
  membershipStatus: string;
  subscriptionExpiresAt: string | null; // ISO date string
  avatarUrl?: string;
  phoneNumber?: string;
  personalGoals?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  receivedAt: string; // ISO date string
  read: boolean;
}

export interface GymClass {
  id: string;
  name: string;
  description: string;
  image: string; // resolved asset URL or base64 data URL
  coachId: string | null;
  schedule: ClassSchedule[];
}

export type Weekday = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export interface ClassSchedule {
  id: string;
  weekday: Weekday;
  startTime: string;
  durationMinutes: number;
  capacity: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
}

export interface Coach {
  id: string;
  name: string;
  specialization: string;
  bio: string;
  email: string;
  phoneNumber: string;
  avatarUrl: string;
  accountActive: boolean;
}

export interface Equipment {
  id: string;
  name: string;
  type: "Cardio" | "Strength" | "Accessories" | "Other";
  status: "Operational" | "Under Maintenance";
  quantity: number;
}

export const INITIAL_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "plan-1",
    name: "Plan 1",
    price: 1000,
    description: "Entry access for members starting their training routine.",
    features: ["Gym floor access", "Locker room access", "Basic equipment use"],
  },
  {
    id: "plan-2",
    name: "Plan 2",
    price: 2000,
    description: "Performance access for consistent strength and conditioning work.",
    features: ["Everything in Plan 1", "Group classes", "Monthly progress check"],
  },
  {
    id: "plan-3",
    name: "Plan 3",
    price: 3000,
    description: "Full access for members who want coaching and priority support.",
    features: ["Everything in Plan 2", "Priority class access", "Coach consultation"],
  },
];

export const INITIAL_COACHES: Coach[] = [
  {
    id: "coach-1",
    name: "Alex Thorne",
    specialization: "Strength & Conditioning",
    bio: "Former powerlifter specializing in compound movement optimization, barbell technique, and hypertrophy phases.",
    email: "coach@gym.com",
    phoneNumber: "",
    avatarUrl: "",
    accountActive: true,
  },
  {
    id: "coach-2",
    name: "Elena Rostova",
    specialization: "Yoga & Athletic Mobility",
    bio: "Focuses on deep tissue recovery, functional range conditioning, and breathwork for high-intensity athletes.",
    email: "",
    phoneNumber: "",
    avatarUrl: "",
    accountActive: false,
  },
  {
    id: "coach-3",
    name: "Marcus Vance",
    specialization: "HIIT & Cardio Endurance",
    bio: "Creator of the Shred-60 series. Specializes in aerobic capacity, metabolic conditioning, and speed drills.",
    email: "",
    phoneNumber: "",
    avatarUrl: "",
    accountActive: false,
  },
  {
    id: "coach-4",
    name: "Sarah Jenkins",
    specialization: "Olympic Weightlifting",
    bio: "USAW Level 2 Coach with over a decade of experience refining clean & jerk and snatch mechanics for competitive athletes.",
    email: "",
    phoneNumber: "",
    avatarUrl: "",
    accountActive: false,
  },
];

export const INITIAL_EQUIPMENT: Equipment[] = [
  {
    id: "eq-1",
    name: "Power Rack Stations",
    type: "Strength",
    status: "Operational",
    quantity: 6,
  },
  {
    id: "eq-2",
    name: "Commercial Treadmills",
    type: "Cardio",
    status: "Operational",
    quantity: 12,
  },
  {
    id: "eq-3",
    name: "Olympic Barbells & Bumper Plates",
    type: "Strength",
    status: "Operational",
    quantity: 15,
  },
  {
    id: "eq-4",
    name: "StairMaster Climbers",
    type: "Cardio",
    status: "Under Maintenance",
    quantity: 4,
  },
  {
    id: "eq-5",
    name: "Concept2 Rowing Machines",
    type: "Cardio",
    status: "Operational",
    quantity: 8,
  },
  {
    id: "eq-6",
    name: "Adjustable Dumbbells Set (5-100 lbs)",
    type: "Strength",
    status: "Operational",
    quantity: 10,
  },
];
