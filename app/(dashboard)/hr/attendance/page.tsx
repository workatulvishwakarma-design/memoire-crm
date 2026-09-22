"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useStore } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock, MapPin, CheckCircle, Camera, RefreshCw, AlertCircle,
  WifiOff, Loader2, Navigation, User
} from "lucide-react";

// ─── Geofence Constants (Navi Mumbai HQ) ─────────────────────────────────────
const OFFICE_LAT = 19.076;
const OFFICE_LNG = 72.9982;
const OFFICE_RADIUS_METERS = 200;

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Types ────────────────────────────────────────────────────────────────────
type PunchStep = "idle" | "camera" | "preview" | "gps" | "submitting" | "done" | "error";
type AttendanceStatus = "Present" | "Late" | "Half Day" | "Absent" | "Leave" | "Weekend";

export default function AttendancePage() {
  const { attendance, setAttendance, addAttendanceRecord, isPunchedIn, setIsPunchedIn, setCurrentPunchTime, employees } = useStore();

  // ─── Clock ─────────────────────────────────────────────────────────────────
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");
  useEffect(() => {
    function tick() {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setCurrentDate(now.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" }));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // ─── Punch state ───────────────────────────────────────────────────────────
  const [step, setStep] = useState<PunchStep>("idle");
  const [punchMode, setPunchMode] = useState<"in" | "out">("in");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  // ─── Camera state ──────────────────────────────────────────────────────────
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string>("");

  // ─── GPS state ─────────────────────────────────────────────────────────────
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<string>("");
  const [isWithinGeofence, setIsWithinGeofence] = useState<boolean | null>(null);
  const [distanceFromOffice, setDistanceFromOffice] = useState<number | null>(null);
  const [gpsError, setGpsError] = useState<string>("");

  // ─── Today's record ────────────────────────────────────────────────────────
  const today = new Date().toISOString().split("T")[0];
  const todayRecord = attendance.find((r) => r.date === today);

  // Stop camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // ─── Step 1: Open camera ───────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    setCameraError("");
    setCapturedImage(null);
    setStep("camera");

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera is not supported on this device/browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      const msg =
        err.name === "NotAllowedError"
          ? "Camera permission denied. Please allow camera access and try again."
          : err.name === "NotFoundError"
          ? "No camera found on this device."
          : `Camera error: ${err.message}`;
      setCameraError(msg);
    }
  }, []);

  // ─── Step 2: Capture photo ─────────────────────────────────────────────────
  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedImage(dataUrl);

    // Stop stream after capture
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    setStep("preview");
  }, []);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  // ─── Step 3: Get GPS ───────────────────────────────────────────────────────
  const getLocation = useCallback(() => {
    setGpsError("");
    setGpsStatus("Acquiring GPS location…");
    setStep("gps");

    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by this browser.");
      setGpsStatus("GPS unavailable");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const dist = haversine(OFFICE_LAT, OFFICE_LNG, latitude, longitude);
        const within = dist <= OFFICE_RADIUS_METERS;

        setGpsCoords({ lat: latitude, lng: longitude, accuracy });
        setDistanceFromOffice(Math.round(dist));
        setIsWithinGeofence(within);
        setGpsStatus(
          within
            ? `✅ Within office geofence (${Math.round(dist)}m from HQ)`
            : `⚠️ Outside office (${Math.round(dist)}m from HQ)`
        );
      },
      (err) => {
        let msg = "Location unavailable.";
        if (err.code === 1) msg = "Location permission denied. Please allow location access.";
        else if (err.code === 2) msg = "Location unavailable. Check your device GPS.";
        else if (err.code === 3) msg = "Location request timed out. Try again.";
        setGpsError(msg);
        setGpsStatus("GPS failed");
      },
      { timeout: 15000, enableHighAccuracy: true, maximumAge: 0 }
    );
  }, []);

  // ─── Step 4: Submit punch ──────────────────────────────────────────────────
  const submitPunch = useCallback(async () => {
    setStep("submitting");
    setErrorMsg("");

    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const employeeId = employees[0]?.employeeId || "MEM-101";
    const employeeName = employees[0]?.name || "Employee";

    try {
      const endpoint = punchMode === "in" ? "/api/attendance/punch-in" : "/api/attendance/punch-out";
      const payload = {
        employeeId,
        employeeName,
        latitude: gpsCoords?.lat ?? null,
        longitude: gpsCoords?.lng ?? null,
        selfieUrl: capturedImage || "",
        workLocation: isWithinGeofence === false ? "Remote" : "Navi Mumbai Office",
        workSummary: punchMode === "out" ? "Daily tasks completed." : "",
      };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || json.error || "Punch failed. Please try again.");
      }

      // Update local state
      if (punchMode === "in") {
        setIsPunchedIn(true);
        setCurrentPunchTime(timeStr);

        const newRecord = {
          id: json.data?.id || `att-${Date.now()}`,
          employeeId,
          employeeName,
          date: today,
          punchInTime: timeStr,
          punchOutTime: "",
          workingHours: "0h 0m",
          breakDuration: "0m",
          location: payload.workLocation,
          gpsStatus: gpsStatus || "Not captured",
          status: "Present" as AttendanceStatus,
        };
        addAttendanceRecord(newRecord);
        setSuccessMsg(`✅ Punched IN at ${timeStr}. ${json.data?.message || "Have a productive day!"}`);
      } else {
        setIsPunchedIn(false);
        setCurrentPunchTime(null);
        setAttendance(
          attendance.map((r) =>
            r.date === today ? { ...r, punchOutTime: timeStr, workingHours: json.data?.workingHours || "8h 0m" } : r
          )
        );
        setSuccessMsg(`✅ Punched OUT at ${timeStr}. ${json.data?.message || "Great work today!"}`);
      }

      setStep("done");
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
      setStep("error");
    }
  }, [punchMode, gpsCoords, capturedImage, isWithinGeofence, gpsStatus, employees, today, addAttendanceRecord, setIsPunchedIn, setCurrentPunchTime, setAttendance, attendance]);

  // ─── Start punch flow ──────────────────────────────────────────────────────
  const startPunchFlow = (mode: "in" | "out") => {
    setPunchMode(mode);
    setStep("idle");
    setErrorMsg("");
    setSuccessMsg("");
    setGpsCoords(null);
    setGpsStatus("");
    setGpsError("");
    setCapturedImage(null);
    setCameraError("");
    setIsWithinGeofence(null);
    startCamera();
  };

  const resetFlow = () => {
    setStep("idle");
    setErrorMsg("");
    setSuccessMsg("");
    setGpsCoords(null);
    setGpsStatus("");
    setCapturedImage(null);
    setIsWithinGeofence(null);
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-5 h-5 text-[#F26722]" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Attendance Engine</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Working Hours & Geofence Tracker</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Selfie verification + GPS geofence · Navi Mumbai HQ ({OFFICE_RADIUS_METERS}m radius)
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-2xl font-mono font-bold text-gray-900">{currentTime}</span>
            <span className="text-xs text-gray-500">{currentDate}</span>
          </div>
        </div>

        {/* Punch Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#F26722]" />
                {employees[0]?.name || "Employee"} — Punch Terminal
              </CardTitle>
              <CardDescription>
                {todayRecord
                  ? `Punched in at ${todayRecord.punchInTime}${todayRecord.punchOutTime ? ` · Out at ${todayRecord.punchOutTime}` : " · Currently working"}`
                  : "Not yet punched in today"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status badges */}
              {todayRecord && (
                <div className="flex flex-wrap gap-2 p-3 bg-green-50 rounded-xl border border-green-100">
                  <span className="text-sm font-medium text-green-800">
                    ✅ Punch-in recorded · {todayRecord.punchInTime}
                  </span>
                  {todayRecord.punchOutTime && (
                    <span className="text-sm text-green-700">→ Out: {todayRecord.punchOutTime}</span>
                  )}
                  {todayRecord.workingHours !== "0h 0m" && (
                    <span className="text-sm text-green-700">⏱ {todayRecord.workingHours}</span>
                  )}
                </div>
              )}

              {/* Action buttons */}
              {step === "idle" && (
                <div className="flex gap-3">
                  {!isPunchedIn && !todayRecord && (
                    <Button
                      onClick={() => startPunchFlow("in")}
                      className="flex-1 bg-[#F26722] hover:bg-[#D95514] text-white"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Punch In Now
                    </Button>
                  )}
                  {(isPunchedIn || (todayRecord && !todayRecord.punchOutTime)) && (
                    <Button
                      onClick={() => startPunchFlow("out")}
                      variant="danger"
                      className="flex-1"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Punch Out
                    </Button>
                  )}
                  {todayRecord?.punchOutTime && (
                    <div className="flex-1 flex items-center justify-center p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Day complete · {todayRecord.workingHours}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Camera view */}
              {(step === "camera" || step === "preview") && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">
                    Step 1/3 — {step === "camera" ? "Position your face and take a selfie" : "Review your photo"}
                  </p>

                  {cameraError && (
                    <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-sm text-red-700 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      {cameraError}
                    </div>
                  )}

                  {step === "camera" && !cameraError && (
                    <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-48 h-64 border-4 border-white/60 rounded-full opacity-50" />
                      </div>
                    </div>
                  )}

                  {step === "preview" && capturedImage && (
                    <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                      <img src={capturedImage} alt="Selfie" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <canvas ref={canvasRef} className="hidden" />

                  <div className="flex gap-2">
                    {step === "camera" && !cameraError && (
                      <Button onClick={capturePhoto} className="flex-1 bg-[#F26722] hover:bg-[#D95514] text-white">
                        <Camera className="w-4 h-4 mr-2" />
                        Capture Selfie
                      </Button>
                    )}
                    {step === "preview" && (
                      <>
                        <Button onClick={retakePhoto} variant="outline" className="flex-1">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Retake
                        </Button>
                        <Button onClick={getLocation} className="flex-1 bg-[#F26722] hover:bg-[#D95514] text-white">
                          <Navigation className="w-4 h-4 mr-2" />
                          Continue to GPS
                        </Button>
                      </>
                    )}
                    <Button onClick={resetFlow} variant="outline" className="px-3">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* GPS step */}
              {step === "gps" && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">Step 2/3 — Verifying your location</p>

                  {capturedImage && (
                    <img src={capturedImage} alt="Selfie" className="w-20 h-20 rounded-full object-cover border-2 border-[#F26722]" />
                  )}

                  <div className={`p-3 rounded-xl border text-sm flex items-start gap-2 ${
                    gpsError ? "bg-red-50 border-red-200 text-red-700" :
                    gpsCoords ? (isWithinGeofence ? "bg-green-50 border-green-200 text-green-700" : "bg-amber-50 border-amber-200 text-amber-700") :
                    "bg-blue-50 border-blue-200 text-blue-700"
                  }`}>
                    {gpsError ? <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> :
                     gpsCoords ? <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" /> :
                     <Loader2 className="w-4 h-4 mt-0.5 flex-shrink-0 animate-spin" />}
                    <div>
                      <p className="font-medium">{gpsStatus || "Requesting location…"}</p>
                      {gpsCoords && (
                        <p className="text-xs mt-0.5 opacity-80">
                          {gpsCoords.lat.toFixed(5)}, {gpsCoords.lng.toFixed(5)} · ±{Math.round(gpsCoords.accuracy)}m accuracy
                        </p>
                      )}
                      {gpsError && <p className="text-xs mt-0.5">{gpsError}</p>}
                    </div>
                  </div>

                  {gpsCoords && (
                    <Button onClick={submitPunch} className="w-full bg-[#F26722] hover:bg-[#D95514] text-white">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirm & Punch {punchMode === "in" ? "In" : "Out"}
                    </Button>
                  )}

                  {gpsError && (
                    <div className="flex gap-2">
                      <Button onClick={submitPunch} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-sm">
                        Punch without GPS
                      </Button>
                      <Button onClick={resetFlow} variant="outline" className="flex-1 text-sm">
                        Cancel
                      </Button>
                    </div>
                  )}

                  {!gpsCoords && !gpsError && (
                    <Button onClick={resetFlow} variant="outline" className="w-full">
                      Cancel
                    </Button>
                  )}
                </div>
              )}

              {/* Submitting */}
              {step === "submitting" && (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <Loader2 className="w-8 h-8 text-[#F26722] animate-spin" />
                  <p className="text-sm text-gray-600 font-medium">Saving attendance record…</p>
                </div>
              )}

              {/* Done */}
              {step === "done" && (
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-sm text-green-800">
                    <p className="font-semibold">{successMsg}</p>
                  </div>
                  <Button onClick={resetFlow} variant="outline" className="w-full">
                    Done
                  </Button>
                </div>
              )}

              {/* Error */}
              {step === "error" && (
                <div className="space-y-3">
                  <div className="p-4 bg-red-50 rounded-xl border border-red-200 text-sm text-red-800 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Punch failed</p>
                      <p className="mt-0.5">{errorMsg}</p>
                    </div>
                  </div>
                  <Button onClick={resetFlow} variant="outline" className="w-full">
                    Try Again
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-[#F26722]" />
                Geofence & Office Status
              </CardTitle>
              <CardDescription>Navi Mumbai HQ — {OFFICE_RADIUS_METERS}m boundary</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {[
                  { label: "Office Location", value: "Navi Mumbai HQ", icon: MapPin },
                  { label: "Geofence Radius", value: `${OFFICE_RADIUS_METERS} meters`, icon: Navigation },
                  { label: "Punch Status", value: isPunchedIn ? "Punched In" : todayRecord?.punchOutTime ? "Day Complete" : "Not Punched In", icon: Clock },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{label}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{value}</span>
                  </div>
                ))}
              </div>

              {isWithinGeofence !== null && (
                <div className={`p-3 rounded-xl border text-sm font-medium flex items-center gap-2 ${
                  isWithinGeofence ? "bg-green-50 border-green-200 text-green-800" : "bg-amber-50 border-amber-200 text-amber-800"
                }`}>
                  {isWithinGeofence ? <CheckCircle className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                  {isWithinGeofence
                    ? `Within geofence — ${distanceFromOffice}m from HQ`
                    : `Outside geofence — ${distanceFromOffice}m from HQ`}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Attendance History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Workforce Attendance Ledger</CardTitle>
            <CardDescription>Real-time punch-in times, GPS accuracy, and hours logged</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-bold border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3">Employee</th>
                    <th className="px-6 py-3">Punch In</th>
                    <th className="px-6 py-3">Punch Out</th>
                    <th className="px-6 py-3">Hours Logged</th>
                    <th className="px-6 py-3">Location & GPS</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-900">
                  {attendance.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                        No attendance records yet. Punch in to start tracking.
                      </td>
                    </tr>
                  ) : (
                    attendance.map((att) => (
                      <tr key={att.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-900">{att.employeeName}</td>
                        <td className="px-6 py-4 text-gray-600 font-mono">{att.punchInTime}</td>
                        <td className="px-6 py-4 text-gray-600 font-mono">{att.punchOutTime || <span className="text-gray-400">—</span>}</td>
                        <td className="px-6 py-4 font-mono font-bold text-gray-900">{att.workingHours}</td>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-1.5 text-gray-700">
                            <MapPin className="w-3.5 h-3.5 text-[#F26722]" />
                            {att.location}
                          </span>
                          <span className="text-xs text-gray-400 mt-0.5 block">{att.gpsStatus}</span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge status={att.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
