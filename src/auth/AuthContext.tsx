import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  User,
  SubscriptionPlan,
  Coach,
  Equipment,
  ContactMessage,
  GymClass,
  ClassSchedule,
  INITIAL_SUBSCRIPTION_PLANS,
  INITIAL_COACHES,
  INITIAL_EQUIPMENT,
} from "@/shared/mockData";
import { INITIAL_CLASSES } from "@/shared/initialClasses";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export type CoachAccountInput = {
  name: string;
  specialization: string;
  bio: string;
  email: string;
  password: string;
};

type AuthContextValue = {
  user: User | null;
  users: User[];
  subscriptionPlans: SubscriptionPlan[];
  coaches: Coach[];
  equipment: Equipment[];
  gymClasses: GymClass[];
  messages: ContactMessage[];
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  register: (input: RegisterInput) => boolean;
  logout: () => void;
  updateCurrentUserProfile: (profile: Pick<User, "name" | "phoneNumber" | "personalGoals" | "avatarUrl">) => void;
  subscribeCurrentUser: (planName: string) => void;
  updateUserSubscription: (email: string, tier: string, expiresAt: string | null) => void;
  deleteUser: (email: string) => void;
  addSubscriptionPlan: (name: string, price: number, description: string, features: string[]) => void;
  editSubscriptionPlan: (id: string, name: string, price: number, description: string, features: string[]) => void;
  deleteSubscriptionPlan: (id: string) => void;
  addCoach: (input: CoachAccountInput) => "success" | "duplicate-email" | "invalid";
  editCoach: (id: string, input: CoachAccountInput) => "success" | "duplicate-email" | "invalid";
  deleteCoach: (id: string) => void;
  updateCoachProfile: (id: string, profile: Pick<Coach, "specialization" | "bio" | "phoneNumber" | "avatarUrl">) => void;
  addEquipment: (name: string, type: Equipment["type"], quantity: number, status: Equipment["status"]) => void;
  editEquipment: (id: string, name: string, type: Equipment["type"], quantity: number, status: Equipment["status"]) => void;
  deleteEquipment: (id: string) => void;
  addGymClass: (name: string, description: string, image: string) => void;
  editGymClass: (id: string, name: string, description: string, image: string) => void;
  deleteGymClass: (id: string) => void;
  assignCoachToClass: (classId: string, coachId: string | null) => void;
  addClassSchedule: (classId: string, slot: Omit<ClassSchedule, "id">) => boolean;
  editClassSchedule: (classId: string, slot: ClassSchedule) => boolean;
  deleteClassSchedule: (classId: string, slotId: string) => void;
  addMessage: (name: string, email: string, message: string) => void;
  markMessageRead: (id: string, read: boolean) => void;
  deleteMessage: (id: string) => void;
};

const AUTH_STORAGE_KEY = "evogym_mock_user";
const USERS_STORAGE_KEY = "evogym_mock_users";
const SUBSCRIPTION_PLANS_STORAGE_KEY = "evogym_mock_subscription_plans";
const COACHES_STORAGE_KEY = "evogym_mock_coaches";
const EQUIPMENT_STORAGE_KEY = "evogym_mock_equipment";
const GYM_CLASSES_STORAGE_KEY = "evogym_mock_gym_classes";
const WEIGHT_CLASS_RESTORE_KEY = "evogym_weight_class_restored_v1";
const MESSAGES_STORAGE_KEY = "evogym_mock_messages";

const DEMO_EMAIL = "demo@gym.com";
const DEMO_PASSWORD = "password";

const ADMIN_EMAIL = "admin@gym.com";
const ADMIN_PASSWORD = "adminpassword";

const COACH_EMAIL = "coach@gym.com";
const COACH_PASSWORD = "coachpassword";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type Props = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [gymClasses, setGymClasses] = useState<GymClass[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  useEffect(() => {
    // 1. Seed subscription plans
    const storedPlans = window.localStorage.getItem(SUBSCRIPTION_PLANS_STORAGE_KEY);
    let finalPlans = INITIAL_SUBSCRIPTION_PLANS;
    if (storedPlans) {
      const parsed = JSON.parse(storedPlans) as SubscriptionPlan[];
      finalPlans = parsed.map(plan => {
        const initial = INITIAL_SUBSCRIPTION_PLANS.find(p => p.id === plan.id);
        if (initial) {
          return { ...plan, price: initial.price };
        }
        return plan;
      });
      window.localStorage.setItem(SUBSCRIPTION_PLANS_STORAGE_KEY, JSON.stringify(finalPlans));
    } else {
      window.localStorage.setItem(
        SUBSCRIPTION_PLANS_STORAGE_KEY,
        JSON.stringify(INITIAL_SUBSCRIPTION_PLANS)
      );
    }
    setSubscriptionPlans(finalPlans);

    // 2. Seed coaches
    const storedCoaches = window.localStorage.getItem(COACHES_STORAGE_KEY);
    let finalCoaches = INITIAL_COACHES;
    if (storedCoaches) {
      const parsed = JSON.parse(storedCoaches) as Partial<Coach>[];
      finalCoaches = parsed.map((coach, index) => ({
        id: coach.id ?? `coach-${index + 1}`,
        name: coach.name ?? "Coach",
        specialization: coach.specialization ?? "",
        bio: coach.bio ?? "",
        email: coach.email ?? (coach.id === "coach-1" ? COACH_EMAIL : ""),
        phoneNumber: coach.phoneNumber ?? "",
        avatarUrl: coach.avatarUrl ?? "",
        accountActive: coach.accountActive ?? coach.id === "coach-1",
      }));
    }
    window.localStorage.setItem(COACHES_STORAGE_KEY, JSON.stringify(finalCoaches));
    setCoaches(finalCoaches);

    // 3. Seed equipment
    const storedEquipment = window.localStorage.getItem(EQUIPMENT_STORAGE_KEY);
    let finalEquipment = INITIAL_EQUIPMENT;
    if (storedEquipment) {
      finalEquipment = JSON.parse(storedEquipment) as Equipment[];
    } else {
      window.localStorage.setItem(EQUIPMENT_STORAGE_KEY, JSON.stringify(INITIAL_EQUIPMENT));
    }
    setEquipment(finalEquipment);

    // 4. Seed gym classes
    const storedClasses = window.localStorage.getItem(GYM_CLASSES_STORAGE_KEY);
    let finalClasses = INITIAL_CLASSES;
    if (storedClasses) {
      const parsed = JSON.parse(storedClasses) as Partial<GymClass>[];
      finalClasses = parsed.map((gymClass, index) => {
        const initialClass = INITIAL_CLASSES.find((item) => item.id === gymClass.id);
        return {
          id: gymClass.id ?? `class-${Date.now()}-${index}`,
          name: gymClass.name ?? "Gym Class",
          description: gymClass.description ?? "",
          image: gymClass.image ?? "",
          coachId: gymClass.coachId === undefined ? initialClass?.coachId ?? null : gymClass.coachId,
          schedule: gymClass.schedule ?? initialClass?.schedule ?? [],
        };
      });
    }
    if (!window.localStorage.getItem(WEIGHT_CLASS_RESTORE_KEY)) {
      const originalWeightClass = INITIAL_CLASSES.find((gymClass) => gymClass.id === "class-1");
      if (originalWeightClass && !finalClasses.some((gymClass) => gymClass.id === originalWeightClass.id)) {
        finalClasses = [originalWeightClass, ...finalClasses];
      }
      window.localStorage.setItem(WEIGHT_CLASS_RESTORE_KEY, "true");
    }
    window.localStorage.setItem(GYM_CLASSES_STORAGE_KEY, JSON.stringify(finalClasses));
    setGymClasses(finalClasses);

    // 5. Seed users (includes demo member & admin user)
    const storedUsers = window.localStorage.getItem(USERS_STORAGE_KEY);
    let finalUsers: User[] = [];
    if (storedUsers) {
      finalUsers = (JSON.parse(storedUsers) as User[]).map((stored) => {
        if (stored.email.toLowerCase() === DEMO_EMAIL) return { ...stored, password: DEMO_PASSWORD };
        if (stored.email.toLowerCase() === ADMIN_EMAIL) return { ...stored, password: ADMIN_PASSWORD };
        return stored;
      });
    } else {
      const defaultExpires = new Date();
      defaultExpires.setDate(defaultExpires.getDate() + 30);

      finalUsers = [
        {
          name: "Demo Member",
          email: DEMO_EMAIL,
          role: "member",
          password: DEMO_PASSWORD,
          membershipStatus: "Plan 2",
          subscriptionExpiresAt: defaultExpires.toISOString(),
        },
        {
          name: "System Admin",
          email: ADMIN_EMAIL,
          role: "admin",
          password: ADMIN_PASSWORD,
          membershipStatus: "None",
          subscriptionExpiresAt: null,
        },
      ];
    }
    const demoCoach = finalCoaches.find((coach) => coach.id === "coach-1");
    if (demoCoach && !finalUsers.some((stored) => stored.email.toLowerCase() === COACH_EMAIL)) {
      finalUsers.push({
        name: demoCoach.name,
        email: COACH_EMAIL,
        password: COACH_PASSWORD,
        role: "coach",
        coachId: demoCoach.id,
        membershipStatus: "None",
        subscriptionExpiresAt: null,
        phoneNumber: demoCoach.phoneNumber,
        avatarUrl: demoCoach.avatarUrl,
      });
    }
    window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(finalUsers));
    setUsers(finalUsers);

    // 5. Seed messages inbox
    const storedMessages = window.localStorage.getItem(MESSAGES_STORAGE_KEY);
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages) as ContactMessage[]);
    } else {
      window.localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify([]));
    }

    // 6. Resume active user session
    const storedUser = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedUser) {
      const session = JSON.parse(storedUser) as User;
      setUser(finalUsers.find((stored) => stored.email.toLowerCase() === session.email.toLowerCase()) ?? null);
    }
  }, []);

  const saveUser = (nextUser: User) => {
    setUser(nextUser);
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
  };

  const login = (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();

    // Check Hardcoded Admin
    if (normalizedEmail === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
      const adminUser: User = {
        name: "System Admin",
        email: ADMIN_EMAIL,
        role: "admin",
        membershipStatus: "None",
        subscriptionExpiresAt: null,
      };
      saveUser(adminUser);
      return true;
    }

    // Check Users Database
    const foundUser = users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (!foundUser) {
      return false;
    }

    if (foundUser.password && password !== foundUser.password) {
      return false;
    }

    saveUser(foundUser);
    return true;
  };

  const register = ({ name, email, password }: RegisterInput) => {
    const normalizedEmail = email.trim().toLowerCase();
    const exists = users.some((u) => u.email.toLowerCase() === normalizedEmail);
    if (exists) return false;

    const newUser: User = {
      name,
      email: normalizedEmail,
      password,
      role: "member",
      membershipStatus: "None",
      subscriptionExpiresAt: null,
      phoneNumber: "",
      personalGoals: "",
      avatarUrl: "",
    };

    const nextUsers = [...users, newUser];
    setUsers(nextUsers);
    window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(nextUsers));
    saveUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const persistUserUpdate = (email: string, updater: (currentUser: User) => User) => {
    const nextUsers = users.map((u) => {
      if (u.email.toLowerCase() !== email.toLowerCase()) {
        return u;
      }

      const updated = updater(u);
      if (user && user.email.toLowerCase() === email.toLowerCase()) {
        saveUser(updated);
      }
      return updated;
    });

    setUsers(nextUsers);
    window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(nextUsers));
  };

  const updateCurrentUserProfile = (
    profile: Pick<User, "name" | "phoneNumber" | "personalGoals" | "avatarUrl">
  ) => {
    if (!user) return;

    persistUserUpdate(user.email, (currentUser) => ({
      ...currentUser,
      name: profile.name,
      phoneNumber: profile.phoneNumber,
      personalGoals: profile.personalGoals,
      avatarUrl: profile.avatarUrl,
    }));
  };

  const subscribeCurrentUser = (planName: string) => {
    if (!user) return;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    updateUserSubscription(user.email, planName, expiresAt.toISOString());
  };

  const updateUserSubscription = (email: string, tier: string, expiresAt: string | null) => {
    const nextUsers = users.map((u) => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        const updated = { ...u, membershipStatus: tier, subscriptionExpiresAt: expiresAt };
        if (user && user.email.toLowerCase() === email.toLowerCase()) {
          saveUser(updated);
        }
        return updated;
      }
      return u;
    });
    setUsers(nextUsers);
    window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(nextUsers));
  };

  const deleteUser = (email: string) => {
    const nextUsers = users.filter((u) => u.email.toLowerCase() !== email.toLowerCase());
    setUsers(nextUsers);
    window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(nextUsers));
    if (user && user.email.toLowerCase() === email.toLowerCase()) {
      logout();
    }
  };

  const addSubscriptionPlan = (
    name: string,
    price: number,
    description: string,
    features: string[]
  ) => {
    const newPlan: SubscriptionPlan = {
      id: `plan-${Date.now()}`,
      name,
      price,
      description,
      features,
    };
    const nextPlans = [...subscriptionPlans, newPlan];
    setSubscriptionPlans(nextPlans);
    window.localStorage.setItem(SUBSCRIPTION_PLANS_STORAGE_KEY, JSON.stringify(nextPlans));
  };

  const editSubscriptionPlan = (
    id: string,
    name: string,
    price: number,
    description: string,
    features: string[]
  ) => {
    const nextPlans = subscriptionPlans.map((plan) =>
      plan.id === id ? { ...plan, name, price, description, features } : plan
    );
    setSubscriptionPlans(nextPlans);
    window.localStorage.setItem(SUBSCRIPTION_PLANS_STORAGE_KEY, JSON.stringify(nextPlans));
  };

  const deleteSubscriptionPlan = (id: string) => {
    const nextPlans = subscriptionPlans.filter((plan) => plan.id !== id);
    setSubscriptionPlans(nextPlans);
    window.localStorage.setItem(SUBSCRIPTION_PLANS_STORAGE_KEY, JSON.stringify(nextPlans));
  };

  // Coach account operations
  const addCoach = (input: CoachAccountInput) => {
    const email = input.email.trim().toLowerCase();
    if (!input.name.trim() || !input.specialization.trim() || !email || !input.password) return "invalid";
    if (users.some((stored) => stored.email.toLowerCase() === email)) return "duplicate-email";

    const newCoach: Coach = {
      id: `coach-${Date.now()}`,
      name: input.name.trim(),
      specialization: input.specialization.trim(),
      bio: input.bio.trim(),
      email,
      phoneNumber: "",
      avatarUrl: "",
      accountActive: true,
    };
    const nextCoaches = [...coaches, newCoach];
    const nextUsers = [...users, {
      name: newCoach.name,
      email,
      password: input.password,
      role: "coach" as const,
      coachId: newCoach.id,
      membershipStatus: "None",
      subscriptionExpiresAt: null,
      phoneNumber: "",
      avatarUrl: "",
    }];
    setCoaches(nextCoaches);
    setUsers(nextUsers);
    window.localStorage.setItem(COACHES_STORAGE_KEY, JSON.stringify(nextCoaches));
    window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(nextUsers));
    return "success";
  };

  const editCoach = (id: string, input: CoachAccountInput) => {
    const currentCoach = coaches.find((coach) => coach.id === id);
    if (!currentCoach) return "invalid";
    const linkedUser = users.find((stored) => stored.coachId === id);
    const email = input.email.trim().toLowerCase();
    if (!input.name.trim() || !input.specialization.trim() || !email || (!input.password && !linkedUser?.password)) return "invalid";
    if (users.some((stored) => stored.email.toLowerCase() === email && stored.coachId !== id)) return "duplicate-email";

    const updatedCoach: Coach = {
      ...currentCoach,
      name: input.name.trim(),
      specialization: input.specialization.trim(),
      bio: input.bio.trim(),
      email,
      accountActive: true,
    };
    const nextCoaches = coaches.map((coach) => coach.id === id ? updatedCoach : coach);
    const coachUser: User = {
      ...(linkedUser ?? {
        role: "coach" as const,
        coachId: id,
        membershipStatus: "None",
        subscriptionExpiresAt: null,
      }),
      name: updatedCoach.name,
      email,
      password: input.password || linkedUser?.password,
      role: "coach",
      coachId: id,
      phoneNumber: updatedCoach.phoneNumber,
      avatarUrl: updatedCoach.avatarUrl,
    };
    const nextUsers = linkedUser
      ? users.map((stored) => stored.coachId === id ? coachUser : stored)
      : [...users, coachUser];
    setCoaches(nextCoaches);
    setUsers(nextUsers);
    window.localStorage.setItem(COACHES_STORAGE_KEY, JSON.stringify(nextCoaches));
    window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(nextUsers));
    if (user?.coachId === id) saveUser(coachUser);
    return "success";
  };

  const deleteCoach = (id: string) => {
    const nextCoaches = coaches.filter((c) => c.id !== id);
    const nextUsers = users.filter((stored) => stored.coachId !== id);
    const nextClasses = gymClasses.map((gymClass) => gymClass.coachId === id ? { ...gymClass, coachId: null } : gymClass);
    setCoaches(nextCoaches);
    setUsers(nextUsers);
    setGymClasses(nextClasses);
    window.localStorage.setItem(COACHES_STORAGE_KEY, JSON.stringify(nextCoaches));
    window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(nextUsers));
    window.localStorage.setItem(GYM_CLASSES_STORAGE_KEY, JSON.stringify(nextClasses));
  };

  const updateCoachProfile = (
    id: string,
    profile: Pick<Coach, "specialization" | "bio" | "phoneNumber" | "avatarUrl">
  ) => {
    const nextCoaches = coaches.map((coach) => coach.id === id ? { ...coach, ...profile } : coach);
    const nextUsers = users.map((stored) => stored.coachId === id
      ? { ...stored, phoneNumber: profile.phoneNumber, avatarUrl: profile.avatarUrl }
      : stored
    );
    setCoaches(nextCoaches);
    setUsers(nextUsers);
    window.localStorage.setItem(COACHES_STORAGE_KEY, JSON.stringify(nextCoaches));
    window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(nextUsers));
    const activeCoachUser = nextUsers.find((stored) => stored.coachId === id);
    if (user?.coachId === id && activeCoachUser) saveUser(activeCoachUser);
  };

  // Equipment operations
  const addEquipment = (
    name: string,
    type: Equipment["type"],
    quantity: number,
    status: Equipment["status"]
  ) => {
    const newEq: Equipment = {
      id: `eq-${Date.now()}`,
      name,
      type,
      quantity,
      status,
    };
    const nextEq = [...equipment, newEq];
    setEquipment(nextEq);
    window.localStorage.setItem(EQUIPMENT_STORAGE_KEY, JSON.stringify(nextEq));
  };

  const editEquipment = (
    id: string,
    name: string,
    type: Equipment["type"],
    quantity: number,
    status: Equipment["status"]
  ) => {
    const nextEq = equipment.map((e) =>
      e.id === id ? { ...e, name, type, quantity, status } : e
    );
    setEquipment(nextEq);
    window.localStorage.setItem(EQUIPMENT_STORAGE_KEY, JSON.stringify(nextEq));
  };

  const deleteEquipment = (id: string) => {
    const nextEq = equipment.filter((e) => e.id !== id);
    setEquipment(nextEq);
    window.localStorage.setItem(EQUIPMENT_STORAGE_KEY, JSON.stringify(nextEq));
  };

  // Gym Classes CRUD
  const addGymClass = (name: string, description: string, image: string) => {
    const newClass: GymClass = { id: `class-${Date.now()}`, name, description, image, coachId: null, schedule: [] };
    const next = [...gymClasses, newClass];
    setGymClasses(next);
    window.localStorage.setItem(GYM_CLASSES_STORAGE_KEY, JSON.stringify(next));
  };

  const editGymClass = (id: string, name: string, description: string, image: string) => {
    const next = gymClasses.map((c) => (c.id === id ? { ...c, name, description, image } : c));
    setGymClasses(next);
    window.localStorage.setItem(GYM_CLASSES_STORAGE_KEY, JSON.stringify(next));
  };

  const deleteGymClass = (id: string) => {
    const next = gymClasses.filter((c) => c.id !== id);
    setGymClasses(next);
    window.localStorage.setItem(GYM_CLASSES_STORAGE_KEY, JSON.stringify(next));
  };

  const assignCoachToClass = (classId: string, coachId: string | null) => {
    const next = gymClasses.map((gymClass) => gymClass.id === classId ? { ...gymClass, coachId } : gymClass);
    setGymClasses(next);
    window.localStorage.setItem(GYM_CLASSES_STORAGE_KEY, JSON.stringify(next));
  };

  const isValidSchedule = (slot: Omit<ClassSchedule, "id"> | ClassSchedule) =>
    /^([01]\d|2[0-3]):[0-5]\d$/.test(slot.startTime) && slot.durationMinutes > 0 && slot.capacity > 0;

  const addClassSchedule = (classId: string, slot: Omit<ClassSchedule, "id">) => {
    const target = gymClasses.find((gymClass) => gymClass.id === classId);
    if (!target || !isValidSchedule(slot)) return false;
    if (target.schedule.some((item) => item.weekday === slot.weekday && item.startTime === slot.startTime)) return false;
    const nextSlot: ClassSchedule = { ...slot, id: `slot-${Date.now()}` };
    const next = gymClasses.map((gymClass) => gymClass.id === classId
      ? { ...gymClass, schedule: [...gymClass.schedule, nextSlot] }
      : gymClass
    );
    setGymClasses(next);
    window.localStorage.setItem(GYM_CLASSES_STORAGE_KEY, JSON.stringify(next));
    return true;
  };

  const editClassSchedule = (classId: string, slot: ClassSchedule) => {
    const target = gymClasses.find((gymClass) => gymClass.id === classId);
    if (!target || !isValidSchedule(slot)) return false;
    if (target.schedule.some((item) => item.id !== slot.id && item.weekday === slot.weekday && item.startTime === slot.startTime)) return false;
    const next = gymClasses.map((gymClass) => gymClass.id === classId
      ? { ...gymClass, schedule: gymClass.schedule.map((item) => item.id === slot.id ? slot : item) }
      : gymClass
    );
    setGymClasses(next);
    window.localStorage.setItem(GYM_CLASSES_STORAGE_KEY, JSON.stringify(next));
    return true;
  };

  const deleteClassSchedule = (classId: string, slotId: string) => {
    const next = gymClasses.map((gymClass) => gymClass.id === classId
      ? { ...gymClass, schedule: gymClass.schedule.filter((slot) => slot.id !== slotId) }
      : gymClass
    );
    setGymClasses(next);
    window.localStorage.setItem(GYM_CLASSES_STORAGE_KEY, JSON.stringify(next));
  };

  // Messages (inbox) operations
  const addMessage = (name: string, email: string, message: string) => {
    const newMsg: ContactMessage = {
      id: `msg-${Date.now()}`,
      name,
      email,
      message,
      receivedAt: new Date().toISOString(),
      read: false,
    };
    const nextMessages = [newMsg, ...messages];
    setMessages(nextMessages);
    window.localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(nextMessages));
  };

  const markMessageRead = (id: string, read: boolean) => {
    const nextMessages = messages.map((m) => (m.id === id ? { ...m, read } : m));
    setMessages(nextMessages);
    window.localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(nextMessages));
  };

  const deleteMessage = (id: string) => {
    const nextMessages = messages.filter((m) => m.id !== id);
    setMessages(nextMessages);
    window.localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(nextMessages));
  };

  const value = useMemo(
    () => ({
      user,
      users,
      subscriptionPlans,
      coaches,
      equipment,
      gymClasses,
      messages,
      isAuthenticated: user !== null,
      login,
      register,
      logout,
      updateCurrentUserProfile,
      subscribeCurrentUser,
      updateUserSubscription,
      deleteUser,
      addSubscriptionPlan,
      editSubscriptionPlan,
      deleteSubscriptionPlan,
      addCoach,
      editCoach,
      deleteCoach,
      updateCoachProfile,
      addEquipment,
      editEquipment,
      deleteEquipment,
      addGymClass,
      editGymClass,
      deleteGymClass,
      assignCoachToClass,
      addClassSchedule,
      editClassSchedule,
      deleteClassSchedule,
      addMessage,
      markMessageRead,
      deleteMessage,
    }),
    [user, users, subscriptionPlans, coaches, equipment, gymClasses, messages]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
