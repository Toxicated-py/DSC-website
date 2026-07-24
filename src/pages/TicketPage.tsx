import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, QrCode } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";



import { apiGet, userFriendlyErrorMessage } from "../lib/apiClient";
import { BrutalCard, BrutalBadge } from "../components/ui";

import { fonts } from "../config/fonts";

export function TicketPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { ticketId } = useParams();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [ticketStatus, setTicketStatus] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadTickets() {
      setLoadingTickets(true);
      const rows = await apiGet<any[]>("/api/me/tickets", { auth: true }).catch((error) => {
        if (error?.status === 401) {
          navigate(`/login?redirect=${encodeURIComponent(ticketId ? `/ticket/${ticketId}` : "/tickets")}`);
          return [];
        }
        setTicketStatus(userFriendlyErrorMessage(error, "Could not load tickets. Please refresh and try again."));
        return [];
      });
      if (!mounted) return;
      setTickets(rows || []);
      setLoadingTickets(false);
    }

    loadTickets();

    return () => {
      mounted = false;
    };
  }, [navigate, ticketId]);

  const selectedTicket = ticketId ? tickets.find((ticket) => ticket.id === ticketId) : null;
  const upcomingTickets = tickets.filter((ticket) => {
    const eventTime = ticket.event?.end_time || ticket.event?.start_time;
    return !eventTime || new Date(eventTime).getTime() >= Date.now();
  });
  const previousTickets = tickets.filter((ticket) => {
    const eventTime = ticket.event?.end_time || ticket.event?.start_time;
    return eventTime && new Date(eventTime).getTime() < Date.now();
  });
  const renderDate = (value?: string) => value ? new Date(value).toLocaleString() : "Date TBA";

  const TicketList = ({ title, items }: { title: string; items: any[] }) => (
    <section className="space-y-4">
      <h2 className="text-3xl uppercase" style={fonts.display}>{title}</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {items.map((ticket) => (
          <button
            key={ticket.id}
            onClick={() => navigate(`/ticket/${ticket.id}`, { state: { from: "/tickets" } })}
            className="text-left bg-white border-2 border-foreground p-5 brutal-shadow brutal-shadow-hover transition-all min-w-0"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <BrutalBadge color={ticket.status === "checked_in" ? "bg-green-500" : "bg-highlight"} text={ticket.status === "checked_in" ? "text-white" : "text-foreground"}>
                  {ticket.status || "registered"}
                </BrutalBadge>
                <h3 className="mt-4 text-2xl uppercase leading-tight" style={fonts.display}>{ticket.event?.title || "Event Ticket"}</h3>
              </div>
              <QrCode size={24} />
            </div>
            <div className="mt-4 space-y-2 font-mono text-xs text-muted-foreground">
              <p>{renderDate(ticket.event?.start_time)}</p>
              <p>{ticket.event?.venue || "Venue TBA"}</p>
              <p className="font-bold text-foreground break-all">{ticket.ticket_code || ticket.id}</p>
            </div>
          </button>
        ))}
        {items.length === 0 && (
          <div className="border-2 border-dashed border-foreground p-6 text-center font-mono text-sm text-muted-foreground">
            No tickets here yet.
          </div>
        )}
      </div>
    </section>
  );

  if (loadingTickets) {
    return (
      <div className="pt-16 pb-20 px-4 sm:px-6 flex flex-col items-center justify-center min-h-screen bg-background overflow-x-hidden">
        <BrutalCard color="bg-white">
          <p className="font-mono text-sm text-muted-foreground">Loading tickets...</p>
        </BrutalCard>
      </div>
    );
  }

  if (ticketId && !selectedTicket) {
    return (
      <div className="pt-16 pb-20 px-6 max-w-[900px] mx-auto min-h-screen bg-background">
        <button onClick={() => navigate("/tickets")} className="inline-flex items-center gap-2 font-bold uppercase tracking-widest text-sm mb-8 hover:text-primary">
          <ArrowLeft size={16} /> Back to Tickets
        </button>
        <BrutalCard color="bg-white">
          <h1 className="text-4xl uppercase mb-3" style={fonts.display}>Ticket not found</h1>
          <p className="text-sm text-muted-foreground">This ticket is not available for your account.</p>
        </BrutalCard>
      </div>
    );
  }

  if (selectedTicket) {
    const attendeeName = selectedTicket.profile?.full_name || selectedTicket.profile?.email || "Member";
    const ticketCode = selectedTicket.ticket_code || selectedTicket.id;
    return (
      <div className="pt-16 pb-20 px-6 flex flex-col items-center justify-center min-h-screen bg-background">
        <button onClick={() => navigate((location.state as any)?.from || "/tickets")} className="mb-8 self-start max-w-md w-full mx-auto inline-flex items-center gap-2 font-bold uppercase tracking-widest text-sm hover:text-primary">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="relative w-full max-w-md bg-white border-2 border-foreground p-4 sm:p-6 brutal-shadow-lg sm:rotate-1">
          <div className="absolute -top-4 -right-4 bg-highlight border-2 border-foreground px-3 py-2 rotate-12 font-bold text-xs uppercase">
            {selectedTicket.status || "registered"}
          </div>

          <div className="text-center mb-6 border-b-2 border-foreground pb-6 border-dashed">
            <h2 className="text-4xl sm:text-5xl uppercase leading-none mb-2" style={fonts.display}>Event Ticket</h2>
            <p className="font-bold font-mono tracking-widest text-sm break-words">{selectedTicket.event?.title || "Reserved Event"}</p>
          </div>

          <div className="flex justify-center mb-6">
            <div className="bg-white border-2 border-foreground p-4">
              <QRCodeCanvas value={ticketCode} size={190} includeMargin />
            </div>
          </div>

          <div className="space-y-4 font-mono text-sm border-t-2 border-foreground border-dashed pt-6">
            <div className="flex justify-between gap-4 min-w-0">
              <span className="text-muted-foreground">Attendee</span>
              <span className="font-bold text-right break-words min-w-0">{attendeeName}</span>
            </div>
            <div className="flex justify-between gap-4 min-w-0">
              <span className="text-muted-foreground">Ticket</span>
              <span className="font-bold text-right break-all min-w-0">{ticketCode}</span>
            </div>
            <div className="flex justify-between gap-4 min-w-0">
              <span className="text-muted-foreground">Date</span>
              <span className="font-bold text-right break-words min-w-0">{renderDate(selectedTicket.event?.start_time)}</span>
            </div>
            <div className="flex justify-between gap-4 min-w-0">
              <span className="text-muted-foreground">Venue</span>
              <span className="font-bold text-right break-words min-w-0">{selectedTicket.event?.venue || "TBA"}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 pb-20 px-6 max-w-[1100px] mx-auto min-h-screen bg-background">
      <button onClick={() => navigate("/dashboard")} className="inline-flex items-center gap-2 font-bold uppercase tracking-widest text-sm mb-8 hover:text-primary">
        <ArrowLeft size={16} /> Back to Dashboard
      </button>
      <div className="mb-10">
        <BrutalBadge color="bg-primary" text="text-white">Tickets</BrutalBadge>
        <h1 className="mt-4 text-6xl uppercase" style={fonts.display}>My Tickets</h1>
        <p className="font-mono text-sm text-muted-foreground">Open a ticket to view its QR code.</p>
        {ticketStatus && <p className="mt-4 text-xs font-bold text-secondary">{ticketStatus}</p>}
      </div>
      <div className="space-y-10">
        <TicketList title="Available Tickets" items={upcomingTickets} />
        <TicketList title="Previous Tickets" items={previousTickets} />
      </div>
    </div>
  );
}
