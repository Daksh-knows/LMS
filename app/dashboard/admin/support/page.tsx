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
    <div className="max-w-7xl mx-auto p-6 h-[90vh] flex gap-6">
      
      {/* LEFT: Ticket List */}
      <div className="w-1/3 bg-white border border-gray-200 rounded-3xl overflow-hidden flex flex-col shadow-sm">
         
         {/* Filter Header */}
         <div className="p-4 border-b border-gray-100 bg-gray-50 space-y-3">
           <div className="flex justify-between items-center">
             <h2 className="font-black text-lg text-gray-800">Inbox</h2>
             <span className="text-xs font-bold bg-white px-2 py-1 rounded border border-gray-200">
                {filteredTickets.length} items
             </span>
           </div>

           <div className="flex gap-2">
             <div className="relative flex-1">
                <Filter size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full pl-7 pr-2 py-1.5 text-xs font-bold border border-gray-200 rounded-lg bg-white outline-none focus:border-blue-500 appearance-none"
                >
                    <option value="ALL">All Status</option>
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="CLOSED">Closed</option>
                </select>
             </div>
             
             <div className="relative flex-1">
                <ArrowUpDown size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                <select 
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as any)}
                    className="w-full pl-7 pr-2 py-1.5 text-xs font-bold border border-gray-200 rounded-lg bg-white outline-none focus:border-blue-500 appearance-none"
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                </select>
             </div>
           </div>
         </div>

         {/* List */}
         <div className="overflow-y-auto flex-1 p-2 space-y-2 bg-gray-50/50">
            {filteredTickets.map((ticket) => (
              <div 
                key={ticket.id} 
                onClick={() => openTicket(ticket.id)}
                className={`p-4 rounded-xl cursor-pointer border transition-all ${
                  activeTicket?.id === ticket.id 
                  ? 'bg-blue-50 border-blue-200 shadow-sm' 
                  : 'bg-white border-transparent hover:bg-white hover:shadow-sm'
                }`}
              >
                <div className="flex justify-between mb-2">
                   <h3 className={`font-bold text-sm truncate w-3/4 ${activeTicket?.id === ticket.id ? 'text-blue-700' : 'text-gray-800'}`}>
                     {ticket.subject}
                   </h3>
                   <TicketStatusBadge status={ticket.status} />
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                   <User size={12} /> {ticket.user.name}
                </div>
                <div className="mt-2 text-[10px] text-gray-400 font-mono flex items-center gap-1">
                   <Clock size={10} /> {new Date(ticket.updatedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
            {filteredTickets.length === 0 && (
                <p className="text-center text-xs text-gray-400 py-10">No tickets found.</p>
            )}
         </div>
      </div>

      {/* RIGHT: Chat Window */}
      <div className="flex-1 bg-white border border-gray-200 rounded-3xl overflow-hidden flex flex-col relative shadow-sm">
        {activeTicket ? (
          <>
            <div className="p-6 border-b border-gray-100 bg-white flex justify-between items-center z-10">
               <div>
                  <h2 className="font-bold text-lg text-gray-900">{activeTicket.subject}</h2>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                     <span className="bg-gray-100 px-2 py-0.5 rounded font-medium">{activeTicket.user.name}</span>
                     <span>{activeTicket.user.email}</span>
                  </div>
               </div>
               <button 
                 onClick={toggleStatus}
                 className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs border transition-colors ${
                   activeTicket.status === 'CLOSED' 
                   ? 'bg-white border-gray-200 hover:bg-gray-50 text-gray-600' 
                   : 'bg-gray-900 text-white hover:bg-black border-transparent'
                 }`}
               >
                 {activeTicket.status === 'CLOSED' ? <Unlock size={14}/> : <Lock size={14}/>}
                 {activeTicket.status === 'CLOSED' ? 'Reopen Ticket' : 'Close Ticket'}
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50">
               {activeTicket.messages.map((msg: any) => {
                  const isAdmin = msg.sender.role === 'ADMIN';
                  return (
                    <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-[75%] p-4 rounded-2xl text-sm shadow-sm leading-relaxed ${
                         isAdmin 
                            ? 'bg-blue-600 text-white rounded-tr-none' 
                            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                       }`}>
                          <div className={`text-[9px] font-bold mb-1 uppercase tracking-wider ${isAdmin ? 'text-blue-100' : 'text-gray-400'}`}>
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
            <div className="p-4 bg-white border-t border-gray-100">
               <div className="flex flex-col gap-3">
                 {activeTicket.status !== 'CLOSED' && (
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-600 cursor-pointer w-fit ml-1">
                        <input 
                            type="checkbox" 
                            checked={markResolved} 
                            onChange={(e) => setMarkResolved(e.target.checked)}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
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
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600 focus:outline-none disabled:opacity-50 transition-all text-sm font-medium"
                    placeholder={activeTicket.status === 'CLOSED' ? "Ticket is closed" : "Type your reply..."}
                    />
                    <button 
                    onClick={sendReply}
                    disabled={activeTicket.status === 'CLOSED' || !replyText.trim()}
                    className={`p-3 rounded-xl transition-all flex items-center gap-2 font-bold text-sm ${
                        activeTicket.status === 'CLOSED' || !replyText.trim()
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md active:scale-95'
                    }`}
                    >
                    <span>{markResolved ? 'Send & Close' : 'Send'}</span>
                    <Send size={18} />
                    </button>
                 </div>
               </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
             <MessageCircle size={64} className="mb-4 opacity-10" />
             <p className="font-bold text-sm">Select a ticket to view conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}