"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  MessageCircle, Send, Loader2, CheckCircle2, 
  Clock, XCircle, User, Lock, Unlock, Filter, ArrowUpDown, CheckSquare 
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { showToast } from "@/utils/Toast";

// Helper for badges
function TicketStatusBadge({ status }: { status: string }) {
    const styles: any = {
      OPEN: "bg-green-100 text-green-700 border-green-200",
      IN_PROGRESS: "bg-blue-100 text-blue-700 border-blue-200",
      CLOSED: "bg-gray-100 text-gray-500 border-gray-200",
    };
    return (
      <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${styles[status]}`}>
        {status.replace('_', ' ')}
      </div>
    );
}

export default function AdminSupportPage() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<any[]>([]);
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // --- FILTER STATES ---
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // --- REPLY STATES ---
  const [replyText, setReplyText] = useState("");
  const [markResolved, setMarkResolved] = useState(false); // New Checkbox State
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchTickets(); }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [activeTicket]);

  const fetchTickets = async () => {
    try {
        const res = await fetch("/api/support");
        const data = await res.json();
        if (data.success) setTickets(data.data);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  // --- FILTERING LOGIC ---
  const filteredTickets = useMemo(() => {
    return tickets
      .filter(t => filterStatus === "ALL" ? true : t.status === filterStatus)
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt).getTime();
        const dateB = new Date(b.updatedAt).getTime();
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
      });
  }, [tickets, filterStatus, sortOrder]);

  const openTicket = async (ticketId: string) => {
    const res = await fetch(`/api/support/${ticketId}`);
    const data = await res.json();
    if (data.success) {
        setActiveTicket(data.data);
        setMarkResolved(false); // Reset checkbox when opening new ticket
    }
  };

  const sendReply = async () => {
    if (!replyText.trim()) return;
    
    // Determine status: If checkbox checked -> CLOSED, else let API decide (IN_PROGRESS)
    const newStatus = markResolved ? 'CLOSED' : undefined;

    try {
      const res = await fetch(`/api/support/${activeTicket.id}`, {
        method: "POST",
        // Send the status along with the message
        body: JSON.stringify({ message: replyText, newStatus }), 
      });
      
      const data = await res.json();
      
      if (data.success) {
        const newMessage = { ...data.data, sender: { name: session?.user?.name, role: "ADMIN" } };
        
        // Update local state immediately
        setActiveTicket((prev: any) => ({ 
            ...prev, 
            messages: [...prev.messages, newMessage],
            status: newStatus || 'IN_PROGRESS' 
        }));
        
        setReplyText("");
        setMarkResolved(false);
        fetchTickets(); // Refresh sidebar list to update status/order
        
        if(newStatus === 'CLOSED') showToast.success("Ticket resolved and closed");
      }
    } catch (e) {
      showToast.error("Failed to send reply");
    }
  };

  const toggleStatus = async () => {
    const newStatus = activeTicket.status === 'CLOSED' ? 'IN_PROGRESS' : 'CLOSED';
    await fetch(`/api/support/${activeTicket.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: newStatus }),
    });
    setActiveTicket((prev: any) => ({ ...prev, status: newStatus }));
    fetchTickets();
    showToast.success(`Ticket ${newStatus === 'CLOSED' ? 'Closed' : 'Reopened'}`);
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-blue-600"/></div>;

  return (
    <div 
  className="max-w-7xl mx-auto p-6 h-[90vh] flex gap-6"
  style={{ backgroundColor: 'var(--color-background)' }}
>
  
  {/* LEFT: Ticket List */}
  <div 
    className="w-1/3 rounded-3xl overflow-hidden flex flex-col border shadow-sm"
    style={{ 
      backgroundColor: 'var(--color-card)', 
      borderColor: 'var(--color-border)' 
    }}
  >
     
     {/* Filter Header */}
     <div 
       className="p-4 border-b space-y-3"
       style={{ 
         borderColor: 'var(--color-border-muted)',
         backgroundColor: 'var(--color-card-muted)' 
       }}
     >
       <div className="flex justify-between items-center">
         <h2 
           className="font-black text-lg"
           style={{ color: 'var(--color-foreground)' }}
         >
           Inbox
         </h2>
         <span 
           className="text-xs font-bold px-2 py-1 rounded border"
           style={{ 
             backgroundColor: 'var(--color-card)', 
             borderColor: 'var(--color-border-muted)',
             color: 'var(--color-foreground)',
             opacity: 0.8
           }}
         >
            {filteredTickets.length} items
         </span>
       </div>

       <div className="flex gap-2">
         {/* Status Filter */}
         <div className="relative flex-1">
            <Filter size={12} className="absolute left-2 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" style={{ color: 'var(--color-foreground)' }} />
            <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-7 pr-2 py-1.5 text-xs font-bold border rounded-lg outline-none appearance-none cursor-pointer transition-all hover:brightness-95"
                style={{ 
                  backgroundColor: 'var(--color-card)',
                  borderColor: 'var(--color-border-muted)',
                  color: 'var(--color-foreground)'
                }}
            >
                <option value="ALL">All Status</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="CLOSED">Closed</option>
            </select>
         </div>
         
         {/* Sort Filter */}
         <div className="relative flex-1">
            <ArrowUpDown size={12} className="absolute left-2 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" style={{ color: 'var(--color-foreground)' }} />
            <select 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="w-full pl-7 pr-2 py-1.5 text-xs font-bold border rounded-lg outline-none appearance-none cursor-pointer transition-all hover:brightness-95"
                style={{ 
                  backgroundColor: 'var(--color-card)',
                  borderColor: 'var(--color-border-muted)',
                  color: 'var(--color-foreground)'
                }}
            >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
            </select>
         </div>
       </div>
     </div>

     {/* List */}
     <div 
       className="overflow-y-auto flex-1 p-2 space-y-2"
       style={{ backgroundColor: 'var(--color-input-bg)' }} // Gray-50/Zinc-800
     >
        {filteredTickets.map((ticket) => {
          const isActive = activeTicket?.id === ticket.id;
          return (
            <div 
              key={ticket.id} 
              onClick={() => openTicket(ticket.id)}
              className={`p-4 rounded-xl cursor-pointer border transition-all ${isActive ? 'shadow-sm' : 'hover:shadow-sm'}`}
              style={{ 
                backgroundColor: isActive ? 'var(--color-brand-muted)' : 'var(--color-card)',
                borderColor: isActive ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
              }}
            >
              <div className="flex justify-between mb-2">
                  <h3 
                    className="font-bold text-sm truncate w-3/4 transition-colors"
                    style={{ 
                      color: isActive ? 'var(--color-brand-blue)' : 'var(--color-foreground)' 
                    }}
                  >
                    {ticket.subject}
                  </h3>
                  <TicketStatusBadge status={ticket.status} />
              </div>
              <div 
                className="flex items-center gap-2 text-xs"
                style={{ color: 'var(--color-foreground)', opacity: 0.6 }}
              >
                  <User size={12} /> {ticket.user.name}
              </div>
              <div 
                className="mt-2 text-[10px] font-mono flex items-center gap-1"
                style={{ color: 'var(--color-foreground)', opacity: 0.4 }}
              >
                  <Clock size={10} /> {new Date(ticket.updatedAt).toLocaleDateString()}
              </div>
            </div>
          );
        })}
        {filteredTickets.length === 0 && (
            <p className="text-center text-xs py-10" style={{ color: 'var(--color-foreground)', opacity: 0.4 }}>
              No tickets found.
            </p>
        )}
     </div>
  </div>

  {/* RIGHT: Chat Window */}
  <div 
    className="flex-1 rounded-3xl overflow-hidden flex flex-col relative border shadow-sm"
    style={{ 
      backgroundColor: 'var(--color-card)', 
      borderColor: 'var(--color-border)' 
    }}
  >
    {activeTicket ? (
      <>
        {/* Chat Header */}
        <div 
          className="p-6 border-b flex justify-between items-center z-10"
          style={{ 
            backgroundColor: 'var(--color-card)',
            borderColor: 'var(--color-border-muted)'
          }}
        >
           <div>
              <h2 className="font-bold text-lg" style={{ color: 'var(--color-foreground)' }}>
                {activeTicket.subject}
              </h2>
              <div 
                className="flex items-center gap-2 text-xs mt-1"
                style={{ color: 'var(--color-foreground)', opacity: 0.6 }}
              >
                 <span 
                   className="px-2 py-0.5 rounded font-medium"
                   style={{ backgroundColor: 'var(--color-card-muted)' }}
                 >
                   {activeTicket.user.name}
                 </span>
                 <span>{activeTicket.user.email}</span>
              </div>
           </div>
           
           <button 
             onClick={toggleStatus}
             className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs border transition-all"
             style={{
               backgroundColor: activeTicket.status === 'CLOSED' ? 'var(--color-card)' : 'var(--color-foreground)',
               borderColor: activeTicket.status === 'CLOSED' ? 'var(--color-border)' : 'transparent',
               color: activeTicket.status === 'CLOSED' ? 'var(--color-foreground)' : 'var(--color-background)',
             }}
           >
             {activeTicket.status === 'CLOSED' ? <Unlock size={14}/> : <Lock size={14}/>}
             {activeTicket.status === 'CLOSED' ? 'Reopen Ticket' : 'Close Ticket'}
           </button>
        </div>

        {/* Messages Area */}
        <div 
          className="flex-1 overflow-y-auto p-8 space-y-6"
          style={{ backgroundColor: 'var(--color-input-bg)' }} // Gray-50 / Zinc-800
        >
           {activeTicket.messages.map((msg: any) => {
              const isAdmin = msg.sender.role === 'ADMIN';
              return (
                <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                   <div 
                     className={`max-w-[75%] p-4 rounded-2xl text-sm shadow-sm leading-relaxed ${isAdmin ? 'rounded-tr-none' : 'rounded-tl-none'}`}
                     style={{
                       backgroundColor: isAdmin ? 'var(--color-brand-blue)' : 'var(--color-card)',
                       color: isAdmin ? 'var(--color-brand-contrast)' : 'var(--color-foreground)',
                       border: isAdmin ? 'none' : '1px solid var(--color-border-muted)'
                     }}
                   >
                      <div 
                        className="text-[9px] font-bold mb-1 uppercase tracking-wider"
                        style={{ 
                          color: isAdmin ? 'rgba(255,255,255,0.7)' : 'var(--color-foreground)',
                          opacity: isAdmin ? 1 : 0.4 
                        }}
                      >
                         {isAdmin ? 'You' : msg.sender.name}
                      </div>
                      {msg.message}
                   </div>
                </div>
              )
           })}
           <div ref={chatEndRef} />
        </div>

        {/* Reply Area */}
        <div 
          className="p-4 border-t"
          style={{ 
            backgroundColor: 'var(--color-card)',
            borderColor: 'var(--color-border-muted)'
          }}
        >
           <div className="flex flex-col gap-3">
             {activeTicket.status !== 'CLOSED' && (
                <label 
                  className="flex items-center gap-2 text-xs font-bold cursor-pointer w-fit ml-1"
                  style={{ color: 'var(--color-foreground)', opacity: 0.7 }}
                >
                    <input 
                        type="checkbox" 
                        checked={markResolved} 
                        onChange={(e) => setMarkResolved(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 accent-blue-600"
                    />
                    Mark as Resolved & Close
                </label>
             )}
             
             <div className="flex gap-3">
                <input 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendReply()}
                  disabled={activeTicket.status === 'CLOSED'}
                  className="flex-1 rounded-xl px-4 py-3 border outline-none disabled:opacity-50 transition-all text-sm font-medium"
                  style={{ 
                    backgroundColor: 'var(--color-input-bg)',
                    borderColor: 'var(--color-border-muted)',
                    color: 'var(--color-foreground)'
                  }}
                  placeholder={activeTicket.status === 'CLOSED' ? "Ticket is closed" : "Type your reply..."}
                />
                
                <button 
                  onClick={sendReply}
                  disabled={activeTicket.status === 'CLOSED' || !replyText.trim()}
                  className="p-3 rounded-xl transition-all flex items-center gap-2 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:brightness-110 active:scale-95"
                  style={{
                    backgroundColor: activeTicket.status === 'CLOSED' || !replyText.trim() 
                      ? 'var(--color-card-muted)' 
                      : 'var(--color-brand-blue)',
                    color: activeTicket.status === 'CLOSED' || !replyText.trim()
                      ? 'var(--color-foreground)' // Gray text when disabled
                      : 'var(--color-brand-contrast)',
                    opacity: activeTicket.status === 'CLOSED' || !replyText.trim() ? 0.5 : 1
                  }}
                >
                  <span>{markResolved ? 'Send & Close' : 'Send'}</span>
                  <Send size={18} />
                </button>
             </div>
           </div>
        </div>
      </>
    ) : (
      <div className="flex-1 flex flex-col items-center justify-center">
          <MessageCircle size={64} className="mb-4" style={{ color: 'var(--color-foreground)', opacity: 0.1 }} />
          <p className="font-bold text-sm" style={{ color: 'var(--color-foreground)', opacity: 0.4 }}>
            Select a ticket to view conversation
          </p>
      </div>
    )}
  </div>
</div>
  );
}