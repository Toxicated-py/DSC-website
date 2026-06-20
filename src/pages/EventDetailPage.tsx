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
import { fonts } from "../config/fonts";

const formatEventDate = (date: Date) =>
  `${date.toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}, ${date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false })}`;

const remainingLabel = (date: Date) => {
  const diff = date.getTime() - Date.now();
  if (diff <= 0) return "ended";
  const hours = Math.ceil(diff / 36e5);
  return hours < 24 ? `${hours} hrs remaining` : `${Math.ceil(hours / 24)} days remaining`;
};

export function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reserveStatus, setReserveStatus] = useState("");
  const [eventInfo, setEventInfo] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [canManageEvent, setCanManageEvent] = useState(false);
  const [myRegistration, setMyRegistration] = useState<any>(null);
  const [managerStatus, setManagerStatus] = useState("");
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [reservingSpot, setReservingSpot] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadEventDetails() {
      if (!id) {
        setLoadingEvent(false);
        return;
      }

      const event = await apiGet<any>(`/api/events/${id}`).catch(() => null);
      if (!mounted) return;
      if (!event) {
        setLoadingEvent(false);
        return;
      }

      setEventInfo(event);
      setLoadingEvent(false);

      const workspace = await apiGet<any>(`/api/events/${id}/workspace`, { auth: "optional" }).catch(() => null);
      if (!mounted || !workspace?.event) return;

      setEventInfo(workspace.event);
      setCanManageEvent(Boolean(workspace.can_manage));
      setMyRegistration(workspace.my_registration || null);
      setAttendees(workspace.attendees || []);
    }

    loadEventDetails();

    return () => {
      mounted = false;
    };
  }, [id]);

  const checkInAttendee = async (registrationId: string) => {
    if (!id) return;
    setManagerStatus("");
    const checkedInAt = new Date().toISOString();
    try {
      await apiPatch(`/api/events/${id}/registrations/${registrationId}/check-in`, {}, { auth: true });
    } catch (error: any) {
      setManagerStatus(error.message || "Could not check in attendee.");
      return;
    }
    setAttendees(attendees.map((attendee) => attendee.id === registrationId ? {
      ...attendee,
      status: "checked_in",
      checked_in_at: checkedInAt,
    } : attendee));
  };

  const undoCheckInAttendee = async (registrationId: string) => {
    if (!id) return;
    setManagerStatus("");
    try {
      await apiPatch(`/api/events/${id}/registrations/${registrationId}/undo-check-in`, {}, { auth: true });
    } catch (error: any) {
      setManagerStatus(error.message || "Could not undo check-in.");
      return;
    }
    setAttendees(attendees.map((attendee) => attendee.id === registrationId ? {
      ...attendee,
      status: "registered",
      checked_in_at: null,
    } : attendee));
  };

  const reserveSpot = async () => {
    if (reservingSpot) return;
    setReserveStatus("");
    if (!(await requireLoginForAction(navigate, `/events/${id}`))) return;
    if (!id) {
      setReserveStatus("Invalid event.");
      return;
    }
    try {
      setReservingSpot(true);
      const result = await apiPost<any>(`/api/events/${id}/reserve`, {}, { auth: true });
      setMyRegistration(result.registration || null);
      if (result.message === "Already registered.") {
        setReserveStatus("You already reserved this event.");
      } else {
        setReserveStatus("Spot reserved. Your ticket is ready.");
        setEventInfo((current: any) => {
          if (!current) return current;
          const nextCount = Number(result.registered_count ?? result.registeredCount ?? Number(current.registeredCount || current.registered_count || 0) + 1);
          return { ...current, registeredCount: nextCount, registered_count: nextCount };
        });
      }
    } catch (error: any) {
      if (error?.status === 401) {
        navigate(`/login?redirect=/events/${id}`);
        return;
      }
      setReserveStatus(userFriendlyErrorMessage(error, "Could not reserve a spot. Please try again."));
    } finally {
      setReservingSpot(false);
    }
  };

  const displayEvent = eventInfo;

  if (loadingEvent) {
    return (
      <div className="pt-16 pb-20 px-6 max-w-[1000px] mx-auto min-h-screen">
        <BrutalCard color="bg-white">
          <p className="font-mono text-sm text-slate-500">Loading event...</p>
        </BrutalCard>
      </div>
    );
  }

  if (!displayEvent) {
    return (
      <div className="pt-16 pb-20 px-6 max-w-[1000px] mx-auto min-h-screen">
        <button onClick={() => navigate("/events")} className="inline-flex items-center gap-2 font-bold uppercase tracking-widest text-sm mb-8 hover:text-[#2563EB]">
          <ArrowLeft size={16} /> Back to Events
        </button>
        <BrutalCard color="bg-white">
          <h1 className="text-4xl uppercase mb-3" style={fonts.display}>Event not found</h1>
          <p className="text-sm text-slate-600">This event may have been archived, moved, or is not public yet.</p>
        </BrutalCard>
      </div>
    );
  }

  const startDate = displayEvent.start_time ? new Date(displayEvent.start_time) : null;
  const eventEnded = Boolean(displayEvent.end_time && new Date(displayEvent.end_time).getTime() < Date.now());
  const registrationDeadline = displayEvent.registration_deadline ? new Date(displayEvent.registration_deadline) : null;
  const registrationClosedByDeadline = Boolean(registrationDeadline && registrationDeadline.getTime() < Date.now());
  const registrationClosed = !displayEvent.registration_open || registrationClosedByDeadline;
  const isReserved = Boolean(myRegistration?.id);

  return (
    <div className="pt-16 pb-20 px-6 max-w-[1000px] mx-auto min-h-screen">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 font-bold uppercase tracking-widest text-sm mb-8 hover:text-[#2563EB]">
        <ArrowLeft size={16} /> Back to Events
      </button>

      <BrutalCard color="bg-[#2563EB]" className="text-white mb-12 border-4 overflow-hidden">
        {displayEvent.banner_url && (
          <img src={displayEvent.banner_url} alt={displayEvent.title} className="-m-6 mb-8 h-64 w-[calc(100%+3rem)] object-cover border-b-4 border-[#171717]" />
        )}
        <div className="flex justify-between items-start mb-10">
           <BrutalBadge color="bg-[#FFE800]" text="text-[#171717]">{displayEvent.event_type || "WORKSHOP"}</BrutalBadge>
           <div className="text-right">
             <div className="text-5xl" style={fonts.display}>{startDate ? startDate.getDate() : "24"}</div>
             <div className="font-bold tracking-widest">{startDate ? startDate.toLocaleString("en", { month: "short" }).toUpperCase() : "FEB"}</div>
           </div>
        </div>
        <h1 className="text-5xl md:text-7xl uppercase leading-none mb-6" style={fonts.display}>{displayEvent.title}</h1>
        <div className="flex flex-wrap gap-6 font-mono text-sm opacity-90">
          <span className="flex items-center gap-2"><MapPin size={16}/> {displayEvent.venue || "TBA"}</span>
          <span className="flex items-center gap-2"><Calendar size={16}/> {startDate ? `${formatEventDate(startDate)} - ${remainingLabel(startDate)}` : "Date TBA"}</span>
          <span className="flex items-center gap-2"><Users size={16}/> {displayEvent.registeredCount || 0}/{displayEvent.capacity || 0} Spots Filled</span>
        </div>
      </BrutalCard>

      <div className="grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2 prose prose-lg text-[#171717]">
          <h2 className="uppercase font-bold tracking-widest text-xl mb-4">About The Event</h2>
          <p>{displayEvent.description || displayEvent.short_description || "Event details will be updated soon."}</p>
        </div>
        <div>
          <BrutalCard className="sticky top-32">
            <h3 className="uppercase font-bold tracking-widest text-lg mb-6">Registration</h3>
            <p className="text-sm font-mono text-slate-500 mb-6">
              {registrationDeadline ? `Registration deadline: ${formatEventDate(registrationDeadline)} - ${remainingLabel(registrationDeadline)}` : "Registration deadline not set."}
            </p>
            {reserveStatus && <p className="mb-4 text-xs font-bold text-[#FB7185]">{reserveStatus}</p>}
            {isReserved ? (
              <div className="space-y-3">
                <BrutalButton disabled className="w-full cursor-not-allowed opacity-80" color="bg-green-500" text="text-white">
                  <Check size={16} /> Reserved
                </BrutalButton>
                <BrutalButton onClick={() => navigate(`/ticket/${myRegistration.id}`, { state: { from: `/events/${id}` } })} className="w-full" color="bg-[#FFE800]" text="text-[#171717]">
                  <QrCode size={16} /> View Ticket
                </BrutalButton>
              </div>
            ) : (
              <BrutalButton onClick={reserveSpot} className="w-full" color="bg-[#FB7185]" text="text-white" disabled={registrationClosed || reservingSpot}>
                {registrationClosed ? "Registration Closed" : reservingSpot ? "Reserving..." : "Reserve Spot"}
              </BrutalButton>
            )}
            {canManageEvent && (
              <div className="mt-4 pt-4 border-t-2 border-[#171717] space-y-3">
                <BrutalButton onClick={() => navigate(`/scanner?event=${id}`)} className="w-full text-xs" color="bg-[#171717]" text="text-white">
                  <QrCode size={14} className="inline mr-2" /> Scan Tickets
                </BrutalButton>
              </div>
            )}
          </BrutalCard>
        </div>
      </div>

      {canManageEvent && (
        <BrutalCard color="bg-white" className="mt-10">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-3xl uppercase" style={fonts.display}>Organizer Workspace</h2>
            <BrutalBadge color={eventEnded ? "bg-slate-400" : "bg-green-500"}>{eventEnded ? "Ended" : "Active"}</BrutalBadge>
          </div>
          {managerStatus && <p className="mb-4 text-xs font-bold text-[#2563EB]">{managerStatus}</p>}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-[#171717]">
                  <th className="text-left p-3 uppercase text-xs">Attendee</th>
                  <th className="text-left p-3 uppercase text-xs">Ticket</th>
                  <th className="text-left p-3 uppercase text-xs">Status</th>
                  <th className="text-right p-3 uppercase text-xs">Action</th>
                </tr>
              </thead>
              <tbody>
                {attendees.map((attendee) => {
                  const profile = Array.isArray(attendee.profiles) ? attendee.profiles[0] : attendee.profiles;
                  return (
                    <tr key={attendee.id} className="border-b border-slate-200">
                      <td className="p-3 font-bold">{profile?.full_name || profile?.email || "Member"}</td>
                      <td className="p-3 font-mono text-xs">{attendee.ticket_code}</td>
                      <td className="p-3">{attendee.checked_in_at ? "Checked in" : attendee.status}</td>
                      <td className="p-3 text-right">
                        {attendee.checked_in_at ? (
                          <button onClick={() => undoCheckInAttendee(attendee.id)} className="px-3 py-2 border-2 border-[#171717] bg-[#FFE800] text-[#171717] text-xs font-bold uppercase">
                            Undo
                          </button>
                        ) : (
                          <button onClick={() => checkInAttendee(attendee.id)} className="px-3 py-2 border-2 border-[#171717] bg-green-500 text-white text-xs font-bold uppercase">
                            Check In
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {attendees.length === 0 && (
                  <tr>
                    <td className="p-6 text-center text-slate-500 font-mono" colSpan={4}>No registrations yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </BrutalCard>
      )}
    </div>
  );
}
