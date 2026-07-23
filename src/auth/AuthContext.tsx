import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
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
  Weekday,
} from "@/shared/mockData";
import {
  fetchMe,
  loginRequest,
  registerRequest,
  logoutRequest,
  BackendUser,
} from "@/api/auth";
import {
  updateMeProfileRequest,
  fetchAdminUsers,
  deactivateUserRequest,
} from "@/api/users";
import {
  fetchPlans,
  assignMembershipRequest,
  cancelMembershipRequest,
  selfAssignMembershipRequest,
  BackendPlan,
} from "@/api/plans";
import {
  fetchCoaches,
  createCoachByAdmin,
  updateCoachProfileByAdmin,
} from "@/api/coaches";
import {
  fetchClasses,
  createClassByAdmin,
  updateClassByAdmin,
  deleteClassByAdmin,
  assignCoachToClassByAdmin,
  createScheduleSlotByAdmin,
  updateScheduleSlotByAdmin,
  deleteScheduleSlotByAdmin,
  BackendClass,
} from "@/api/classes";
import {
  fetchEquipment,
  createEquipmentByAdmin,
  updateEquipmentByAdmin,
  deleteEquipmentByAdmin,
  BackendEquipment,
} from "@/api/equipment";
import {
  submitContactMessage,
  fetchContactMessagesByAdmin,
  updateMessageStatusByAdmin,
  deleteContactMessageByAdmin,
  BackendMessage,
} from "@/api/messages";
import { getToken, removeToken } from "@/api/client";

export type RegisterInput = {
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

export type AuthContextValue = {
  user: User | null;
  users: User[];
  subscriptionPlans: SubscriptionPlan[];
  coaches: Coach[];
  equipment: Equipment[];
  gymClasses: GymClass[];
  messages: ContactMessage[];
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  register: (input: RegisterInput) => Promise<User | null>;
  logout: () => void;
  updateCurrentUserProfile: (profile: Pick<User, "name" | "phoneNumber" | "personalGoals" | "avatarUrl">) => Promise<void>;
  subscribeCurrentUser: (planName: string) => Promise<void>;
  updateUserSubscription: (email: string, tier: string, expiresAt: string | null) => Promise<void>;
  deleteUser: (email: string) => Promise<void>;
  addSubscriptionPlan: (name: string, price: number, description: string, features: string[]) => Promise<void>;
  editSubscriptionPlan: (id: string, name: string, price: number, description: string, features: string[]) => Promise<void>;
  deleteSubscriptionPlan: (id: string) => Promise<void>;
  addCoach: (input: CoachAccountInput) => Promise<"success" | "duplicate-email" | "invalid">;
  editCoach: (id: string, input: CoachAccountInput) => Promise<"success" | "duplicate-email" | "invalid">;
  deleteCoach: (id: string) => Promise<void>;
  updateCoachProfile: (id: string, profile: Pick<Coach, "specialization" | "bio" | "phoneNumber" | "avatarUrl">) => Promise<void>;
  addEquipment: (name: string, type: Equipment["type"], quantity: number, status: Equipment["status"]) => Promise<void>;
  editEquipment: (id: string, name: string, type: Equipment["type"], quantity: number, status: Equipment["status"]) => Promise<void>;
  deleteEquipment: (id: string) => Promise<void>;
  addGymClass: (name: string, description: string, image: string) => Promise<void>;
  editGymClass: (id: string, name: string, description: string, image: string) => Promise<void>;
  deleteGymClass: (id: string) => Promise<void>;
  assignCoachToClass: (classId: string, coachId: string | null) => Promise<void>;
  addClassSchedule: (classId: string, slot: Omit<ClassSchedule, "id">) => Promise<boolean>;
  editClassSchedule: (classId: string, slot: ClassSchedule) => Promise<boolean>;
  deleteClassSchedule: (classId: string, slotId: string) => Promise<void>;
  addMessage: (name: string, email: string, message: string) => Promise<void>;
  markMessageRead: (id: string, read: boolean) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapBackendUserToFrontend(u: BackendUser): User {
  return {
    name: u.name,
    email: u.email,
    role: u.role.toLowerCase() as "member" | "coach" | "admin",
    coachId: u.coachProfile?.id || (u as any).coachId,
    membershipStatus: u.activeMembership ? u.activeMembership.plan.name : "None",
    subscriptionExpiresAt: u.activeMembership ? u.activeMembership.expiresAt : null,
    avatarUrl: u.avatarUrl || "",
    phoneNumber: u.phoneNumber || "",
    personalGoals: u.personalGoals || "",
  };
}

function mapBackendPlanToFrontend(p: BackendPlan): SubscriptionPlan {
  return {
    id: p.id,
    name: p.name,
    price: p.priceCents,
    description: p.description,
    features: p.features,
  };
}

function mapBackendCoachToFrontend(c: BackendUser): Coach {
  return {
    id: c.coachProfile?.id || c.id,
    name: c.name,
    specialization: c.coachProfile?.specialization || "General Fitness",
    bio: c.coachProfile?.bio || "",
    email: c.email,
    phoneNumber: c.phoneNumber || "",
    avatarUrl: c.avatarUrl || "",
    accountActive: c.active,
  };
}

function mapBackendEquipmentToFrontend(e: BackendEquipment): Equipment {
  return {
    id: e.id,
    name: e.name,
    type: e.type,
    status: e.status === "Operational" ? "Operational" : "Under Maintenance",
    quantity: e.quantity,
  };
}

function mapBackendClassToFrontend(c: BackendClass): GymClass {
  return {
    id: c.id,
    name: c.name,
    description: c.description,
    image: c.imageUrl || "",
    coachId: c.coachId || null,
    schedule: (c.schedules || []).map((s) => ({
      id: s.id,
      weekday: s.weekday.toLowerCase() as Weekday,
      startTime: s.startTime,
      durationMinutes: s.durationMinutes,
      capacity: s.capacity,
    })),
  };
}

function mapBackendMessageToFrontend(m: BackendMessage): ContactMessage {
  return {
    id: m.id,
    name: m.name,
    email: m.email,
    message: m.message,
    receivedAt: m.createdAt,
    read: m.status !== "UNREAD",
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [gymClasses, setGymClasses] = useState<GymClass[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  const loadPublicData = useCallback(async () => {
    try {
      const [plansRes, coachesRes, eqRes, classesRes] = await Promise.all([
        fetchPlans().catch(() => ({ plans: [] })),
        fetchCoaches().catch(() => ({ coaches: [] })),
        fetchEquipment().catch(() => ({ equipment: [] })),
        fetchClasses().catch(() => ({ classes: [] })),
      ]);
      setSubscriptionPlans((plansRes.plans || []).map(mapBackendPlanToFrontend));
      setCoaches((coachesRes.coaches || []).map(mapBackendCoachToFrontend));
      setEquipment((eqRes.equipment || []).map(mapBackendEquipmentToFrontend));
      setGymClasses((classesRes.classes || []).map(mapBackendClassToFrontend));
    } catch (e) {
      console.error("Failed loading public data:", e);
    }
  }, []);

  const loadAdminData = useCallback(async () => {
    try {
      const [usersRes, msgsRes] = await Promise.all([
        fetchAdminUsers().catch(() => ({ users: [] })),
        fetchContactMessagesByAdmin().catch(() => ({ messages: [] })),
      ]);
      setUsers((usersRes.users || []).map(mapBackendUserToFrontend));
      setMessages((msgsRes.messages || []).map(mapBackendMessageToFrontend));
    } catch (e) {
      console.error("Failed loading admin data:", e);
    }
  }, []);

  useEffect(() => {
    loadPublicData();
    const token = getToken();
    if (token) {
      fetchMe()
        .then(({ user: u }) => {
          const mapped = mapBackendUserToFrontend(u);
          setUser(mapped);
          if (mapped.role === "admin") {
            loadAdminData();
          }
        })
        .catch(() => {
          removeToken();
          setUser(null);
        });
    }
  }, [loadPublicData, loadAdminData]);

  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      const { user: u } = await loginRequest(email, password);
      const mapped = mapBackendUserToFrontend(u);
      setUser(mapped);
      await loadPublicData();
      if (mapped.role === "admin") {
        await loadAdminData();
      }
      return mapped;
    } catch (error) {
      return null;
    }
  };

  const register = async (input: RegisterInput): Promise<User | null> => {
    try {
      const { user: u } = await registerRequest(input.name, input.email, input.password);
      const mapped = mapBackendUserToFrontend(u);
      setUser(mapped);
      await loadPublicData();
      return mapped;
    } catch (error) {
      return null;
    }
  };

  const logout = () => {
    logoutRequest();
    removeToken();
    setUser(null);
    setUsers([]);
    setMessages([]);
  };

  const updateCurrentUserProfile = async (
    profile: Pick<User, "name" | "phoneNumber" | "personalGoals" | "avatarUrl">
  ) => {
    try {
      const { user: u } = await updateMeProfileRequest(profile);
      setUser(mapBackendUserToFrontend(u));
    } catch (e) {
      console.error("updateCurrentUserProfile error:", e);
    }
  };

  const subscribeCurrentUser = async (planName: string) => {
    try {
      const targetPlan = subscriptionPlans.find((p) => p.name.toLowerCase() === planName.toLowerCase());
      if (!targetPlan) return;
      await selfAssignMembershipRequest(targetPlan.id);
      const { user: u } = await fetchMe();
      setUser(mapBackendUserToFrontend(u));
    } catch (e) {
      console.error("subscribeCurrentUser error:", e);
    }
  };

  const updateUserSubscription = async (email: string, _tier: string, _expiresAt: string | null) => {
    try {
      const targetUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!targetUser) return;
      if (_tier === "None" || !_expiresAt) {
        await fetchAdminUsers();
        await loadAdminData();
        return;
      }
      const targetPlan = subscriptionPlans.find((p) => p.name.toLowerCase() === _tier.toLowerCase()) || subscriptionPlans[0];
      if (!targetPlan) return;
      const backendUsers = await fetchAdminUsers();
      const bUser = backendUsers.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!bUser) return;
      const startsAt = new Date().toISOString();
      const expiresAt = _expiresAt;
      await assignMembershipRequest(bUser.id, targetPlan.id, startsAt, expiresAt);
      await loadAdminData();
    } catch (e) {
      console.error("updateUserSubscription error:", e);
    }
  };

  const deleteUser = async (email: string) => {
    try {
      const backendUsers = await fetchAdminUsers();
      const bUser = backendUsers.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (bUser) {
        await deactivateUserRequest(bUser.id);
        await loadAdminData();
      }
    } catch (e) {
      console.error("deleteUser error:", e);
    }
  };

  const addSubscriptionPlan = async (_name: string, _price: number, _description: string, _features: string[]) => {
    console.warn("Dynamic plan creation is managed via seed or direct DB in current version");
  };

  const editSubscriptionPlan = async (_id: string, _name: string, _price: number, _description: string, _features: string[]) => {
    console.warn("Dynamic plan editing is managed via seed or direct DB in current version");
  };

  const deleteSubscriptionPlan = async (_id: string) => {
    console.warn("Dynamic plan deletion is managed via seed or direct DB in current version");
  };

  const addCoach = async (input: CoachAccountInput): Promise<"success" | "duplicate-email" | "invalid"> => {
    try {
      if (!input.name.trim() || !input.specialization.trim() || !input.email || !input.password) {
        return "invalid";
      }
      await createCoachByAdmin(input);
      await loadPublicData();
      await loadAdminData();
      return "success";
    } catch (error: any) {
      if (error?.status === 409 || error?.message?.toLowerCase().includes("exists")) {
        return "duplicate-email";
      }
      return "invalid";
    }
  };

  const editCoach = async (id: string, input: CoachAccountInput): Promise<"success" | "duplicate-email" | "invalid"> => {
    try {
      const bUsers = await fetchAdminUsers();
      const targetUser = bUsers.users.find((u) => u.coachProfile?.id === id || u.id === id);
      if (!targetUser) return "invalid";
      await updateCoachProfileByAdmin(targetUser.id, {
        specialization: input.specialization,
        bio: input.bio,
      });
      await loadPublicData();
      await loadAdminData();
      return "success";
    } catch (error: any) {
      return "invalid";
    }
  };

  const deleteCoach = async (id: string) => {
    try {
      const bUsers = await fetchAdminUsers();
      const targetUser = bUsers.users.find((u) => u.coachProfile?.id === id || u.id === id);
      if (targetUser) {
        await deactivateUserRequest(targetUser.id);
        await loadPublicData();
        await loadAdminData();
      }
    } catch (e) {
      console.error("deleteCoach error:", e);
    }
  };

  const updateCoachProfile = async (
    id: string,
    profile: Pick<Coach, "specialization" | "bio" | "phoneNumber" | "avatarUrl">
  ) => {
    try {
      const bUsers = await fetchAdminUsers();
      const targetUser = bUsers.users.find((u) => u.coachProfile?.id === id || u.id === id);
      if (targetUser) {
        await updateCoachProfileByAdmin(targetUser.id, {
          specialization: profile.specialization,
          bio: profile.bio,
          avatarUrl: profile.avatarUrl,
        });
        await loadPublicData();
        await loadAdminData();
      }
    } catch (e) {
      console.error("updateCoachProfile error:", e);
    }
  };

  const addEquipment = async (
    name: string,
    type: Equipment["type"],
    quantity: number,
    status: Equipment["status"]
  ) => {
    try {
      await createEquipmentByAdmin({
        name,
        type,
        quantity,
        status: status === "Operational" ? "Operational" : "Under_Maintenance",
      });
      await loadPublicData();
    } catch (e) {
      console.error("addEquipment error:", e);
    }
  };

  const editEquipment = async (
    id: string,
    name: string,
    type: Equipment["type"],
    quantity: number,
    status: Equipment["status"]
  ) => {
    try {
      await updateEquipmentByAdmin(id, {
        name,
        type,
        quantity,
        status: status === "Operational" ? "Operational" : "Under_Maintenance",
      });
      await loadPublicData();
    } catch (e) {
      console.error("editEquipment error:", e);
    }
  };

  const deleteEquipment = async (id: string) => {
    try {
      await deleteEquipmentByAdmin(id);
      await loadPublicData();
    } catch (e) {
      console.error("deleteEquipment error:", e);
    }
  };

  const addGymClass = async (name: string, description: string, image: string) => {
    try {
      await createClassByAdmin({ name, description, imageUrl: image });
      await loadPublicData();
    } catch (e) {
      console.error("addGymClass error:", e);
    }
  };

  const editGymClass = async (id: string, name: string, description: string, image: string) => {
    try {
      await updateClassByAdmin(id, { name, description, imageUrl: image });
      await loadPublicData();
    } catch (e) {
      console.error("editGymClass error:", e);
    }
  };

  const deleteGymClass = async (id: string) => {
    try {
      await deleteClassByAdmin(id);
      await loadPublicData();
    } catch (e) {
      console.error("deleteGymClass error:", e);
    }
  };

  const assignCoachToClass = async (classId: string, coachId: string | null) => {
    try {
      await assignCoachToClassByAdmin(classId, coachId);
      await loadPublicData();
    } catch (e) {
      console.error("assignCoachToClass error:", e);
    }
  };

  const addClassSchedule = async (classId: string, slot: Omit<ClassSchedule, "id">): Promise<boolean> => {
    try {
      await createScheduleSlotByAdmin(classId, {
        weekday: slot.weekday.toUpperCase(),
        startTime: slot.startTime,
        durationMinutes: slot.durationMinutes,
        capacity: slot.capacity,
      });
      await loadPublicData();
      return true;
    } catch (e) {
      console.error("addClassSchedule error:", e);
      return false;
    }
  };

  const editClassSchedule = async (_classId: string, slot: ClassSchedule): Promise<boolean> => {
    try {
      await updateScheduleSlotByAdmin(slot.id, {
        weekday: slot.weekday.toUpperCase(),
        startTime: slot.startTime,
        durationMinutes: slot.durationMinutes,
        capacity: slot.capacity,
      });
      await loadPublicData();
      return true;
    } catch (e) {
      console.error("editClassSchedule error:", e);
      return false;
    }
  };

  const deleteClassSchedule = async (_classId: string, slotId: string) => {
    try {
      await deleteScheduleSlotByAdmin(slotId);
      await loadPublicData();
    } catch (e) {
      console.error("deleteClassSchedule error:", e);
    }
  };

  const addMessage = async (name: string, email: string, message: string) => {
    try {
      await submitContactMessage({ name, email, message });
      if (user?.role === "admin") {
        await loadAdminData();
      }
    } catch (e) {
      console.error("addMessage error:", e);
    }
  };

  const markMessageRead = async (id: string, read: boolean) => {
    try {
      await updateMessageStatusByAdmin(id, read ? "READ" : "UNREAD");
      await loadAdminData();
    } catch (e) {
      console.error("markMessageRead error:", e);
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      await deleteContactMessageByAdmin(id);
      await loadAdminData();
    } catch (e) {
      console.error("deleteMessage error:", e);
    }
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
