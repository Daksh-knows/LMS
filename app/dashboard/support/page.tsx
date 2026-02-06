"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, MessageCircle, Send, Loader2, CheckCircle2, 
  Clock, XCircle, ChevronLeft 
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { showToast } from "@/utils/Toast";

export default function StudentSupportPage() {
  const { data: session } = useSession();
  const [view, setView] = useState<'LIST' | 'CREATE' | 'CHAT'>('LIST');
  const [tickets, setTickets] = useState<any[]>([]);
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form States
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [replyText, setReplyText] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (view === 'CHAT') chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeTicket, view]);

  const fetchTickets = async () => {
    const res = await fetch("/api/support");
    const data = await res.json();
    if (data.success) setTickets(data.data);
    setLoading(false);
  };

  const createTicket = async () => {
    if (!subject || !message) return toast.error("Please fill all fields");

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        body: JSON.stringify({ subject, message, priority }),
      });
      if (res.ok) {
        showToast.success("Ticket created!");
        setSubject(""); setMessage("");
        fetchTickets();
        setView('LIST');
      } else throw new Error();
    } catch {
      showToast.error("Failed to create ticket");
    }
  };

  const openTicket = async (ticketId: string) => {
    const res = await fetch(`/api/support/${ticketId}`);
    const data = await res.json();
    if (data.success) {
      setActiveTicket(data.data);
      setView('CHAT');
    }
  };

  const sendReply = async () => {
    if (!replyText.trim()) return;
    try {
      const res = await fetch(`/api/support/${activeTicket.id}`, {
        method: "POST",
        body: JSON.stringify({ message: replyText }),
      });
      const data = await res.json();
      if (data.success) {
        const newMessage = {
            ...data.data,
            sender: { name: session?.user?.name, role: "STUDENT" }
        };
        setActiveTicket((prev: any) => ({
          ...prev,
          messages: [...prev.messages, newMessage]
        }));
        setReplyText("");
      }
    } catch (err: any) {
      showToast.error(err.message || "Failed to send");
    }
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-gray-400"/></div>;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 min-h-[85vh]">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">Support Center</h1>
          <p className="text-sm md:text-base text-gray-500">Need help? We're here for you.</p>
        </div>
        {view === 'LIST' && (
          <button 
            onClick={() => setView('CREATE')}
            className="w-full sm:w-auto bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-105 transition-transform"
          >
            <Plus size={18} /> New Ticket
          </button>
        )}
        {view !== 'LIST' && (
          <button onClick={() => setView('LIST')} className="text-gray-500 hover:text-black flex items-center gap-2 font-bold transition-colors">
            <ChevronLeft size={20} /> Back to Tickets
          </button>
        )}
      </div>

      {/* VIEW: TICKET LIST */}
      {view === 'LIST' && (
        <div className="space-y-4">
          {tickets.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <MessageCircle size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-400 font-bold">No tickets yet.</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <div 
                key={ticket.id} 
                onClick={() => openTicket(ticket.id)}
                className="bg-white border border-gray-100 p-5 md:p-6 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-base md:text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {ticket.subject}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-400">
                       <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                       <span className="hidden sm:inline">•</span>
                       <span className={ticket.priority === 'HIGH' ? 'text-red-500' : 'text-gray-400'}>{ticket.priority} Priority</span>
                    </div>
                  </div>
                  <TicketStatusBadge status={ticket.status} />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* VIEW: CREATE FORM */}
      {view === 'CREATE' && (
        <div className="bg-white border border-gray-200 p-6 md:p-8 rounded-3xl max-w-2xl mx-auto shadow-sm">
          <h2 className="text-xl font-bold mb-6">Create New Ticket</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Subject</label>
              <input 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)}
                className="w-full mt-1.5 p-3 border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-black transition-all"
                placeholder="Brief summary"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Priority</label>
              <select 
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full mt-1.5 p-3 border border-gray-200 rounded-xl font-medium appearance-none bg-white"
              >
                <option value="LOW">Low - General Question</option>
                <option value="MEDIUM">Medium - Need Help</option>
                <option value="HIGH">High - Urgent Issue</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description</label>
              <textarea 
                value={message} 
                onChange={(e) => setMessage(e.target.value)}
                className="w-full mt-1.5 p-3 border border-gray-200 rounded-xl font-medium min-h-[120px] md:min-h-[150px] focus:outline-none focus:ring-2 focus:ring-black transition-all"
                placeholder="Explain in detail..."
              />
            </div>
            <button 
              onClick={createTicket}
              className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors shadow-lg active:scale-[0.98]"
            >
              Submit Ticket
            </button>
          </div>
        </div>
      )}

      {/* VIEW: CHAT INTERFACE */}
      {view === 'CHAT' && activeTicket && (
        <div className="flex flex-col h-[75vh] md:h-[70vh] bg-white border border-gray-200 rounded-2xl md:rounded-3xl shadow-sm overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 md:p-6 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h2 className="font-bold text-base md:text-lg line-clamp-1">{activeTicket.subject}</h2>
                <div className="flex items-center gap-2 text-[10px] text-gray-500">
                   <span className="font-mono">#{activeTicket.id.slice(-6)}</span>
                   <TicketStatusBadge status={activeTicket.status} />
                </div>
              </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 bg-slate-50">
            {activeTicket.messages.map((msg: any) => {
              const isMe = msg.senderId === session?.user?.id;
              const isAdmin = msg.sender.role === 'ADMIN';
              
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] sm:max-w-[80%] ${isMe ? 'order-1' : 'order-2'}`}>
                     <div className={`flex items-center gap-2 mb-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">
                          {isAdmin ? 'Support Team' : msg.sender.name}
                        </span>
                        {isAdmin && <CheckCircle2 size={12} className="text-blue-500" />}
                     </div>
                     <div className={`p-3 md:p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                       isMe ? 'bg-black text-white rounded-tr-none' 
                       : isAdmin ? 'bg-blue-600 text-white rounded-tl-none' 
                       : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                     }`}>
                       {msg.message}
                     </div>
                     <span className={`text-[10px] text-gray-400 mt-1 block ${isMe ? 'text-right' : 'text-left'}`}>
                       {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                     </span>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Reply Input */}
          <div className="p-3 md:p-4 bg-white border-t border-gray-100">
             {activeTicket.status === 'CLOSED' ? (
               <div className="text-center py-3 bg-gray-50 rounded-xl text-gray-500 font-bold text-xs md:text-sm">
                 This ticket is closed.
               </div>
             ) : (
               <div className="flex gap-2 md:gap-3">
                 <input 
                   value={replyText}
                   onChange={(e) => setReplyText(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && sendReply()}
                   className="flex-1 bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black focus:outline-none"
                   placeholder="Type your reply..."
                 />
                 <button 
                   onClick={sendReply}
                   className="bg-black text-white p-3 rounded-xl hover:bg-gray-800 transition-colors shrink-0"
                 >
                   <Send size={20} />
                 </button>
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
}

function TicketStatusBadge({ status }: { status: string }) {
  const styles = {
    OPEN: "bg-green-100 text-green-700 border-green-200",
    IN_PROGRESS: "bg-blue-100 text-blue-700 border-blue-200",
    CLOSED: "bg-gray-100 text-gray-500 border-gray-200",
  };
  const icons = {
    OPEN: <CheckCircle2 size={12} />,
    IN_PROGRESS: <Clock size={12} />,
    CLOSED: <XCircle size={12} />,
  };
  // @ts-ignore
  return <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border shrink-0 ${styles[status]}`}>
    {/* @ts-ignore */}
    {icons[status]} {status.replace('_', ' ')}
  </div>
}