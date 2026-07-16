import { useState } from "react";
import type { ClassSchedule, GymClass, Weekday } from "./mockData";
import { useLanguage } from "./LanguageContext";

type Props = {
  gymClass: GymClass;
  addSlot: (classId: string, slot: Omit<ClassSchedule, "id">) => boolean;
  editSlot: (classId: string, slot: ClassSchedule) => boolean;
  deleteSlot: (classId: string, slotId: string) => void;
};

const WEEKDAYS: Weekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const DAY_KEYS = {
  monday: "weekday_monday",
  tuesday: "weekday_tuesday",
  wednesday: "weekday_wednesday",
  thursday: "weekday_thursday",
  friday: "weekday_friday",
  saturday: "weekday_saturday",
  sunday: "weekday_sunday",
} as const;

const ClassScheduleEditor = ({ gymClass, addSlot, editSlot, deleteSlot }: Props) => {
  const { t } = useLanguage();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [weekday, setWeekday] = useState<Weekday>("monday");
  const [startTime, setStartTime] = useState("18:00");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [capacity, setCapacity] = useState(16);
  const [error, setError] = useState("");

  const weekdayLabel = (day: Weekday) => t(DAY_KEYS[day]);

  const reset = () => {
    setEditingId(null);
    setWeekday("monday");
    setStartTime("18:00");
    setDurationMinutes(60);
    setCapacity(16);
    setError("");
  };

  const startEdit = (slot: ClassSchedule) => {
    setEditingId(slot.id);
    setWeekday(slot.weekday);
    setStartTime(slot.startTime);
    setDurationMinutes(slot.durationMinutes);
    setCapacity(slot.capacity);
    setError("");
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const slot = { weekday, startTime, durationMinutes, capacity };
    const success = editingId
      ? editSlot(gymClass.id, { ...slot, id: editingId })
      : addSlot(gymClass.id, slot);
    if (!success) {
      setError(t("schedule_conflict"));
      return;
    }
    reset();
  };

  return (
    <div className="mt-5 border-t border-gray-100 pt-5">
      <h4 className="text-base font-bold text-white">{t("schedule_heading")}</h4>
      <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1 text-xs font-bold text-gray-400">
          {t("schedule_day")}
          <select className="rounded border border-gray-100 bg-gray-50 px-3 py-2 text-white" value={weekday} onChange={(event) => setWeekday(event.target.value as Weekday)}>
            {WEEKDAYS.map((day) => <option className="bg-gray-50" key={day} value={day}>{weekdayLabel(day)}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-gray-400">
          {t("schedule_start")}
          <input className="rounded border border-gray-100 bg-gray-50 px-3 py-2 text-white" type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} required />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-gray-400">
          {t("schedule_duration")}
          <input className="rounded border border-gray-100 bg-gray-50 px-3 py-2 text-white" min={1} type="number" value={durationMinutes} onChange={(event) => setDurationMinutes(Number(event.target.value))} required />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold text-gray-400">
          {t("schedule_capacity")}
          <input className="rounded border border-gray-100 bg-gray-50 px-3 py-2 text-white" min={1} type="number" value={capacity} onChange={(event) => setCapacity(Number(event.target.value))} required />
        </label>
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <button className="rounded bg-secondary-500 px-4 py-2 text-sm font-bold text-white hover:bg-primary-500" type="submit">
            {editingId ? t("schedule_save") : t("schedule_add")}
          </button>
          {editingId && <button className="rounded border border-gray-100 px-4 py-2 text-sm font-bold text-gray-300" onClick={reset} type="button">{t("admin_cancel")}</button>}
        </div>
        {error && <p className="text-sm font-bold text-primary-500 sm:col-span-2">{error}</p>}
      </form>

      <div className="mt-4 flex flex-col gap-2">
        {gymClass.schedule.length === 0 && <p className="text-sm text-gray-500">{t("schedule_empty")}</p>}
        {gymClass.schedule.map((slot) => (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 py-3 text-sm" key={slot.id}>
            <span className="font-bold text-white">{weekdayLabel(slot.weekday)} · <span className="numbers">{slot.startTime}</span></span>
            <span className="text-gray-400 numbers">{slot.durationMinutes} {t("schedule_minutes")} · {slot.capacity} {t("schedule_spots")}</span>
            <div className="flex gap-2">
              <button className="rounded border border-gray-100 px-3 py-1 font-bold text-primary-300" onClick={() => startEdit(slot)} type="button">{t("admin_edit")}</button>
              <button className="rounded border border-primary-500/40 px-3 py-1 font-bold text-primary-500" onClick={() => deleteSlot(gymClass.id, slot.id)} type="button">{t("admin_delete")}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClassScheduleEditor;
