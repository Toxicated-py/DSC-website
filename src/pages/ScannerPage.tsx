import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Database, Users, ArrowRight, ArrowLeft, Search, Camera, Check, Calendar, MapPin, Tag, QrCode, Trophy, TrendingUp, Bell, Zap, Target, Star, Award, Clock, BookOpen, Code, GitBranch, Home, Mail, UserCheck, GraduationCap, User, FileText } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import { getPersistenceLabel, publishBlogPost, submitEventProposal, submitProject } from "../lib/contentApi";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { apiGet, apiPatch, apiPost, userFriendlyErrorMessage } from "../lib/apiClient";
import { BrutalButton, BrutalCard, BrutalBadge, BrutalField, BrutalTextArea } from "../components/ui/brutal";
import { requireLoginForAction } from "../utils/authNavigation";
const fonts = {
  display: { fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0" },
  sans: { fontFamily: "'Inter', sans-serif" },
  serif: { fontFamily: "'Newsreader', serif" },
};

export function ScannerPage() {
  const navigate = useNavigate();
  const eventId = new URLSearchParams(window.location.search).get("event") || "";
  const [ticketCode, setTicketCode] = useState("");
  const [scannerStatus, setScannerStatus] = useState("Checking scanner access...");
  const [scannerReady, setScannerReady] = useState(false);
  const [scannerEvent, setScannerEvent] = useState<any>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStatus, setCameraStatus] = useState("Camera scanner is optional. You can enter the ticket code manually.");
  const [lastScan, setLastScan] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerControlsRef = useRef<IScannerControls | null>(null);
  const scanBusyRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    async function checkScannerAccess() {
      if (!eventId || !/^[0-9a-f-]{36}$/i.test(eventId)) {
        setScannerStatus("Open scanner from an event page.");
        return;
      }
      const workspace = await apiGet<any>(`/api/events/${eventId}/workspace`, { auth: true }).catch((error) => {
        if (error?.status === 401) {
          navigate(`/login?redirect=/scanner?event=${eventId}`);
          return null;
        }
        setScannerStatus(error.message || "Scanner is unavailable right now.");
        return null;
      });
      if (!mounted) return;
      if (!workspace) return;
      const eventRow = workspace.event;
      if (!eventRow) {
        setScannerStatus("Event not found.");
        return;
      }
      if (eventRow.end_time && new Date(eventRow.end_time).getTime() < Date.now()) {
        setScannerStatus("Scanner closed because this event has ended.");
        return;
      }

      setScannerReady(Boolean(workspace.can_manage));
      setScannerEvent(eventRow);
      setScannerStatus(workspace.can_manage ? `Scanner active for ${eventRow.title}.` : "You are not allowed to scan for this event.");
    }

    checkScannerAccess();

    return () => {
      mounted = false;
    };
  }, [eventId, navigate]);

  useEffect(() => {
    return () => {
      scannerControlsRef.current?.stop();
    };
  }, []);

  const explainScannerUnavailable = () => {
    if (!eventId || !/^[0-9a-f-]{36}$/i.test(eventId)) {
      setScannerStatus("Open scanner from an event page.");
      setCameraStatus("Choose Scanner from a specific event so the scanner knows which tickets to check.");
      return;
    }
    setCameraStatus(scannerStatus || "Scanner is not ready yet.");
  };

  const scanTicket = async (codeOverride?: string) => {
    const code = (codeOverride || ticketCode).trim();
    if (!scannerReady || !eventId) {
      explainScannerUnavailable();
      return;
    }
    if (!code || scanBusyRef.current) return;
    scanBusyRef.current = true;
    setCheckingIn(true);
    setLastScan(null);
    try {
      const result = await apiPost<any>(`/api/events/${eventId}/scan`, { ticket_code: code }, { auth: true });
      const attendeeName = result.profile?.full_name || result.profile?.email || "Member";
      setLastScan(result);
      setScannerStatus(result.already_checked_in ? `${attendeeName} was already checked in.` : `${attendeeName} checked in successfully.`);
      setTicketCode("");
    } catch (error: any) {
      setScannerStatus(error.message || "Ticket not found for this event.");
    } finally {
      scanBusyRef.current = false;
      setCheckingIn(false);
    }
  };

  const startCameraScanner = async () => {
    if (!scannerReady) {
      explainScannerUnavailable();
      return;
    }
    if (cameraActive) {
      setCameraStatus("Scanner already running.");
      return;
    }
    const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
    if (!window.isSecureContext && !isLocalhost) {
      setCameraStatus("Camera scanning requires HTTPS or localhost. Use manual ticket code entry or open the deployed HTTPS site.");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus("This browser does not support camera access. Use manual ticket code entry.");
      return;
    }
    try {
      const reader = new BrowserQRCodeReader();
      scannerControlsRef.current = await reader.decodeFromConstraints(
        { video: { facingMode: { ideal: "environment" } } },
        videoRef.current || undefined,
        async (result) => {
          const value = result?.getText();
          if (!value || scanBusyRef.current) return;
          scannerControlsRef.current?.stop();
          scannerControlsRef.current = null;
          setCameraActive(false);
          setCameraStatus("QR code scanned. Checking ticket...");
          await scanTicket(value);
        }
      );
      setCameraActive(true);
      setCameraStatus("Scanner started. Hold the QR code inside the frame.");
    } catch (error: any) {
      const name = error?.name || "";
      if (name === "NotAllowedError" || name === "SecurityError") {
        setCameraStatus("Camera permission denied. Allow camera access or use manual ticket code entry.");
      } else if (name === "NotFoundError" || name === "OverconstrainedError") {
        setCameraStatus("No camera found. Use manual ticket code entry.");
      } else {
        setCameraStatus("Could not open camera. Check browser support or use manual ticket code entry.");
      }
    }
  };

  const stopCameraScanner = () => {
    scannerControlsRef.current?.stop();
    scannerControlsRef.current = null;
    setCameraActive(false);
    setCameraStatus("Camera stopped. Manual ticket code entry is still available.");
  };

  return (
    <div className="min-h-screen bg-[#171717] pt-12 pb-20 px-6 flex flex-col items-center justify-center text-white relative">
      <div className="text-center mb-8">
        <h1 className="text-5xl uppercase" style={fonts.display}>Scanner Protocol</h1>
        <p className="font-mono text-slate-400 mt-2">{scannerStatus}</p>
        {scannerEvent && (
          <p className="font-mono text-xs text-slate-500 mt-2">
            {scannerEvent.start_time ? new Date(scannerEvent.start_time).toLocaleString() : "Date TBA"} - {scannerEvent.venue || "Venue TBA"}
          </p>
        )}
      </div>

      <div className="relative w-full max-w-sm aspect-square bg-black border-4 border-[#2563EB] mb-12 overflow-hidden flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.3)]">
        {/* Viewfinder brackets */}
        <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-[#FFE800]" />
        <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-[#FFE800]" />
        <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-[#FFE800]" />
        <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-[#FFE800]" />

        {/* Scanning line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-[#FB7185] shadow-[0_0_15px_#FB7185] animate-[scan_2s_ease-in-out_infinite]" />

        <video ref={videoRef} className={`absolute inset-0 h-full w-full object-cover ${cameraActive ? "block" : "hidden"}`} muted playsInline />
        {!cameraActive && (
          <p className="font-mono text-slate-600 text-sm flex items-center gap-2">
            <Camera size={16} /> {scannerReady ? "CAMERA READY" : "EVENT REQUIRED"}
          </p>
        )}
      </div>

      <p className="mb-4 max-w-sm text-center font-mono text-xs text-slate-400">{cameraStatus}</p>
      <div className="mb-4 flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <BrutalButton onClick={cameraActive ? stopCameraScanner : startCameraScanner} color="bg-[#2563EB]" text="text-white" className="flex-1">
          <Camera size={16} /> {cameraActive ? "Stop Camera" : "Start Camera"}
        </BrutalButton>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <input
          value={ticketCode}
          onChange={(event) => setTicketCode(event.target.value)}
          placeholder="Ticket code"
          disabled={checkingIn}
          className="flex-1 border-2 border-[#FFE800] bg-black p-3 font-mono text-sm text-white focus:outline-none disabled:opacity-40"
        />
        <BrutalButton onClick={() => scanTicket()} disabled={checkingIn || !ticketCode.trim()} color="bg-[#FFE800]" className="flex-1">
          {checkingIn ? "Checking..." : "Check In"}
        </BrutalButton>
      </div>

      {lastScan && (
        <div className="mt-6 w-full max-w-sm border-2 border-[#FFE800] bg-black p-4 font-mono text-sm">
          <p className="font-bold text-[#FFE800] uppercase">{lastScan.already_checked_in ? "Already checked in" : "Scan accepted"}</p>
          <p className="mt-2">{lastScan.profile?.full_name || lastScan.profile?.email || "Member"}</p>
          <p className="mt-1 break-all text-slate-400">{lastScan.registration?.ticket_code}</p>
        </div>
      )}
    </div>
  );
}
