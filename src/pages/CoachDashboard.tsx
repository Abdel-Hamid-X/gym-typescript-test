import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Logo from "@/assets/Logo.png";
import { useAuth } from "@/auth/AuthContext";
import { useLanguage } from "@/shared/LanguageContext";
import ClassScheduleEditor from "@/shared/ClassScheduleEditor";
import type { GymClass } from "@/shared/mockData";
import { useScrollableTabs } from "@/shared/useScrollableTabs";

type CoachTab = "overview" | "profile" | "classes" | "schedule";

const CoachDashboard = () => {
  const {
    user,
    coaches,
    gymClasses,
    logout,
    updateCoachProfile,
    editGymClass,
    addClassSchedule,
    editClassSchedule,
    deleteClassSchedule,
  } = useAuth();
  const { t, language } = useLanguage();
  const isRtl = language === "ar";
  const navigate = useNavigate();
  const coach = coaches.find((item) => item.id === user?.coachId);
  const assignedClasses = useMemo(() => gymClasses.filter((item) => item.coachId === coach?.id), [gymClasses, coach?.id]);
  const [activeTab, setActiveTab] = useState<CoachTab>("overview");
  const tabBarProps = useScrollableTabs();
  const [specialization, setSpecialization] = useState("");
  const [bio, setBio] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [message, setMessage] = useState("");
  const [editingClass, setEditingClass] = useState<GymClass | null>(null);

  useEffect(() => {
    if (!coach) return;
    setSpecialization(coach.specialization);
    setBio(coach.bio);
    setPhoneNumber(coach.phoneNumber);
    setAvatarUrl(coach.avatarUrl);
  }, [coach]);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const handleAvatar = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
  };

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!coach) return;
    await updateCoachProfile(coach.id, { specialization, bio, phoneNumber, avatarUrl });
    setMessage(t("coach_profile_saved"));
  };

  const saveClass = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingClass || !assignedClasses.some((item) => item.id === editingClass.id)) return;
    await editGymClass(editingClass.id, editingClass.name, editingClass.description, editingClass.image);
    setEditingClass(null);
    setMessage(t("coach_class_saved"));
  };

  const changeClassImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editingClass) return;
    const reader = new FileReader();
    reader.onload = () => setEditingClass({ ...editingClass, image: typeof reader.result === "string" ? reader.result : editingClass.image });
    reader.readAsDataURL(file);
  };

  const tabs: { id: CoachTab; label: string }[] = [
    { id: "overview", label: t("coach_tab_overview") },
    { id: "profile", label: t("coach_tab_profile") },
    { id: "classes", label: t("coach_tab_classes") },
    { id: "schedule", label: t("coach_tab_schedule") },
  ];

  return (
    <main className={`min-h-screen bg-gray-20 px-4 py-8 text-white sm:px-6 sm:py-10 ${isRtl ? "rtl text-right" : "ltr text-left"}`} dir={isRtl ? "rtl" : "ltr"}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <Link to="/"><img alt="EVOGYM" src={Logo} /></Link>
            <span className="rounded-full border border-primary-500 px-3 py-1 text-xs font-bold text-primary-300">{t("coach_portal")}</span>
          </div>
          <button className="rounded-md bg-secondary-500 px-7 py-2 font-bold hover:bg-primary-500" onClick={handleLogout}>{t("nav_logout")}</button>
        </header>

        <nav
          {...tabBarProps}
          className="flex cursor-grab overflow-x-auto rounded-t-md border-b border-gray-100 bg-gray-50 px-4 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus:outline-none"
        >
          {tabs.map((tab) => (
            <button className={`shrink-0 whitespace-nowrap border-b-2 px-6 py-3 text-sm font-bold ${activeTab === tab.id ? "border-secondary-500 text-secondary-500" : "border-transparent text-gray-400"}`} key={tab.id} onClick={() => { setActiveTab(tab.id); setMessage(""); }}>
              {tab.label}
            </button>
          ))}
        </nav>

        <section className="rounded-b-md border-2 border-t-0 border-gray-100 bg-gray-50 p-5 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {activeTab === "overview" && (
                <div>
                  <p className="text-sm font-bold text-primary-300">{t("coach_dashboard")}</p>
                  <h1 className="mt-2 text-3xl font-bold">{t("coach_welcome")}, {coach?.name}</h1>
                  <div className="mt-8 grid gap-5 sm:grid-cols-2">
                    <div className="border border-gray-100 bg-primary-100 p-5"><p className="text-sm text-gray-400">{t("coach_assigned_classes")}</p><p className="mt-2 text-3xl font-bold text-primary-300 numbers">{assignedClasses.length}</p></div>
                    <div className="border border-gray-100 bg-primary-100 p-5"><p className="text-sm text-gray-400">{t("coach_weekly_slots")}</p><p className="mt-2 text-3xl font-bold text-secondary-400 numbers">{assignedClasses.reduce((sum, item) => sum + item.schedule.length, 0)}</p></div>
                  </div>
                </div>
              )}

              {activeTab === "profile" && (
                <form className="grid gap-6 md:grid-cols-[180px_1fr]" onSubmit={saveProfile}>
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-2 border-primary-500 bg-gray-20 text-4xl text-primary-300">
                      {avatarUrl ? <img alt={coach?.name} className="h-full w-full object-cover" src={avatarUrl} /> : coach?.name.charAt(0)}
                    </div>
                    <label className="w-full cursor-pointer rounded bg-secondary-500 px-4 py-2 text-center text-sm font-bold">{t("coach_avatar")}<input accept="image/*" className="hidden" onChange={handleAvatar} type="file" /></label>
                  </div>
                  <div className="grid gap-4">
                    <h2 className="text-2xl font-bold">{t("coach_profile_heading")}</h2>
                    <label className="grid gap-1 text-sm font-bold text-gray-300">{t("coach_specialization")}<input className="rounded border border-gray-100 bg-primary-100 px-4 py-3" value={specialization} onChange={(event) => setSpecialization(event.target.value)} required /></label>
                    <label className="grid gap-1 text-sm font-bold text-gray-300">{t("coach_phone")}<input className="rounded border border-gray-100 bg-primary-100 px-4 py-3" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value.replace(/[^\d+ ]/g, ""))} /></label>
                    <label className="grid gap-1 text-sm font-bold text-gray-300">{t("coach_bio")}<textarea className="min-h-32 rounded border border-gray-100 bg-primary-100 px-4 py-3" value={bio} onChange={(event) => setBio(event.target.value)} /></label>
                    {message && <p className="text-sm font-bold text-primary-300">{message}</p>}
                    <button className="w-fit rounded bg-secondary-500 px-7 py-3 font-bold hover:bg-primary-500">{t("profile_save_btn")}</button>
                  </div>
                </form>
              )}

              {activeTab === "classes" && (
                <div className="grid gap-5">
                  <h2 className="text-2xl font-bold">{t("coach_assigned_classes")}</h2>
                  {assignedClasses.length === 0 && <p className="text-gray-500">{t("coach_no_classes")}</p>}
                  {assignedClasses.map((gymClass) => (
                    <article className="grid gap-5 border-b border-gray-100 pb-6 md:grid-cols-[220px_1fr]" key={gymClass.id}>
                      <img alt={gymClass.name} className="aspect-[4/3] h-full w-full object-cover" src={gymClass.image} />
                      {editingClass?.id === gymClass.id ? (
                        <form className="grid gap-3" onSubmit={saveClass}>
                          <input className="rounded border border-gray-100 bg-primary-100 px-4 py-2" value={editingClass.name} onChange={(event) => setEditingClass({ ...editingClass, name: event.target.value })} required />
                          <textarea className="min-h-24 rounded border border-gray-100 bg-primary-100 px-4 py-2" value={editingClass.description} onChange={(event) => setEditingClass({ ...editingClass, description: event.target.value })} required />
                          <label className="w-fit cursor-pointer rounded border border-primary-500 px-4 py-2 text-sm font-bold text-primary-300">{t("admin_change_image")}<input accept="image/*" className="hidden" onChange={changeClassImage} type="file" /></label>
                          <div className="flex gap-2"><button className="rounded bg-secondary-500 px-4 py-2 font-bold">{t("admin_save")}</button><button className="rounded border border-gray-100 px-4 py-2" onClick={() => setEditingClass(null)} type="button">{t("admin_cancel")}</button></div>
                        </form>
                      ) : (
                        <div><h3 className="text-xl font-bold text-primary-300">{gymClass.name}</h3><p className="mt-2 text-gray-400">{gymClass.description}</p><button className="mt-4 rounded border border-primary-500 px-4 py-2 text-sm font-bold text-primary-300" onClick={() => setEditingClass(gymClass)}>{t("coach_edit_class")}</button></div>
                      )}
                    </article>
                  ))}
                </div>
              )}

              {activeTab === "schedule" && (
                <div className="grid gap-8">
                  <h2 className="text-2xl font-bold">{t("schedule_heading")}</h2>
                  {assignedClasses.length === 0 && <p className="text-gray-500">{t("coach_no_classes")}</p>}
                  {assignedClasses.map((gymClass) => <div key={gymClass.id}><h3 className="text-xl font-bold text-primary-300">{gymClass.name}</h3><ClassScheduleEditor gymClass={gymClass} addSlot={addClassSchedule} editSlot={editClassSchedule} deleteSlot={deleteClassSchedule} /></div>)}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
};

export default CoachDashboard;
