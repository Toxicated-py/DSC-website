import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Users, ArrowLeft, Check, Calendar, MapPin, QrCode } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";




import { apiGet, apiPatch, apiPost, userFriendlyErrorMessage } from "../lib/apiClient";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { BrutalButton, BrutalCard, BrutalBadge, BrutalInput } from "../components/ui/brutal";
import { fonts } from "../config/fonts";

const formatEventDate = (date: Date) =>
  `${date.toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}, ${date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false })}`;

const remainingLabel = (date: Date) => {
  const diff = date.getTime() - Date.now();
  if (diff <= 0) return "ended";
  const minutes = Math.ceil(diff / 6e4);
  if (minutes < 60) return `${minutes} min remaining`;
  const hours = Math.ceil(minutes / 60);
  return hours < 24 ? `${hours} hrs remaining` : `${Math.ceil(hours / 24)} days remaining`;
};

const eventTimeLabel = (startDate: Date, endDate?: Date | null) => {
  const now = Date.now();
  if (startDate.getTime() > now) return remainingLabel(startDate);
  if (!endDate || endDate.getTime() > now) return "running";
  return "ended";
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
  const [showReserveChoice, setShowReserveChoice] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestForm, setGuestForm] = useState({
    name: "",
    email: "",
    phone: "",
    institution: "",
    teamName: "",
    member2Name: "",
    member2Email: "",
    member3Name: "",
    member3Email: "",
    member4Name: "",
    member4Email: "",
  });

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
    const eventApiId = eventInfo?.id || id;
    if (!eventApiId) {
      setReserveStatus("Invalid event.");
      return;
    }

    const user = isSupabaseConfigured && supabase
      ? (await supabase.auth.getUser()).data.user
      : null;
    if (!user) {
      setShowReserveChoice(true);
      return;
    }

    try {
      setReservingSpot(true);
      const result = await apiPost<any>(`/api/events/${eventApiId}/reserve`, {}, { auth: true });
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

  const reserveGuestSpot = async (event: React.FormEvent) => {
    event.preventDefault();
    const eventApiId = eventInfo?.id || id;
    if (reservingSpot || !eventApiId) return;
    setReserveStatus("");

    const members = [
      { name: guestForm.member2Name.trim(), email: guestForm.member2Email.trim() },
      { name: guestForm.member3Name.trim(), email: guestForm.member3Email.trim() },
      { name: guestForm.member4Name.trim(), email: guestForm.member4Email.trim() },
    ].filter((member) => member.name || member.email);
    if (members.some((member) => !member.name || !member.email)) {
      setReserveStatus("Each team member needs both name and email.");
      return;
    }
    const registrationKind = displayEvent?.registration_mode === "team" ? "team" : "individual";
    const minSize = Math.max(1, Number(displayEvent?.team_min_size || (registrationKind === "team" ? 2 : 1)));

    if (registrationKind === "team" && members.length + 1 < Math.max(2, minSize)) {
      setReserveStatus(`Team registration needs at least ${Math.max(2, minSize)} people.`);
      return;
    }

    try {
      setReservingSpot(true);
      setReserveStatus("Submitting guest registration...");
      const result = await apiPost<any>(`/api/events/${eventApiId}/guest-reserve`, {
        name: guestForm.name.trim(),
        email: guestForm.email.trim(),
        phone: guestForm.phone.trim() || null,
        institution: guestForm.institution.trim() || null,
        registration_kind: registrationKind,
        team_name: guestForm.teamName.trim() || null,
        team_members: members,
      });
      setMyRegistration(result.registration || null);
      setReserveStatus(result.message === "Already registered."
        ? "You already registered as a guest."
        : "Guest registration complete. Save your ticket code.");
      setShowGuestForm(false);
      setShowReserveChoice(false);
      setEventInfo((current: any) => {
        if (!current) return current;
        const nextCount = Number(result.registered_count ?? result.registeredCount ?? Number(current.registeredCount || current.registered_count || 0) + 1);
        return { ...current, registeredCount: nextCount, registered_count: nextCount };
      });
    } catch (error: any) {
      setReserveStatus(userFriendlyErrorMessage(error, "Could not register as guest. Please try again."));
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
  const endDate = displayEvent.end_time ? new Date(displayEvent.end_time) : null;
  const eventEnded = Boolean(displayEvent.end_time && new Date(displayEvent.end_time).getTime() < Date.now());
  const registrationDeadline = displayEvent.registration_deadline ? new Date(displayEvent.registration_deadline) : null;
  const registrationClosedByDeadline = Boolean(registrationDeadline && registrationDeadline.getTime() < Date.now());
  const registrationClosed = !displayEvent.registration_open || registrationClosedByDeadline;
  const isReserved = Boolean(myRegistration?.id);
  const isTeamEvent = displayEvent.registration_mode === "team";
  const teamMaxSize = Math.min(4, Math.max(2, Number(displayEvent.team_max_size || 2)));

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
          <span className="flex items-center gap-2"><Calendar size={16}/> {startDate ? `${formatEventDate(startDate)} - ${eventTimeLabel(startDate, endDate)}` : "Date TBA"}</span>
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
                {myRegistration.user_id ? (
                  <BrutalButton onClick={() => navigate(`/ticket/${myRegistration.id}`, { state: { from: `/events/${id}` } })} className="w-full" color="bg-[#FFE800]" text="text-[#171717]">
                    <QrCode size={16} /> View Ticket
                  </BrutalButton>
                ) : (
                  <div className="border-2 border-[#171717] bg-white p-4 text-center">
                    {myRegistration.ticket_code && <QRCodeCanvas value={myRegistration.ticket_code} size={140} className="mx-auto mb-3" />}
                    <p className="text-xs font-bold uppercase tracking-widest">Guest ticket code</p>
                    <p className="break-all font-mono text-xs">{myRegistration.ticket_code}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <BrutalButton onClick={reserveSpot} className="w-full" color="bg-[#FB7185]" text="text-white" disabled={registrationClosed || reservingSpot}>
                  {registrationClosed ? "Registration Closed" : reservingSpot ? "Reserving..." : "Reserve Spot"}
                </BrutalButton>
                {showReserveChoice && !registrationClosed && (
                  <div className="grid gap-3">
                    <BrutalButton onClick={() => navigate(`/login?redirect=${encodeURIComponent(`/events/${id}`)}`)} className="w-full" color="bg-[#171717]" text="text-white">
                      Login Now
                    </BrutalButton>
                    <BrutalButton onClick={() => setShowGuestForm((current) => !current)} className="w-full" color="bg-[#FFE800]" text="text-[#171717]">
                      Guest Registration
                    </BrutalButton>
                  </div>
                )}
                {showGuestForm && (
                  <form onSubmit={reserveGuestSpot} className="border-2 border-[#171717] bg-white p-4 brutal-shadow">
                    <div className="mb-4">
                      <BrutalBadge color="bg-[#FFE800]" text="text-[#171717]">{isTeamEvent ? "Team Lead" : "Guest Details"}</BrutalBadge>
                      <p className="mt-3 text-xs font-mono text-slate-600">
                        {isTeamEvent ? `Register your team. Max ${teamMaxSize} people.` : "No account needed. Your ticket appears after submission."}
                      </p>
                    </div>
                    <div className="grid gap-3">
                      <BrutalInput label="Full Name" value={guestForm.name} onChange={(event) => setGuestForm({ ...guestForm, name: event.target.value })} required disabled={reservingSpot} />
                      <BrutalInput label="Email" type="email" value={guestForm.email} onChange={(event) => setGuestForm({ ...guestForm, email: event.target.value })} required disabled={reservingSpot} />
                      <BrutalInput label="Phone Optional" value={guestForm.phone} onChange={(event) => setGuestForm({ ...guestForm, phone: event.target.value })} disabled={reservingSpot} />
                      <BrutalInput label="Institution" value={guestForm.institution} onChange={(event) => setGuestForm({ ...guestForm, institution: event.target.value })} disabled={reservingSpot} />
                    </div>
                    {isTeamEvent && (
                      <div className="mt-5 border-t-2 border-[#171717] pt-4">
                        <BrutalInput label="Team Name" value={guestForm.teamName} onChange={(event) => setGuestForm({ ...guestForm, teamName: event.target.value })} disabled={reservingSpot} />
                        <div className="border-2 border-[#171717] bg-slate-50 p-3">
                          <p className="mb-3 text-xs font-bold uppercase tracking-widest">Member 2 Required</p>
                          <BrutalInput label="Name" value={guestForm.member2Name} onChange={(event) => setGuestForm({ ...guestForm, member2Name: event.target.value })} required disabled={reservingSpot} />
                          <BrutalInput label="Email" type="email" value={guestForm.member2Email} onChange={(event) => setGuestForm({ ...guestForm, member2Email: event.target.value })} required disabled={reservingSpot} />
                        </div>
                        {teamMaxSize >= 3 && (
                          <div className="mt-3 border-2 border-[#171717] bg-slate-50 p-3">
                            <p className="mb-3 text-xs font-bold uppercase tracking-widest">Member 3 Optional</p>
                            <BrutalInput label="Name" value={guestForm.member3Name} onChange={(event) => setGuestForm({ ...guestForm, member3Name: event.target.value })} disabled={reservingSpot} />
                            <BrutalInput label="Email" type="email" value={guestForm.member3Email} onChange={(event) => setGuestForm({ ...guestForm, member3Email: event.target.value })} disabled={reservingSpot} />
                          </div>
                        )}
                        {teamMaxSize >= 4 && (
                          <div className="mt-3 border-2 border-[#171717] bg-slate-50 p-3">
                            <p className="mb-3 text-xs font-bold uppercase tracking-widest">Member 4 Optional</p>
                            <BrutalInput label="Name" value={guestForm.member4Name} onChange={(event) => setGuestForm({ ...guestForm, member4Name: event.target.value })} disabled={reservingSpot} />
                            <BrutalInput label="Email" type="email" value={guestForm.member4Email} onChange={(event) => setGuestForm({ ...guestForm, member4Email: event.target.value })} disabled={reservingSpot} />
                          </div>
                        )}
                      </div>
                    )}
                    <BrutalButton type="submit" className="mt-4 w-full" disabled={reservingSpot}>
                      {reservingSpot ? "Submitting..." : "Submit Guest Registration"}
                    </BrutalButton>
                  </form>
                )}
              </div>
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
                  const attendeeName = profile?.full_name || profile?.email || attendee.guest_name || attendee.guest_email || "Guest";
                  return (
                    <tr key={attendee.id} className="border-b border-slate-200">
                      <td className="p-3 font-bold">
                        {attendeeName}
                        {attendee.registration_kind === "team" && attendee.team_name && (
                          <span className="block font-mono text-[11px] text-slate-500">{attendee.team_name}</span>
                        )}
                      </td>
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
