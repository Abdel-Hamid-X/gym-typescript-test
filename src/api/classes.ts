import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "./client";

export interface BackendSchedule {
  id: string;
  classId: string;
  weekday: string;
  startTime: string;
  durationMinutes: number;
  capacity: number;
  active: boolean;
}

export interface BackendClass {
  id: string;
  name: string;
  description: string;
  imageUrl?: string | null;
  coachId?: string | null;
  active: boolean;
  coach?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    coachProfile?: {
      specialization: string;
      bio: string;
    } | null;
  } | null;
  schedules: BackendSchedule[];
}

export async function fetchClasses(): Promise<{ classes: BackendClass[] }> {
  const res = await apiGet<{ data: { classes: BackendClass[] } }>("/classes");
  return res.data;
}

export async function createClassByAdmin(input: {
  name: string;
  description: string;
  imageUrl?: string;
  coachId?: string;
}): Promise<{ class: BackendClass }> {
  const res = await apiPost<{ data: { class: BackendClass } }>("/admin/classes", input);
  return res.data;
}

export async function updateClassByAdmin(
  id: string,
  input: { name?: string; description?: string; imageUrl?: string; coachId?: string }
): Promise<{ class: BackendClass }> {
  const res = await apiPatch<{ data: { class: BackendClass } }>(`/admin/classes/${id}`, input);
  return res.data;
}

export async function deleteClassByAdmin(id: string): Promise<void> {
  await apiDelete(`/admin/classes/${id}`);
}

export async function assignCoachToClassByAdmin(id: string, coachId: string | null): Promise<{ class: BackendClass }> {
  const res = await apiPut<{ data: { class: BackendClass } }>(`/admin/classes/${id}/coach`, { coachId });
  return res.data;
}

export async function createScheduleSlotByAdmin(
  classId: string,
  slot: { weekday: string; startTime: string; durationMinutes: number; capacity: number }
): Promise<{ schedule: BackendSchedule }> {
  const res = await apiPost<{ data: { schedule: BackendSchedule } }>(`/admin/classes/${classId}/schedules`, slot);
  return res.data;
}

export async function updateScheduleSlotByAdmin(
  scheduleId: string,
  slot: Partial<{ weekday: string; startTime: string; durationMinutes: number; capacity: number; active: boolean }>
): Promise<{ schedule: BackendSchedule }> {
  const res = await apiPatch<{ data: { schedule: BackendSchedule } }>(`/admin/schedules/${scheduleId}`, slot);
  return res.data;
}

export async function deleteScheduleSlotByAdmin(scheduleId: string): Promise<void> {
  await apiDelete(`/admin/schedules/${scheduleId}`);
}

export async function createScheduleSlotByCoach(
  classId: string,
  slot: { weekday: string; startTime: string; durationMinutes: number; capacity: number }
): Promise<{ schedule: BackendSchedule }> {
  const res = await apiPost<{ data: { schedule: BackendSchedule } }>(`/coach/classes/${classId}/schedules`, slot);
  return res.data;
}

export async function updateScheduleSlotByCoach(
  scheduleId: string,
  slot: Partial<{ weekday: string; startTime: string; durationMinutes: number; capacity: number; active: boolean }>
): Promise<{ schedule: BackendSchedule }> {
  const res = await apiPatch<{ data: { schedule: BackendSchedule } }>(`/coach/schedules/${scheduleId}`, slot);
  return res.data;
}

export async function deleteScheduleSlotByCoach(scheduleId: string): Promise<void> {
  await apiDelete(`/coach/schedules/${scheduleId}`);
}
