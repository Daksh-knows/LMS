"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, MessageCircle, Send, Loader2, CheckCircle2, 
  Clock, XCircle, ChevronLeft 
} from "lucide-react";
import { useSession } from "next-auth/react";
import { showToast } from "@/utils/Toast";
import { motion, AnimatePresence } from "framer-motion";

export default function StudentSupportPage() {
  const { data: session } = useSession();
  const [view, setView] = useState<'LIST' | 'CREATE' | 'CHAT'>('LIST');
  const [tickets, setTickets] = useState<any[]>([]);
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [replyText, setReplyText] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchTickets(); }, []);

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
    if (!subject || !message) return showToast.error("Please fill all fields");
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

  if (loading) return (
    <div className="p-10 flex justify-center h-[60vh] items-center">
      <Loader2 className="animate-spin text-brand-blue" size={32} />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 min-h-[85vh] transition-colors duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground leading-tight tracking-tight">Support Center</h1>
          <p className="text-sm md:text-base text-foreground/50 font-medium">Need help? We're here for you.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {view === 'LIST' ? (
            <button 
              onClick={() => setView('CREATE')}
              className="w-full sm:w-auto bg-foreground text-background px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-foreground/5"
            >
              <Plus size={18} /> New Ticket
            </button>
          ) : (
            <button 
              onClick={() => setView('LIST')} 
              className="text-foreground/50 hover:text-foreground flex items-center gap-2 font-bold transition-colors"
            >
              <ChevronLeft size={20} /> Back to Tickets
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* VIEW: TICKET LIST */}
        {view === 'LIST' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {tickets.length === 0 ? (
              <div className="text-center py-20 bg-card-muted rounded-[2rem] border border-dashed border-border-muted">
                <MessageCircle size={48} className="mx-auto text-foreground/10 mb-4" />
                <p className="text-foreground/30 font-bold  tracking-widest text-xs">No tickets yet.</p>
              </div>
            ) : (
              tickets.map((ticket) => (
                <div 
                  key={ticket.id} 
                  onClick={() => openTicket(ticket.id)}
                  className="bg-card-muted border border-border-muted p-5 md:p-6 rounded-2xl shadow-sm hover:border-brand-blue/30 transition-all cursor-pointer group"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-base md:text-lg font-bold text-foreground group-hover:text-brand-blue transition-colors">
                        {ticket.subject}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-2 text-[10px] font-black  tracking-widest text-foreground/30">
                         <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                         <span className="hidden sm:inline">•</span>
                         <span className={ticket.priority === 'HIGH' ? 'text-red-500' : ''}>{ticket.priority} Priority</span>
                      </div>
                    </div>
                    <TicketStatusBadge status={ticket.status} />
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* VIEW: CREATE FORM */}
        {view === 'CREATE' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card-muted border border-border-muted p-6 md:p-8 rounded-[2rem] max-w-2xl mx-auto shadow-xl"
          >
            <h2 className="text-xl font-black text-foreground mb-6">Create New Ticket</h2>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-foreground/40  tracking-widest ml-1">Subject</label>
                <input 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full mt-2 p-4 bg-background border border-border-muted rounded-xl font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                  placeholder="Brief summary of the issue"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground/40  tracking-widest ml-1">Priority</label>
                <select 
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full mt-2 p-4 bg-background border border-border-muted rounded-xl font-medium text-foreground appearance-none cursor-pointer"
                >
                  <option value="LOW">Low - General Question</option>
                  <option value="MEDIUM">Medium - Need Help</option>
                  <option value="HIGH">High - Urgent Issue</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-foreground/40  tracking-widest ml-1">Description</label>
                <textarea 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full mt-2 p-4 bg-background border border-border-muted rounded-xl font-medium min-h-[150px] text-foreground focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                  placeholder="Tell us more about what's happening..."
                />
              </div>
              <button 
                onClick={createTicket}
                className="w-full bg-brand-blue text-white py-4 rounded-xl font-black text-lg hover:opacity-90 transition-all shadow-lg shadow-brand-blue/20 active:scale-[0.98]"
              >
                Submit Ticket
              </button>
            </div>
          </motion.div>
        )}

        {/* VIEW: CHAT INTERFACE */}
        {view === 'CHAT' && activeTicket && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col h-[75vh] md:h-[70vh] bg-card-muted border border-border-muted rounded-2xl md:rounded-[2.5rem] shadow-sm overflow-hidden"
          >
            <div className="p-4 md:p-6 border-b border-border-muted bg-foreground/[0.02] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h2 className="font-black text-foreground text-base md:text-lg line-clamp-1">{activeTicket.subject}</h2>
                <div className="flex items-center gap-3 mt-1">
                   <span className="text-[10px] font-mono text-foreground/40  tracking-wider">#{activeTicket.id.slice(-6)}</span>
                   <TicketStatusBadge status={activeTicket.status} />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-background/50">
              {activeTicket.messages.map((msg: any) => {
                const isMe = msg.senderId === session?.user?.id;
                const isAdmin = msg.sender.role === 'ADMIN';
                
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[90%] sm:max-w-[80%]`}>
                       <div className={`flex items-center gap-2 mb-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-[10px] font-black text-foreground/30  tracking-tighter">
                            {isAdmin ? 'Support Team' : msg.sender.name}
                          </span>
                          {isAdmin && <CheckCircle2 size={12} className="text-brand-blue" />}
                       </div>
                       <div className={`p-4 rounded-[1.5rem] text-sm leading-relaxed shadow-sm transition-colors ${
                         isMe ? 'bg-foreground text-background rounded-tr-none' 
                         : isAdmin ? 'bg-brand-blue text-white rounded-tl-none shadow-brand-blue/10' 
                         : 'bg-card-muted text-foreground border border-border-muted rounded-tl-none'
                       }`}>
                         {msg.message}
                       </div>
                       <span className={`text-[9px] font-bold text-foreground/20 mt-1.5 block ${isMe ? 'text-right' : 'text-left'}`}>
                         {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                       </span>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 bg-card-muted border-t border-border-muted">
               {activeTicket.status === 'CLOSED' ? (
                 <div className="text-center py-3 bg-background/50 rounded-xl text-foreground/40 font-black text-[10px]  tracking-widest border border-dashed border-border-muted">
                   This ticket has been resolved and closed.
                 </div>
               ) : (
                 <div className="flex gap-2">
                   <input 
                     value={replyText}
                     onChange={(e) => setReplyText(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && sendReply()}
                     className="flex-1 bg-background border border-border-muted rounded-xl px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue focus:outline-none transition-all"
                     placeholder="Type your message..."
                   />
                   <button 
                     onClick={sendReply}
                     className="bg-foreground text-background p-3 rounded-xl hover:opacity-90 transition-all shrink-0 active:scale-90"
                   >
                     <Send size={20} />
                   </button>
                 </div>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TicketStatusBadge({ status }: { status: string }) {
  const styles = {
    OPEN: "bg-green-500/10 text-green-500 border-green-500/20",
    IN_PROGRESS: "bg-brand-blue/10 text-brand-blue border-brand-blue/20",
    CLOSED: "bg-foreground/5 text-foreground/40 border-foreground/10",
  };
  const icons = {
    OPEN: <CheckCircle2 size={12} />,
    IN_PROGRESS: <Clock size={12} />,
    CLOSED: <XCircle size={12} />,
  };
  
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black  border shrink-0 ${styles[status as keyof typeof styles]}`}>
      {icons[status as keyof typeof icons]} {status.replace('_', ' ')}
    </div>
  )
}