import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const MessageItem = ({ msg, isMe }) => {
  const isSystem = msg.senderId === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-4 w-full">
        <div className="px-4 py-1 rounded-full bg-slate-900/80 border border-slate-800/50 text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
           <ShieldCheck className="w-3 h-3 text-indigo-500" /> {msg.text}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex flex-col w-full ${isMe ? 'items-end' : 'items-start'}`}
    >
      <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium shadow-2xl ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-900 text-slate-200 border border-slate-800/50 rounded-tl-none'}`}>
        {msg.text}
      </div>
      <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-1.5 px-1">
        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </motion.div>
  );
};

export default MessageItem;
