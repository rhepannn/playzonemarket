import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MOCK_ACCOUNTS } from '../../data/mockData';
import { Info } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import MessageItem from './MessageItem';
import InputChat from './InputChat';

const ChatRoom = ({ roomId }) => {
  const { messages, sendMessage, user, chatRooms, customListings } = useApp();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const room = chatRooms.find(r => r.id === roomId);
  const roomMessages = messages.filter(m => m.roomId === roomId);
  const allProducts = [...MOCK_ACCOUNTS, ...customListings];
  const product = allProducts.find(p => p.id === room?.productId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [roomMessages]);

  if (!room) return (
    <div className="h-full flex items-center justify-center p-12 text-slate-700 italic font-medium">
      Silakan pilih percakapan untuk memulai.
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-950/20 backdrop-blur-sm rounded-r-3xl overflow-hidden relative">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-900/40 backdrop-blur-md">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold overflow-hidden">
              <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${room.sellerId}`} alt="avatar" />
           </div>
           <div>
              <h3 className="text-white font-bold text-sm">{room.sellerId.split('@')[0]}</h3>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
              </p>
           </div>
        </div>
        <div className="flex items-center gap-2">
           <button className="p-2 rounded-xl hover:bg-slate-800 text-slate-500 transition-all"><Info className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Product Reference */}
      {product && (
        <div className="px-6 py-3 bg-indigo-600/5 border-b border-white/5 flex items-center justify-between group cursor-pointer hover:bg-indigo-600/10 transition-all">
           <div className="flex items-center gap-3">
              <div className="w-10 h-8 rounded-lg bg-slate-950 overflow-hidden border border-slate-800">
                 <img src={product.image} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                 <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest leading-none mb-1">Menanyakan:</p>
                 <p className="text-xs font-bold text-white leading-none truncate max-w-[200px]">{product.title}</p>
              </div>
           </div>
           <div className="text-right">
              <p className="text-xs font-black text-white">Rp {Number(product.price).toLocaleString('id-ID')}</p>
           </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 custom-scrollbar bg-mesh bg-fixed">
        <AnimatePresence mode="popLayout">
          {roomMessages.map((msg) => (
             <MessageItem key={msg.id} msg={msg} isMe={msg.senderId === user?.email} />
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <InputChat onSendMessage={(text) => sendMessage(roomId, text)} />
    </div>
  );
};

export default ChatRoom;
