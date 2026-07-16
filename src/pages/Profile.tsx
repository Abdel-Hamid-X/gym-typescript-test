import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Logo from "@/assets/Logo.png";
import { useAuth } from "@/auth/AuthContext";
import { useScrollableTabs } from "@/shared/useScrollableTabs";
import { formatPlanName, useLanguage } from "@/shared/LanguageContext";

const Profile = () => {
  const {
    user,
    coaches,
    equipment,
    logout,
    updateCurrentUserProfile,
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

  const [activeTab, setActiveTab] = useState<"dashboard" | "profile" | "coaches" | "equipment">("dashboard");
  const tabBarProps = useScrollableTabs();
  const [timeLeft, setTimeLeft] = useState("");
  const [profileName, setProfileName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [personalGoals, setPersonalGoals] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [profileMessage, setProfileMessage] = useState("");

  useEffect(() => {
    if (!user) return;

    setProfileName(user.name);
    setPhoneNumber(user.phoneNumber ?? "");
    setPersonalGoals(user.personalGoals ?? "");
    setAvatarUrl(user.avatarUrl ?? "");
  }, [user]);

  useEffect(() => {
    if (!user?.subscriptionExpiresAt) {
      setTimeLeft(t("profile_no_timer"));
      return;
    }

    const updateTimer = () => {
      const expiry = new Date(user.subscriptionExpiresAt!).getTime();
      const now = new Date().getTime();
      const difference = expiry - now;

      if (difference <= 0) {
        setTimeLeft(t("profile_expired"));
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(
        language === "ar"
          ? `${days} يوم ${hours} س ${minutes} د ${seconds} ث`
          : `${days}d ${hours}h ${minutes}m ${seconds}s`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [user?.subscriptionExpiresAt, language]);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    updateCurrentUserProfile({
      name: profileName.trim() || user.name,
      phoneNumber,
      personalGoals,
      avatarUrl,
    });
    setProfileMessage(t("profile_updated_toast"));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrl(typeof reader.result === "string" ? reader.result : "");
    };
    reader.readAsDataURL(file);
  };

  return (
    <main
      className={`min-h-screen bg-gray-20 px-6 py-10 text-white ${isRtl ? "rtl text-right" : "ltr text-left"}`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <header className="flex items-center justify-between gap-6">
          <Link to="/" className="w-fit">
            <img alt="Evogym logo" src={Logo} />
          </Link>

          <button
            className="rounded-md bg-secondary-500 px-8 py-2 font-bold text-white transition duration-300 hover:bg-primary-500"
            onClick={handleLogout}
            type="button"
          >
            {t("nav_logout")}
          </button>
        </header>

        {/* TAB NAVIGATION */}
        <div
          {...tabBarProps}
          className="flex overflow-x-auto border-b border-gray-100 bg-gray-50 rounded-t-md px-4 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus:outline-none"
        >
          <button
            className={`shrink-0 whitespace-nowrap px-6 py-3 font-bold text-sm transition-colors duration-200 border-b-2 ${
              activeTab === "dashboard"
                ? "border-secondary-500 text-secondary-500"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("dashboard")}
          >
            {t("profile_tab_dash")}
          </button>
          <button
            className={`shrink-0 whitespace-nowrap px-6 py-3 font-bold text-sm transition-colors duration-200 border-b-2 ${
              activeTab === "profile"
                ? "border-secondary-500 text-secondary-500"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            {t("profile_tab_settings")}
          </button>
          <button
            className={`shrink-0 whitespace-nowrap px-6 py-3 font-bold text-sm transition-colors duration-200 border-b-2 ${
              activeTab === "coaches"
                ? "border-secondary-500 text-secondary-500"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("coaches")}
          >
            {t("profile_tab_coaches")}
          </button>
          <button
            className={`shrink-0 whitespace-nowrap px-6 py-3 font-bold text-sm transition-colors duration-200 border-b-2 ${
              activeTab === "equipment"
                ? "border-secondary-500 text-secondary-500"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("equipment")}
          >
            {t("profile_tab_equipment")}
          </button>
        </div>

        <section className="rounded-b-md border-2 border-t-0 border-gray-100 bg-gray-50 px-8 py-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {/* DASHBOARD TAB */}
              {activeTab === "dashboard" && (
            <div>
              <p className="text-sm font-bold text-primary-300 uppercase tracking-wider">{t("profile_title")}</p>
              <h1 className="mt-2 font-montserrat text-3xl font-bold text-white">
                {t("profile_welcome")}{user?.name}
              </h1>

              <div className="mt-8 grid gap-5 md:grid-cols-3">
                <div className="rounded-md bg-primary-100 p-5 border border-gray-100">
                  <p className="text-sm font-bold text-gray-400">{t("profile_email")}</p>
                  <p className="mt-2 font-semibold text-white">{user?.email}</p>
                </div>

                <div className="rounded-md bg-primary-100 p-5 border border-gray-100">
                  <p className="text-sm font-bold text-gray-400">{t("profile_tier")}</p>
                  <p className="mt-2 text-xl font-black text-primary-300">
                    {user?.membershipStatus === "None"
                      ? t("profile_status_none")
                      : formatPlanName(user?.membershipStatus ?? "", language)}
                  </p>
                </div>

                <div className="rounded-md bg-primary-100 p-5 border border-gray-100">
                  <p className="text-sm font-bold text-gray-400">{t("profile_time_remaining")}</p>
                  <p className={`mt-2 font-mono text-lg font-bold text-secondary-400 ${isRtl ? "numbers" : ""}`}>
                    {timeLeft}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  className="rounded-md bg-primary-500 px-8 py-3 font-bold text-white transition duration-300 hover:bg-secondary-500"
                  to="/#ourclasses"
                >
                  {t("profile_explore_classes")}
                </Link>
                <Link
                  className="rounded-md border-2 border-primary-500 px-8 py-3 font-bold text-primary-300 transition duration-300 hover:bg-primary-500 hover:text-white"
                  to="/#contactus"
                >
                  {t("profile_contact_support")}
                </Link>
              </div>
            </div>
              )}

              {/* PROFILE SETTINGS TAB */}
              {activeTab === "profile" && (
            <div>
              <p className="text-sm font-bold text-primary-300 uppercase tracking-wider">{t("profile_settings_title")}</p>
              <h2 className="mt-2 text-2xl font-bold text-white mb-6">{t("profile_edit_heading")}</h2>

              <form onSubmit={handleProfileSubmit} className={`grid gap-8 md:grid-cols-[220px_1fr]`}>
                <div className={`flex flex-col items-center gap-4 rounded-md border border-gray-100 bg-primary-100 p-6 ${isRtl ? "md:order-2" : "md:order-1"}`}>
                  <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-2 border-primary-500 bg-gray-20">
                    {avatarUrl ? (
                      <img
                        alt="Member avatar"
                        className="h-full w-full object-cover"
                        src={avatarUrl}
                      />
                    ) : (
                      <span className="font-montserrat text-5xl uppercase text-primary-300">
                        {profileName.charAt(0) || "M"}
                      </span>
                    )}
                  </div>

                  <label className="w-full cursor-pointer rounded-md bg-secondary-500 px-4 py-2 text-center text-sm font-bold text-white transition duration-300 hover:bg-primary-500">
                    {t("profile_upload_avatar")}
                    <input
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                      type="file"
                    />
                  </label>
                </div>

                <div className={`grid gap-5 ${isRtl ? "md:order-1" : "md:order-2"}`}>
                  <label className="flex flex-col gap-2 text-sm font-bold text-gray-300">
                    {t("profile_display_name")}
                    <input
                      className="rounded-md border border-gray-100 bg-primary-100 px-4 py-3 font-normal text-white outline-none focus:border-primary-300"
                      onChange={(e) => setProfileName(e.target.value)}
                      type="text"
                      value={profileName}
                    />
                  </label>

                  <label className="flex flex-col gap-2 text-sm font-bold text-gray-300">
                    {t("profile_phone")}
                    <input
                      className="rounded-md border border-gray-100 bg-primary-100 px-4 py-3 font-normal text-white outline-none focus:border-primary-300"
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                      placeholder="213..."
                      type="tel"
                      value={phoneNumber}
                    />
                  </label>

                  <label className="flex flex-col gap-2 text-sm font-bold text-gray-300">
                    {t("profile_goals")}
                    <textarea
                      className="min-h-[130px] rounded-md border border-gray-100 bg-primary-100 px-4 py-3 font-normal text-white outline-none focus:border-primary-300"
                      onChange={(e) => setPersonalGoals(e.target.value)}
                      placeholder={t("profile_goals_placeholder")}
                      value={personalGoals}
                    />
                  </label>

                  {profileMessage && (
                    <p className="text-sm font-bold text-primary-300">{profileMessage}</p>
                  )}

                  <button
                    className="w-fit rounded-md bg-secondary-500 px-8 py-3 font-bold text-white transition duration-300 hover:bg-primary-500"
                    type="submit"
                  >
                    {t("profile_save_profile")}
                  </button>
                </div>
              </form>
            </div>
              )}

              {/* COACHES TAB */}
              {activeTab === "coaches" && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">{t("profile_coaches_heading")}</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {coaches.map((coach) => (
                  <div key={coach.id} className="rounded-md border border-gray-100 bg-primary-100 p-6 hover:border-primary-300 transition-colors">
                    <h3 className="text-lg font-bold text-primary-300">{coach.name}</h3>
                    <p className="text-sm font-semibold text-gray-300 mt-1">{coach.specialization}</p>
                    <p className="text-sm text-gray-400 mt-3">{coach.bio}</p>
                  </div>
                ))}
              </div>
            </div>
              )}

              {/* EQUIPMENT TAB */}
              {activeTab === "equipment" && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">{t("profile_equipment_heading")}</h2>
              <div className="overflow-x-auto">
                <table className={`w-full ${isRtl ? "text-right" : "text-left"} border-collapse`}>
                  <thead>
                    <tr className="border-b border-gray-100 text-sm font-bold text-gray-300 bg-primary-100">
                      <th className="py-3 px-4">{t("profile_equip_name")}</th>
                      <th className="py-3 px-4">{t("profile_equip_category")}</th>
                      <th className="py-3 px-4">{t("profile_equip_qty")}</th>
                      <th className="py-3 px-4">{t("profile_equip_status")}</th>
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
                                ? "bg-green-950/60 text-green-400 border border-green-900/50"
                                : "bg-orange-950/60 text-orange-400 border border-orange-900/50"
                            }`}
                          >
                            {equipmentStatusLabels[item.status]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
              )}
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
};

export default Profile;
