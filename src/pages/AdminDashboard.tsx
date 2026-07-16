import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Logo from "@/assets/Logo.png";
import { useAuth } from "@/auth/AuthContext";
import { Coach, Equipment, GymClass, SubscriptionPlan } from "@/shared/mockData";
import { useScrollableTabs } from "@/shared/useScrollableTabs";
import { formatPlanName, getLocalizedPlanContent, useLanguage } from "@/shared/LanguageContext";
import ClassScheduleEditor from "@/shared/ClassScheduleEditor";

const AdminDashboard = () => {
  const {
    user,
    users,
    subscriptionPlans,
    coaches,
    equipment,
    gymClasses,
    messages,
    logout,
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
    addGymClass,
    editGymClass,
    deleteGymClass,
    assignCoachToClass,
    addClassSchedule,
    editClassSchedule,
    deleteClassSchedule,
    markMessageRead,
    deleteMessage,
  } = useAuth();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRtl = language === "ar";
  const equipmentTypeLabels = {
    Strength: t("admin_type_strength"),
    Cardio: t("admin_type_cardio"),
    Accessories: t("admin_type_accessories"),
    Other: t("admin_type_other"),
  } as const;
  const equipmentStatusLabels = {
    Operational: t("admin_status_operational"),
    "Under Maintenance": t("admin_status_maintenance"),
  } as const;

  const [activeTab, setActiveTab] = useState<"members" | "subscriptions" | "coaches" | "equipment" | "classes" | "inbox">("members");
  const unreadCount = messages.filter((m) => !m.read).length;
  const tabBarProps = useScrollableTabs();

  // Subscription Plan Forms State
  const [planName, setPlanName] = useState("");
  const [planPrice, setPlanPrice] = useState(1000);
  const [planDescription, setPlanDescription] = useState("");
  const [planFeatures, setPlanFeatures] = useState("");
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  // Coach Forms State
  const [coachName, setCoachName] = useState("");
  const [coachSpec, setCoachSpec] = useState("");
  const [coachBio, setCoachBio] = useState("");
  const [coachEmail, setCoachEmail] = useState("");
  const [coachPassword, setCoachPassword] = useState("");
  const [coachError, setCoachError] = useState("");
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);

  // Equipment Forms State
  const [eqName, setEqName] = useState("");
  const [eqType, setEqType] = useState<Equipment["type"]>("Strength");
  const [eqQty, setEqQty] = useState(1);
  const [eqStatus, setEqStatus] = useState<Equipment["status"]>("Operational");
  const [editingEq, setEditingEq] = useState<Equipment | null>(null);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  // Members logic
  const handleTierChange = (email: string, newTier: any) => {
    const target = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!target) return;

    let expiresAt = target.subscriptionExpiresAt;
    if (newTier === "None") {
      expiresAt = null;
    } else if (!expiresAt || new Date(expiresAt).getTime() <= Date.now()) {
      const d = new Date();
      d.setDate(d.getDate() + 30);
      expiresAt = d.toISOString();
    }
    updateUserSubscription(email, newTier, expiresAt);
  };

  const adjustDays = (email: string, days: number) => {
    const target = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!target) return;

    let base = Date.now();
    if (target.subscriptionExpiresAt) {
      const current = new Date(target.subscriptionExpiresAt).getTime();
      if (current > base) {
        base = current;
      }
    }

    const newExpiry = new Date(base + days * 24 * 60 * 60 * 1000);
    updateUserSubscription(
      email,
      target.membershipStatus === "None"
        ? subscriptionPlans[0]?.name ?? "Plan 1"
        : target.membershipStatus,
      newExpiry.toISOString()
    );
  };

  // Subscription plan logic
  const parseFeatures = (features: string) =>
    features
      .split("\n")
      .map((feature) => feature.trim())
      .filter(Boolean);

  const handleAddPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName || !planDescription) return;

    addSubscriptionPlan(planName, planPrice, planDescription, parseFeatures(planFeatures));
    setPlanName("");
    setPlanPrice(1000);
    setPlanDescription("");
    setPlanFeatures("");
  };

  const handleSavePlanEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    editSubscriptionPlan(
      editingPlan.id,
      editingPlan.name,
      editingPlan.price,
      editingPlan.description,
      editingPlan.features
    );
    setEditingPlan(null);
  };

  // Coaches logic
  const handleAddCoach = (e: React.FormEvent) => {
    e.preventDefault();
    const result = addCoach({ name: coachName, specialization: coachSpec, bio: coachBio, email: coachEmail, password: coachPassword });
    if (result !== "success") {
      setCoachError(t(result === "duplicate-email" ? "admin_coach_duplicate" : "admin_coach_invalid"));
      return;
    }
    setCoachName("");
    setCoachSpec("");
    setCoachBio("");
    setCoachEmail("");
    setCoachPassword("");
    setCoachError("");
  };

  const handleSaveCoachEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoach) return;
    const result = editCoach(editingCoach.id, {
      name: editingCoach.name,
      specialization: editingCoach.specialization,
      bio: editingCoach.bio,
      email: editingCoach.email,
      password: coachPassword,
    });
    if (result !== "success") {
      setCoachError(t(result === "duplicate-email" ? "admin_coach_duplicate" : "admin_coach_invalid"));
      return;
    }
    setEditingCoach(null);
    setCoachPassword("");
    setCoachError("");
  };

  // Equipment logic
  const handleAddEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eqName) return;
    addEquipment(eqName, eqType, eqQty, eqStatus);
    setEqName("");
    setEqType("Strength");
    setEqQty(1);
    setEqStatus("Operational");
  };

  const handleSaveEqEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEq) return;
    editEquipment(editingEq.id, editingEq.name, editingEq.type, editingEq.quantity, editingEq.status);
    setEditingEq(null);
  };

  return (
    <main
      className={`min-h-screen bg-gray-20 px-6 py-10 text-white animate-fade-in ${isRtl ? "rtl text-right" : "ltr text-left"}`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Link to="/" className="w-fit">
              <img alt="Evogym logo" src={Logo} />
            </Link>
            <span className="rounded-full bg-primary-100 border border-primary-500 px-3 py-1 text-xs font-bold text-primary-300">
              {t("admin_portal")}
            </span>
          </div>

          <button
            className="rounded-md bg-secondary-500 px-8 py-2 font-bold text-white transition duration-300 hover:bg-primary-500"
            onClick={handleLogout}
            type="button"
          >
            {t("admin_logout")}
          </button>
        </header>

        {/* TAB CONTROLS */}
        <div
          {...tabBarProps}
          className="flex overflow-x-auto border-b border-gray-100 bg-gray-50 rounded-t-md px-4 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus:outline-none"
        >
          <button
            className={`shrink-0 whitespace-nowrap px-6 py-3 font-bold text-sm border-b-2 transition-colors ${
              activeTab === "members"
                ? "border-secondary-500 text-secondary-500"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("members")}
          >
            {t("admin_tab_members")}
          </button>
          <button
            className={`shrink-0 whitespace-nowrap px-6 py-3 font-bold text-sm border-b-2 transition-colors ${
              activeTab === "coaches"
                ? "border-secondary-500 text-secondary-500"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("coaches")}
          >
            {t("admin_tab_coaches")}
          </button>
          <button
            className={`shrink-0 whitespace-nowrap px-6 py-3 font-bold text-sm border-b-2 transition-colors ${
              activeTab === "subscriptions"
                ? "border-secondary-500 text-secondary-500"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("subscriptions")}
          >
            {t("admin_tab_subscriptions")}
          </button>
          <button
            className={`shrink-0 whitespace-nowrap px-6 py-3 font-bold text-sm border-b-2 transition-colors ${
              activeTab === "equipment"
                ? "border-secondary-500 text-secondary-500"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("equipment")}
          >
            {t("admin_tab_equipment")}
          </button>
          <button
            className={`relative shrink-0 whitespace-nowrap px-6 py-3 font-bold text-sm border-b-2 transition-colors ${
              activeTab === "inbox"
                ? "border-secondary-500 text-secondary-500"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("inbox")}
          >
            {t("admin_tab_inbox")}
            {unreadCount > 0 && (
              <span className={`absolute -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-[10px] font-black text-white ${isRtl ? "-left-1" : "-right-1"}`}>
                {unreadCount}
              </span>
            )}
          </button>
          <button
            className={`shrink-0 whitespace-nowrap px-6 py-3 font-bold text-sm border-b-2 transition-colors ${
              activeTab === "classes"
                ? "border-secondary-500 text-secondary-500"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("classes")}
          >
            {t("admin_tab_classes")}
          </button>
        </div>

        {/* TAB BODY */}
        <section className="overflow-hidden rounded-b-md border-2 border-t-0 border-gray-100 bg-gray-50 px-4 py-8 sm:px-8 sm:py-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
          {/* MEMBERS TAB */}
          {activeTab === "members" && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 animate-slide-down">{t("admin_members_heading")}</h2>
              <div className="max-w-full overflow-x-auto">
                <table className={`min-w-[760px] ${isRtl ? "text-right" : "text-left"} border-collapse`}>
                  <thead>
                    <tr className="border-b border-gray-100 text-sm font-bold text-gray-300 bg-primary-100">
                      <th className="py-3 px-4">{t("admin_col_name")}</th>
                      <th className="py-3 px-4">{t("admin_col_email")}</th>
                      <th className="py-3 px-4">{t("admin_col_tier")}</th>
                      <th className="py-3 px-4">{t("admin_col_expires")}</th>
                      <th className="py-3 px-4">{t("admin_col_actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users
                      .filter((u) => u.role === "member")
                      .map((m) => {
                        const isExpired =
                          m.subscriptionExpiresAt &&
                          new Date(m.subscriptionExpiresAt).getTime() < Date.now();
                        return (
                          <tr key={m.email} className="border-b border-gray-100 hover:bg-primary-100/30 text-sm text-gray-300">
                            <td className="py-3 px-4 font-semibold text-white">{m.name}</td>
                            <td className="py-3 px-4">{m.email}</td>
                            <td className="py-3 px-4">
                              <select
                                value={m.membershipStatus}
                                onChange={(e) => handleTierChange(m.email, e.target.value)}
                                className="rounded border border-gray-100 bg-gray-50 text-white px-2 py-1 font-semibold text-xs outline-none"
                              >
                                <option value="None" className="bg-gray-50">{t("profile_status_none")}</option>
                                {subscriptionPlans.map((plan) => (
                                  <option value={plan.name} className="bg-gray-50" key={plan.id}>
                                    {formatPlanName(plan.name, language)}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="py-3 px-4">
                              {m.subscriptionExpiresAt ? (
                                <span className={isExpired ? "text-primary-500 font-bold" : "text-gray-300"}>
                                  {new Date(m.subscriptionExpiresAt).toLocaleDateString()}
                                  {isExpired ? t("admin_expired") : ""}
                                </span>
                              ) : (
                                t("admin_no_plan")
                              )}
                            </td>
                            <td className="py-3 px-4 flex flex-wrap gap-2">
                              <button
                                onClick={() => adjustDays(m.email, 7)}
                                className="rounded bg-primary-100 hover:bg-primary-300 border border-primary-500/20 text-primary-300 px-2 py-1 text-xs font-bold"
                              >
                                {t("admin_add_days")}
                              </button>
                              <button
                                onClick={() => adjustDays(m.email, -7)}
                                className="rounded bg-gray-100/10 hover:bg-gray-100/20 border border-gray-500/20 text-gray-300 px-2 py-1 text-xs font-bold"
                              >
                                {t("admin_remove_days")}
                              </button>
                              <button
                                onClick={() => deleteUser(m.email)}
                                className="rounded bg-red-950/60 hover:bg-red-900 border border-red-500/30 text-red-400 px-2 py-1 text-xs font-bold"
                              >
                                {t("admin_delete")}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUBSCRIPTIONS TAB */}
          {activeTab === "subscriptions" && (
            <div className="flex flex-col gap-10">
              <div className="rounded-md border border-gray-100 p-6 bg-primary-100">
                <h3 className="text-lg font-bold text-white mb-4">
                  {editingPlan ? `${t("admin_edit_plan")}${editingPlan.name}` : t("admin_add_plan")}
                </h3>
                <form
                  onSubmit={editingPlan ? handleSavePlanEdit : handleAddPlan}
                  className="grid gap-4 md:grid-cols-3"
                >
                  <label className="flex flex-col gap-1 text-xs font-bold text-gray-300">
                    {t("admin_plan_name")}
                    <input
                      type="text"
                      value={editingPlan ? editingPlan.name : planName}
                      onChange={(e) =>
                        editingPlan
                          ? setEditingPlan({ ...editingPlan, name: e.target.value })
                          : setPlanName(e.target.value)
                      }
                      className="rounded border border-gray-100 bg-gray-50 text-white px-3 py-2 font-normal text-sm outline-none focus:border-primary-300"
                      placeholder={t("admin_plan_placeholder")}
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-bold text-gray-300">
                    {t("admin_plan_price")}
                    <input
                      type="number"
                      min={0}
                      value={editingPlan ? editingPlan.price : planPrice}
                      onChange={(e) =>
                        editingPlan
                          ? setEditingPlan({ ...editingPlan, price: parseInt(e.target.value) || 0 })
                          : setPlanPrice(parseInt(e.target.value) || 0)
                      }
                      className="rounded border border-gray-100 bg-gray-50 text-white px-3 py-2 font-normal text-sm outline-none focus:border-primary-300"
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-bold text-gray-300 md:col-span-3">
                    {t("admin_description")}
                    <textarea
                      rows={3}
                      value={editingPlan ? editingPlan.description : planDescription}
                      onChange={(e) =>
                        editingPlan
                          ? setEditingPlan({ ...editingPlan, description: e.target.value })
                          : setPlanDescription(e.target.value)
                      }
                      className="rounded border border-gray-100 bg-gray-50 text-white px-3 py-2 font-normal text-sm outline-none focus:border-primary-300"
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-bold text-gray-300 md:col-span-3">
                    {t("admin_features")}
                    <textarea
                      rows={4}
                      value={
                        editingPlan ? editingPlan.features.join("\n") : planFeatures
                      }
                      onChange={(e) =>
                        editingPlan
                          ? setEditingPlan({
                              ...editingPlan,
                              features: parseFeatures(e.target.value),
                            })
                          : setPlanFeatures(e.target.value)
                      }
                      className="rounded border border-gray-100 bg-gray-50 text-white px-3 py-2 font-normal text-sm outline-none focus:border-primary-300"
                      placeholder={t("admin_feature_placeholder")}
                    />
                  </label>

                  <div className="flex gap-3 md:col-span-3">
                    <button
                      type="submit"
                      className="rounded bg-secondary-500 hover:bg-primary-500 text-white font-bold px-6 py-2 text-sm"
                    >
                      {editingPlan ? t("admin_save") : t("admin_add_btn")}
                    </button>
                    {editingPlan && (
                      <button
                        type="button"
                        onClick={() => setEditingPlan(null)}
                        className="rounded bg-gray-100/10 hover:bg-gray-100/20 text-gray-300 font-bold px-6 py-2 text-sm"
                      >
                        {t("admin_cancel")}
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {subscriptionPlans.map((plan) => {
                  const displayedPlan = getLocalizedPlanContent(plan, language);

                  return (
                    <article
                    className="rounded-md border border-gray-100 bg-primary-100 p-5"
                    key={plan.id}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-montserrat text-3xl uppercase text-primary-300">
                          {displayedPlan.name}
                        </h4>
                        <p className={`mt-2 text-2xl font-bold text-white ${isRtl ? "numbers" : ""}`}>
                          {plan.price.toLocaleString("fr-DZ")} DA {t("plans_monthly")}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => setEditingPlan(plan)}
                          className="rounded bg-gray-100/10 hover:bg-gray-100/20 border border-gray-500/20 text-gray-300 px-2 py-1 text-xs font-bold"
                        >
                          {t("admin_edit")}
                        </button>
                        <button
                          onClick={() => deleteSubscriptionPlan(plan.id)}
                          className="rounded bg-red-950/60 hover:bg-red-900 border border-red-500/20 text-red-400 px-2 py-1 text-xs font-bold"
                        >
                          {t("admin_delete")}
                        </button>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-gray-400">{displayedPlan.description}</p>
                    <ul className="mt-4 flex flex-col gap-2 text-sm text-gray-300">
                      {displayedPlan.features.map((feature) => (
                        <li className="border-b border-gray-100 pb-2" key={feature}>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {/* COACHES TAB */}
          {activeTab === "coaches" && (
            <div className="flex flex-col gap-10">
              {/* ADD/EDIT COACH FORM */}
              <div className="rounded-md border border-gray-100 p-6 bg-primary-100">
                <h3 className="text-lg font-bold text-white mb-4">
                  {editingCoach ? `${t("admin_edit_coach")}${editingCoach.name}` : t("admin_add_coach")}
                </h3>
                <form
                  onSubmit={editingCoach ? handleSaveCoachEdit : handleAddCoach}
                  className="grid gap-4 md:grid-cols-3"
                >
                  <label className="flex flex-col gap-1 text-xs font-bold text-gray-300">
                    {t("admin_coach_name")}
                    <input
                      type="text"
                      value={editingCoach ? editingCoach.name : coachName}
                      onChange={(e) =>
                        editingCoach
                          ? setEditingCoach({ ...editingCoach, name: e.target.value })
                          : setCoachName(e.target.value)
                      }
                      className="rounded border border-gray-100 bg-gray-50 text-white px-3 py-2 font-normal text-sm outline-none focus:border-primary-300"
                      placeholder={t("admin_coach_name_placeholder")}
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-bold text-gray-300">
                    {t("admin_coach_spec")}
                    <input
                      type="text"
                      value={editingCoach ? editingCoach.specialization : coachSpec}
                      onChange={(e) =>
                        editingCoach
                          ? setEditingCoach({ ...editingCoach, specialization: e.target.value })
                          : setCoachSpec(e.target.value)
                      }
                      className="rounded border border-gray-100 bg-gray-50 text-white px-3 py-2 font-normal text-sm outline-none focus:border-primary-300"
                      placeholder={t("admin_coach_spec_placeholder")}
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-bold text-gray-300">
                    {t("admin_coach_email")}
                    <input
                      type="email"
                      value={editingCoach ? editingCoach.email : coachEmail}
                      onChange={(e) => editingCoach ? setEditingCoach({ ...editingCoach, email: e.target.value }) : setCoachEmail(e.target.value)}
                      className="rounded border border-gray-100 bg-gray-50 text-white px-3 py-2 font-normal text-sm outline-none focus:border-primary-300"
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-bold text-gray-300 md:col-span-3">
                    {t("admin_coach_password")}
                    <input
                      type="password"
                      value={coachPassword}
                      onChange={(e) => setCoachPassword(e.target.value)}
                      className="rounded border border-gray-100 bg-gray-50 text-white px-3 py-2 font-normal text-sm outline-none focus:border-primary-300"
                      placeholder={editingCoach?.accountActive ? t("admin_coach_password_hint") : ""}
                      required={!editingCoach?.accountActive}
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-bold text-gray-300 md:col-span-3">
                    {t("admin_coach_bio")}
                    <textarea
                      rows={3}
                      value={editingCoach ? editingCoach.bio : coachBio}
                      onChange={(e) =>
                        editingCoach
                          ? setEditingCoach({ ...editingCoach, bio: e.target.value })
                          : setCoachBio(e.target.value)
                      }
                      className="rounded border border-gray-100 bg-gray-50 text-white px-3 py-2 font-normal text-sm outline-none focus:border-primary-300"
                      placeholder={t("admin_coach_bio_placeholder")}
                    />
                  </label>

                  {coachError && <p className="text-sm font-bold text-primary-500 md:col-span-3">{coachError}</p>}

                  <div className="flex gap-3 md:col-span-3">
                    <button
                      type="submit"
                      className="rounded bg-secondary-500 hover:bg-primary-500 text-white font-bold px-6 py-2 text-sm"
                    >
                      {editingCoach ? t("admin_save") : t("admin_add_coach_btn")}
                    </button>
                    {editingCoach && (
                      <button
                        type="button"
                        onClick={() => { setEditingCoach(null); setCoachPassword(""); setCoachError(""); }}
                        className="rounded bg-gray-100/10 hover:bg-gray-150 text-gray-300 font-bold px-6 py-2 text-sm"
                      >
                        {t("admin_cancel")}
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* COACHES LIST */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4">{t("admin_coaches_heading")}</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {coaches.map((c) => (
                    <div key={c.id} className="rounded border border-gray-100 bg-primary-100 p-5 flex justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-primary-300 text-lg">{c.name}</h4>
                        <span className="inline-block rounded bg-primary-100 border border-primary-500/10 px-2 py-0.5 text-xs font-semibold text-primary-300 mt-1">
                          {c.specialization}
                        </span>
                        <p className="text-sm text-gray-400 mt-3">{c.bio}</p>
                        <p className="mt-3 text-xs text-gray-500">{c.email || t("admin_coach_account_inactive")}</p>
                        <p className={`mt-1 text-xs font-bold ${c.accountActive ? "text-green-400" : "text-gray-500"}`}>
                          {c.accountActive ? t("admin_coach_account_active") : t("admin_coach_account_inactive")}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <button
                          onClick={() => { setEditingCoach(c); setCoachPassword(""); setCoachError(""); }}
                          className="rounded bg-gray-100/10 hover:bg-gray-100/20 border border-gray-500/20 text-gray-300 font-bold px-3 py-1 text-xs"
                        >
                          {t("admin_edit")}
                        </button>
                        <button
                          onClick={() => deleteCoach(c.id)}
                          className="rounded bg-red-950/60 hover:bg-red-900 border border-red-500/20 text-red-400 font-bold px-3 py-1 text-xs"
                        >
                          {t("admin_delete")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* EQUIPMENT TAB */}
          {activeTab === "equipment" && (
            <div className="flex flex-col gap-10">
              {/* ADD/EDIT EQUIPMENT FORM */}
              <div className="rounded-md border border-gray-100 p-6 bg-primary-100">
                <h3 className="text-lg font-bold text-white mb-4">
                  {editingEq ? `${t("admin_edit_equipment")}${editingEq.name}` : t("admin_add_equipment")}
                </h3>
                <form
                  onSubmit={editingEq ? handleSaveEqEdit : handleAddEquipment}
                  className="grid gap-4 md:grid-cols-4"
                >
                  <label className="flex flex-col gap-1 text-xs font-bold text-gray-300">
                    {t("admin_eq_name")}
                    <input
                      type="text"
                      value={editingEq ? editingEq.name : eqName}
                      onChange={(e) =>
                        editingEq
                          ? setEditingEq({ ...editingEq, name: e.target.value })
                          : setEqName(e.target.value)
                      }
                      className="rounded border border-gray-100 bg-gray-50 text-white px-3 py-2 font-normal text-sm outline-none focus:border-primary-300"
                      placeholder={t("admin_equipment_placeholder")}
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-bold text-gray-300">
                    {t("admin_eq_type")}
                    <select
                      value={editingEq ? editingEq.type : eqType}
                      onChange={(e) =>
                        editingEq
                          ? setEditingEq({ ...editingEq, type: e.target.value as any })
                          : setEqType(e.target.value as any)
                      }
                      className="rounded border border-gray-100 bg-gray-50 text-white px-3 py-2 font-normal text-sm outline-none focus:border-primary-300"
                    >
                      <option value="Strength" className="bg-gray-50">{equipmentTypeLabels.Strength}</option>
                      <option value="Cardio" className="bg-gray-50">{equipmentTypeLabels.Cardio}</option>
                      <option value="Accessories" className="bg-gray-50">{equipmentTypeLabels.Accessories}</option>
                      <option value="Other" className="bg-gray-50">{equipmentTypeLabels.Other}</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-bold text-gray-300">
                    {t("admin_eq_qty")}
                    <input
                      type="number"
                      min={1}
                      value={editingEq ? editingEq.quantity : eqQty}
                      onChange={(e) =>
                        editingEq
                          ? setEditingEq({ ...editingEq, quantity: parseInt(e.target.value) || 1 })
                          : setEqQty(parseInt(e.target.value) || 1)
                      }
                      className="rounded border border-gray-100 bg-gray-50 text-white px-3 py-2 font-normal text-sm outline-none focus:border-primary-300"
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-bold text-gray-300">
                    {t("admin_eq_status")}
                    <select
                      value={editingEq ? editingEq.status : eqStatus}
                      onChange={(e) =>
                        editingEq
                          ? setEditingEq({ ...editingEq, status: e.target.value as any })
                          : setEqStatus(e.target.value as any)
                      }
                      className="rounded border border-gray-100 bg-gray-50 text-white px-3 py-2 font-normal text-sm outline-none focus:border-primary-300"
                    >
                      <option value="Operational" className="bg-gray-50">{equipmentStatusLabels.Operational}</option>
                      <option value="Under Maintenance" className="bg-gray-50">{equipmentStatusLabels["Under Maintenance"]}</option>
                    </select>
                  </label>

                  <div className="flex gap-3 md:col-span-4 mt-2">
                    <button
                      type="submit"
                      className="rounded bg-secondary-500 hover:bg-primary-500 text-white font-bold px-6 py-2 text-sm"
                    >
                      {editingEq ? t("admin_save") : t("admin_add_eq_btn")}
                    </button>
                    {editingEq && (
                      <button
                        type="button"
                        onClick={() => setEditingEq(null)}
                        className="rounded bg-gray-100/10 hover:bg-gray-150 text-gray-300 font-bold px-6 py-2 text-sm"
                      >
                        {t("admin_cancel")}
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* EQUIPMENT TABLE */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4">{t("admin_equipment_heading")}</h3>
                <div className="max-w-full overflow-x-auto">
                  <table className={`min-w-[720px] ${isRtl ? "text-right" : "text-left"} border-collapse`}>
                    <thead>
                      <tr className="border-b border-gray-100 text-sm font-bold text-gray-300 bg-primary-100">
                        <th className="py-3 px-4">{t("admin_col_name")}</th>
                        <th className="py-3 px-4">{t("admin_eq_type")}</th>
                        <th className="py-3 px-4">{t("admin_eq_qty")}</th>
                        <th className="py-3 px-4">{t("admin_eq_status")}</th>
                        <th className="py-3 px-4">{t("admin_col_actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {equipment.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100 hover:bg-primary-100/50 text-sm text-gray-300">
                          <td className="py-3 px-4 font-semibold text-white">{item.name}</td>
                          <td className="py-3 px-4">{equipmentTypeLabels[item.type]}</td>
                          <td className={`py-3 px-4 ${isRtl ? "numbers" : ""}`}>{item.quantity}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${
                                item.status === "Operational"
                                  ? "bg-green-955/60 text-green-400 border border-green-900/50"
                                  : "bg-orange-955/60 text-orange-400 border border-orange-900/50"
                              }`}
                            >
                            {equipmentStatusLabels[item.status]}
                            </span>
                          </td>
                          <td className="py-3 px-4 flex gap-2">
                            <button
                              onClick={() => setEditingEq(item)}
                              className="rounded bg-gray-100/10 hover:bg-gray-100/20 border border-gray-500/20 text-gray-300 px-2 py-1 text-xs font-bold"
                            >
                              {t("admin_edit")}
                            </button>
                            <button
                              onClick={() => deleteEquipment(item.id)}
                              className="rounded bg-red-950/60 hover:bg-red-900 border border-red-500/20 text-red-400 px-2 py-1 text-xs font-bold"
                            >
                              {t("admin_delete")}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* INBOX TAB */}
          {activeTab === "inbox" && (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-primary-300 uppercase tracking-wider">{t("admin_tab_inbox")}</p>
                  <h2 className="mt-1 text-2xl font-bold text-white">
                    {t("admin_tab_inbox")}
                    {unreadCount > 0 && (
                      <span className={`inline-flex items-center rounded-full bg-primary-500/20 border border-primary-500/40 px-3 py-0.5 text-sm font-bold text-primary-300 ${isRtl ? "mr-3" : "ml-3"}`}>
                        {unreadCount} {t("admin_tab_inbox")}
                      </span>
                    )}
                  </h2>
                </div>
              </div>

              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-gray-100 bg-primary-100 py-20 text-center">
                  <svg className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  <p className="text-gray-400 font-semibold">{t("admin_tab_inbox")}</p>
                  <p className="text-sm text-gray-500">{t("admin_inbox_empty")}</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {messages.map((msg) => (
                    <article
                      key={msg.id}
                      className={`rounded-md border p-5 transition duration-200 ${
                        msg.read
                          ? "border-gray-100 bg-primary-100"
                          : "border-primary-500/40 bg-primary-100 shadow-[0_0_0_1px_rgba(255,0,0,0.1)]"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          {!msg.read && (
                            <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary-500" />
                          )}
                          <div>
                            <p className="font-bold text-white">{msg.name}</p>
                            <p className="text-sm text-gray-400">{msg.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {new Date(msg.receivedAt).toLocaleString("fr-DZ", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <button
                            onClick={() => markMessageRead(msg.id, !msg.read)}
                            className="rounded bg-gray-100/10 hover:bg-gray-100/20 border border-gray-500/20 text-gray-300 px-2 py-1 text-xs font-bold"
                          >
                            {msg.read ? t("admin_tab_inbox") : t("admin_mark_read")}
                          </button>
                          <button
                            onClick={() => deleteMessage(msg.id)}
                            className="rounded bg-red-950/60 hover:bg-red-900 border border-red-500/30 text-red-400 px-2 py-1 text-xs font-bold"
                          >
                            {t("admin_delete")}
                          </button>
                        </div>
                      </div>
                      <p className="mt-4 rounded-md bg-gray-20 px-4 py-3 text-sm leading-relaxed text-gray-300">
                        {msg.message}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MANAGE CLASSES TAB */}
          {activeTab === "classes" && (
            <ClassManagerPanel
              gymClasses={gymClasses}
              addGymClass={addGymClass}
              editGymClass={editGymClass}
              deleteGymClass={deleteGymClass}
              coaches={coaches}
              assignCoachToClass={assignCoachToClass}
              addClassSchedule={addClassSchedule}
              editClassSchedule={editClassSchedule}
              deleteClassSchedule={deleteClassSchedule}
              isRtl={isRtl}
            />
          )}

            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
};

export default AdminDashboard;

/* ── Class Manager Panel ─────────────────────────────────────── */
type ClassManagerProps = {
  gymClasses: GymClass[];
  coaches: Coach[];
  addGymClass: (name: string, description: string, image: string) => void;
  editGymClass: (id: string, name: string, description: string, image: string) => void;
  deleteGymClass: (id: string) => void;
  assignCoachToClass: (classId: string, coachId: string | null) => void;
  addClassSchedule: React.ComponentProps<typeof ClassScheduleEditor>["addSlot"];
  editClassSchedule: React.ComponentProps<typeof ClassScheduleEditor>["editSlot"];
  deleteClassSchedule: React.ComponentProps<typeof ClassScheduleEditor>["deleteSlot"];
  isRtl: boolean;
};

const ClassManagerPanel = ({
  gymClasses,
  coaches,
  addGymClass,
  editGymClass,
  deleteGymClass,
  assignCoachToClass,
  addClassSchedule,
  editClassSchedule,
  deleteClassSchedule,
  isRtl,
}: ClassManagerProps) => {
  const { t } = useLanguage();
  const [editingClass, setEditingClass] = useState<GymClass | null>(null);
  const [className, setClassName] = useState("");
  const [classDesc, setClassDesc] = useState("");
  const [classImage, setClassImage] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setClassImage(result);
      setPreviewUrl(result);
      if (editingClass) setEditingClass({ ...editingClass, image: result });
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setEditingClass(null);
    setClassName("");
    setClassDesc("");
    setClassImage("");
    setPreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startEdit = (c: GymClass) => {
    setEditingClass(c);
    setClassName(c.name);
    setClassDesc(c.description);
    setClassImage(c.image);
    setPreviewUrl(c.image);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const img = editingClass ? editingClass.image : classImage;
    if (!className || !classDesc || !img) return;
    if (editingClass) {
      editGymClass(editingClass.id, editingClass.name === className ? className : className, classDesc, img);
    } else {
      addGymClass(className, classDesc, img);
    }
    resetForm();
  };

  const currentPreview = editingClass ? editingClass.image : previewUrl;

  return (
    <div className="flex flex-col gap-10">
      {/* FORM */}
      <div className="rounded-md border border-gray-100 bg-primary-100 p-6">
        <h3 className="mb-4 text-lg font-bold text-white">
          {editingClass ? `${t("admin_edit_class")}${editingClass.name}` : t("admin_add_class")}
        </h3>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          {/* IMAGE UPLOAD */}
          <div className={`flex flex-col gap-3 md:row-span-3 ${isRtl ? "md:order-2" : ""}`}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-gray-100 bg-gray-20">
              {currentPreview ? (
                <img
                  src={currentPreview}
                  alt="Class preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-gray-500">
                  <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 19.5h16.5M13.5 3.75h.008v.008H13.5V3.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  <p className="text-sm">{t("admin_no_image")}</p>
                </div>
              )}
            </div>
            <label className="cursor-pointer rounded-md bg-secondary-500 px-4 py-2 text-center text-sm font-bold text-white transition duration-300 hover:bg-primary-500">
              {currentPreview ? t("admin_change_image") : t("admin_upload_image")}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          </div>

          {/* NAME + DESC */}
          <label className={`flex flex-col gap-1 text-xs font-bold text-gray-300 ${isRtl ? "md:order-1" : ""}`}>
            {t("admin_class_name")}
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="rounded border border-gray-100 bg-gray-50 text-white px-3 py-2 font-normal text-sm outline-none focus:border-primary-300"
              placeholder={t("admin_class_name_placeholder")}
              required
            />
          </label>

          <label className={`flex flex-col gap-1 text-xs font-bold text-gray-300 md:col-start-2 ${isRtl ? "md:order-3" : ""}`}>
            {t("admin_class_desc")}
            <textarea
              rows={5}
              value={classDesc}
              onChange={(e) => setClassDesc(e.target.value)}
              className="rounded border border-gray-100 bg-gray-50 text-white px-3 py-2 font-normal text-sm outline-none focus:border-primary-300"
              placeholder={t("admin_class_desc_placeholder")}
              required
            />
          </label>

          <div className={`flex gap-3 md:col-start-2 ${isRtl ? "md:order-4" : ""}`}>
            <button
              type="submit"
              className="rounded bg-secondary-500 hover:bg-primary-500 text-white font-bold px-6 py-2 text-sm"
            >
              {editingClass ? t("admin_save") : t("admin_add_class_btn")}
            </button>
            {editingClass && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded bg-gray-100/10 hover:bg-gray-100/20 text-gray-300 font-bold px-6 py-2 text-sm"
              >
                {t("admin_cancel")}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* CLASS GRID */}
      <div>
        <h3 className="mb-4 text-xl font-bold text-white">
          {t("admin_classes_heading")} ({gymClasses.length})
        </h3>
        <div className="grid gap-4 lg:grid-cols-2">
          {gymClasses.map((c) => (
            <article
              key={c.id}
              className={`overflow-hidden rounded-md border bg-primary-100 transition duration-200 ${
                editingClass?.id === c.id
                  ? "border-secondary-500"
                  : "border-gray-100"
              }`}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={c.image}
                  alt={c.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-4">
                <p className="font-montserrat text-sm font-bold uppercase tracking-wide text-primary-300">
                  {c.name}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-gray-400">{c.description}</p>
                <label className="mt-4 flex flex-col gap-1 text-xs font-bold text-gray-400">
                  {t("admin_assign_coach")}
                  <select
                    className="rounded border border-gray-100 bg-gray-50 px-3 py-2 text-white"
                    value={c.coachId ?? ""}
                    onChange={(event) => assignCoachToClass(c.id, event.target.value || null)}
                  >
                    <option className="bg-gray-50" value="">{t("admin_unassigned")}</option>
                    {coaches.map((coach) => <option className="bg-gray-50" key={coach.id} value={coach.id}>{coach.name}</option>)}
                  </select>
                </label>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => startEdit(c)}
                    className="rounded bg-gray-100/10 hover:bg-gray-100/20 border border-gray-500/20 text-gray-300 px-3 py-1 text-xs font-bold"
                  >
                    {t("admin_edit")}
                  </button>
                  <button
                    onClick={() => deleteGymClass(c.id)}
                    className="rounded bg-red-950/60 hover:bg-red-900 border border-red-500/30 text-red-400 px-3 py-1 text-xs font-bold"
                  >
                    {t("admin_delete")}
                  </button>
                </div>
                <ClassScheduleEditor gymClass={c} addSlot={addClassSchedule} editSlot={editClassSchedule} deleteSlot={deleteClassSchedule} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};
