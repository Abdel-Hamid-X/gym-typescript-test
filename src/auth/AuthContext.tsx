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
  INITIAL_SUBSCRIPTION_PLANS,
  INITIAL_COACHES,
  INITIAL_EQUIPMENT,
} from "@/shared/mockData";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

type AuthContextValue = {
  user: User | null;
  users: User[];
  subscriptionPlans: SubscriptionPlan[];
  coaches: Coach[];
  equipment: Equipment[];
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  register: (input: RegisterInput) => void;
  logout: () => void;
  updateCurrentUserProfile: (profile: Pick<User, "name" | "phoneNumber" | "personalGoals" | "avatarUrl">) => void;
  subscribeCurrentUser: (planName: string) => void;
  updateUserSubscription: (email: string, tier: string, expiresAt: string | null) => void;
  deleteUser: (email: string) => void;
  addSubscriptionPlan: (name: string, price: number, description: string, features: string[]) => void;
  editSubscriptionPlan: (id: string, name: string, price: number, description: string, features: string[]) => void;
  deleteSubscriptionPlan: (id: string) => void;
  addCoach: (name: string, specialization: string, bio: string) => void;
  editCoach: (id: string, name: string, specialization: string, bio: string) => void;
  deleteCoach: (id: string) => void;
  addEquipment: (name: string, type: Equipment["type"], quantity: number, status: Equipment["status"]) => void;
  editEquipment: (id: string, name: string, type: Equipment["type"], quantity: number, status: Equipment["status"]) => void;
  deleteEquipment: (id: string) => void;
};

const AUTH_STORAGE_KEY = "evogym_mock_user";
const USERS_STORAGE_KEY = "evogym_mock_users";
const SUBSCRIPTION_PLANS_STORAGE_KEY = "evogym_mock_subscription_plans";
const COACHES_STORAGE_KEY = "evogym_mock_coaches";
const EQUIPMENT_STORAGE_KEY = "evogym_mock_equipment";

const DEMO_EMAIL = "demo@gym.com";
const DEMO_PASSWORD = "password";

const ADMIN_EMAIL = "admin@gym.com";
const ADMIN_PASSWORD = "adminpassword";

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

  useEffect(() => {
    // 1. Seed subscription plans
    const storedPlans = window.localStorage.getItem(SUBSCRIPTION_PLANS_STORAGE_KEY);
    let finalPlans = INITIAL_SUBSCRIPTION_PLANS;
    if (storedPlans) {
      finalPlans = JSON.parse(storedPlans) as SubscriptionPlan[];
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
      finalCoaches = JSON.parse(storedCoaches) as Coach[];
    } else {
      window.localStorage.setItem(COACHES_STORAGE_KEY, JSON.stringify(INITIAL_COACHES));
    }
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

    // 4. Seed users (includes demo member & admin user)
    const storedUsers = window.localStorage.getItem(USERS_STORAGE_KEY);
    let finalUsers: User[] = [];
    if (storedUsers) {
      finalUsers = JSON.parse(storedUsers) as User[];
    } else {
      const defaultExpires = new Date();
      defaultExpires.setDate(defaultExpires.getDate() + 30);

      finalUsers = [
        {
          name: "Demo Member",
          email: DEMO_EMAIL,
          role: "member",
          membershipStatus: "Plan 2",
          subscriptionExpiresAt: defaultExpires.toISOString(),
        },
        {
          name: "System Admin",
          email: ADMIN_EMAIL,
          role: "admin",
          membershipStatus: "None",
          subscriptionExpiresAt: null,
        },
      ];
      window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(finalUsers));
    }
    setUsers(finalUsers);

    // 5. Resume active user session
    const storedUser = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedUser) {
      setUser(JSON.parse(storedUser) as User);
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

    // Demo password restriction
    if (normalizedEmail === DEMO_EMAIL.toLowerCase() && password !== DEMO_PASSWORD) {
      return false;
    }

    saveUser(foundUser);
    return true;
  };

  const register = ({ name, email }: RegisterInput) => {
    const normalizedEmail = email.trim().toLowerCase();
    const exists = users.some((u) => u.email.toLowerCase() === normalizedEmail);
    if (exists) return;

    const newUser: User = {
      name,
      email: normalizedEmail,
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

  // Coaches operations
  const addCoach = (name: string, specialization: string, bio: string) => {
    const newCoach: Coach = {
      id: `coach-${Date.now()}`,
      name,
      specialization,
      bio,
    };
    const nextCoaches = [...coaches, newCoach];
    setCoaches(nextCoaches);
    window.localStorage.setItem(COACHES_STORAGE_KEY, JSON.stringify(nextCoaches));
  };

  const editCoach = (id: string, name: string, specialization: string, bio: string) => {
    const nextCoaches = coaches.map((c) =>
      c.id === id ? { ...c, name, specialization, bio } : c
    );
    setCoaches(nextCoaches);
    window.localStorage.setItem(COACHES_STORAGE_KEY, JSON.stringify(nextCoaches));
  };

  const deleteCoach = (id: string) => {
    const nextCoaches = coaches.filter((c) => c.id !== id);
    setCoaches(nextCoaches);
    window.localStorage.setItem(COACHES_STORAGE_KEY, JSON.stringify(nextCoaches));
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

  const value = useMemo(
    () => ({
      user,
      users,
      subscriptionPlans,
      coaches,
      equipment,
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
      addEquipment,
      editEquipment,
      deleteEquipment,
    }),
    [user, users, subscriptionPlans, coaches, equipment]
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
