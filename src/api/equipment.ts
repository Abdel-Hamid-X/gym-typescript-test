import { apiDelete, apiGet, apiPatch, apiPost } from "./client";

export interface BackendEquipment {
  id: string;
  name: string;
  type: "Strength" | "Cardio" | "Accessories" | "Other";
  quantity: number;
  status: "Operational" | "Under_Maintenance";
  notes?: string | null;
}

export async function fetchEquipment(): Promise<{ equipment: BackendEquipment[] }> {
  const res = await apiGet<{ data: { equipment: BackendEquipment[] } }>("/equipment");
  return res.data;
}

export async function createEquipmentByAdmin(input: {
  name: string;
  type: "Strength" | "Cardio" | "Accessories" | "Other";
  quantity: number;
  status?: "Operational" | "Under_Maintenance";
  notes?: string;
}): Promise<{ equipment: BackendEquipment }> {
  const res = await apiPost<{ data: { equipment: BackendEquipment } }>("/admin/equipment", input);
  return res.data;
}

export async function updateEquipmentByAdmin(
  id: string,
  input: Partial<{
    name: string;
    type: "Strength" | "Cardio" | "Accessories" | "Other";
    quantity: number;
    status: "Operational" | "Under_Maintenance";
    notes: string;
  }>
): Promise<{ equipment: BackendEquipment }> {
  const res = await apiPatch<{ data: { equipment: BackendEquipment } }>(`/admin/equipment/${id}`, input);
  return res.data;
}

export async function deleteEquipmentByAdmin(id: string): Promise<void> {
  await apiDelete(`/admin/equipment/${id}`);
}

export async function updateEquipmentStatusByAdmin(
  id: string,
  status: "Operational" | "Under_Maintenance"
): Promise<{ equipment: BackendEquipment }> {
  const res = await apiPost<{ data: { equipment: BackendEquipment } }>(`/admin/equipment/${id}/status`, { status });
  return res.data;
}

export async function uploadImageByAdmin(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);
  const res = await apiPost<{ data: { imageUrl: string } }>("/admin/uploads", formData);
  return res.data.imageUrl;
}
