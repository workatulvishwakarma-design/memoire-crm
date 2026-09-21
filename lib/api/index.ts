const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

export async function fetchClientsApi() {
  try {
    const res = await fetch(`${API_BASE}/clients`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function winLeadApi(leadId: string) {
  try {
    const res = await fetch(`${API_BASE}/leads/${leadId}/win`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: "API_UNAVAILABLE" };
  }
}

export async function punchInApi(payload: { employeeId: string; latitude: number; longitude: number; accuracy: number }) {
  try {
    const res = await fetch(`${API_BASE}/attendance/punch-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: "API_UNAVAILABLE" };
  }
}

export async function punchOutApi(payload: {
  employeeId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  workSummary: string;
  taskUpdates: { taskId: string; status: string; comment: string }[];
  blockers?: string;
}) {
  try {
    const res = await fetch(`${API_BASE}/attendance/punch-out`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: "API_UNAVAILABLE" };
  }
}

export async function queryAIApi(userRole: string, query: string) {
  try {
    const res = await fetch(`${API_BASE}/ai/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userRole, userName: "Rahul Sharma", query }),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: "API_UNAVAILABLE" };
  }
}
