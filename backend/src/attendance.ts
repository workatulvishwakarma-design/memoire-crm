import { db } from "./db";

export interface PunchInPayload {
  employeeId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  locationName?: string;
}

export interface TaskStatusUpdate {
  taskId: string;
  status: "Completed" | "In Progress" | "Blocked" | "Review";
  comment: string;
}

export interface PunchOutPayload {
  employeeId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  workSummary: string;
  taskUpdates: TaskStatusUpdate[];
  blockers?: string;
  tomorrowPriority?: string;
}

// Haversine formula to compute distance between client lat/long and office geofence
export function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

const OFFICE_LAT = 19.0760;
const OFFICE_LNG = 72.9982;
const ALLOWED_RADIUS_METERS = 150;

export function handlePunchIn(payload: PunchInPayload) {
  // 1. Geofence & Accuracy Validation
  if (payload.accuracy > 100) {
    return { success: false, error: "LOCATION_ACCURACY_TOO_LOW", message: "GPS accuracy must be under 100m." };
  }

  const distance = calculateDistanceMeters(payload.latitude, payload.longitude, OFFICE_LAT, OFFICE_LNG);
  const isWithinGeofence = distance <= ALLOWED_RADIUS_METERS;

  // 2. Server-Authoritative Timestamp
  const now = new Date();
  const serverTimeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toISOString().split("T")[0];

  const newRecord = {
    id: `att-${Date.now()}`,
    employeeId: payload.employeeId,
    employeeName: "Rahul Sharma",
    date: dateStr,
    punchInTime: serverTimeStr,
    workingHours: "00h 01m",
    breakDuration: "0m",
    location: payload.locationName || (isWithinGeofence ? "Navi Mumbai Office" : "Remote / Field"),
    gpsStatus: `Location detected (±${Math.round(payload.accuracy)}m, ${distance}m from office)`,
    status: isWithinGeofence ? ("Present" as const) : ("Late" as const),
  };

  db.attendance.unshift(newRecord);
  db.activities.unshift({
    id: `act-${Date.now()}`,
    timestamp: "Just now",
    user: "Rahul Sharma",
    action: "punched in",
    target: newRecord.location,
    type: "attendance",
  });

  return {
    success: true,
    data: newRecord,
    message: `Punched in successfully at ${serverTimeStr}`,
  };
}

export function handlePunchOut(payload: PunchOutPayload) {
  // Mandatory Punch-Out Summary Validation
  if (!payload.workSummary || payload.workSummary.trim().length < 10) {
    return {
      success: false,
      code: "PUNCH_OUT_SUMMARY_REQUIRED",
      error: "Mandatory work summary must be at least 10 characters.",
    };
  }

  if (!payload.taskUpdates || payload.taskUpdates.length === 0) {
    return {
      success: false,
      code: "TASK_UPDATE_REQUIRED",
      error: "You must update status for at least one task worked on today.",
    };
  }

  // Atomic Execution: Update tasks, close attendance, create report log
  payload.taskUpdates.forEach((tu) => {
    const task = db.tasks.find((t) => t.id === tu.taskId);
    if (task) {
      task.status = tu.status;
      if (tu.comment) {
        task.comments.push({
          id: `tc-${Date.now()}`,
          author: "Rahul Sharma",
          text: `[Punch-Out Update] ${tu.comment}`,
          createdAt: "Just now",
        });
      }
    }
  });

  // Create Work Report
  db.reports.unshift({
    id: `rep-${Date.now()}`,
    employeeId: payload.employeeId,
    employeeName: "Rahul Sharma",
    type: "Daily",
    date: new Date().toISOString().split("T")[0],
    tasksCompleted: payload.taskUpdates.map((t) => t.taskId),
    hoursWorked: 8.5,
    achievements: payload.workSummary,
    challenges: payload.blockers || "None",
    nextPlan: payload.tomorrowPriority || "Continue project execution.",
    status: "Submitted",
  });

  // Log Activity & Audit
  db.activities.unshift({
    id: `act-${Date.now()}`,
    timestamp: "Just now",
    user: "Rahul Sharma",
    action: "completed end-of-day punch out & work report",
    target: `${payload.taskUpdates.length} tasks updated`,
    type: "attendance",
  });

  return {
    success: true,
    message: "Punch-out summary validated and attendance closed.",
  };
}
