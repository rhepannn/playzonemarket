import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, MessageSquare, Gamepad2, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';

const formatTime = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (ts) => {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

const Chat = () => {
  const { id: roomIdParam } = useParams();
  const navigate = useNavigate();
  const { user, chatRooms, fetchChatRooms } = useApp();

  const [activeRoomId, setActiveRoomId] = useState(roomIdParam || null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const bottomRef = useRef(null);
  const subscriptionRef = useRef(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) navigate('/auth');
  }, [user, navigate]);

  // Set active room from URL param
  useEffect(() => {
    if (roomIdParam) setActiveRoomId(roomIdParam);
  }, [roomIdParam]);

  // Fetch messages when active room changes
  useEffect(() => {
    if (!activeRoomId) return;
    setLoadingMessages(true);

    supabase
      .from('messages')
      .select('*, profiles(full_name, username)')
      .eq('room_id', activeRoomId)
      .order('timestamp', { ascending: true })
      .then(({ data }) => {
        setMessages(data || []);
        setLoadingMessages(false);
      });

    // Cleanup previous subscription
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    // Subscribe to realtime messages
    const channel = supabase
      .channel(`room-${activeRoomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `room_id=eq.${activeRoomId}`
      }, async (payload) => {
        // Fetch sender profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, username')
          .eq('id', payload.new.sender_id)
          .single();

        setMessages(prev => [...prev, { ...payload.new, profiles: profile }]);
      })
      .subscribe();

    subscriptionRef.current = channel;
    return () => channel.unsubscribe();
  }, [activeRoomId]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Refresh chat rooms
  useEffect(() => {
    if (user) fetchChatRooms(user.id);
  }, [user, fetchChatRooms]);

  const sendMessage = async () => {
    if (!text.trim() || !activeRoomId || !user) return;
    const msgText = text.trim();
    setText('');

    const { error } = await supabase.from('messages').insert([{
      room_id: activeRoomId,
      sender_id: user.id,
      text: msgText
    }]);

    if (error) {
      console.error('Send error:', error);
      setText(msgText); // restore
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const activeRoom = chatRooms.find(r => r.id === activeRoomId);
  const getOtherUser = (room) => {
    if (!room || !user) return null;
    return user.id === room.buyer_id ? room.seller : room.buyer;
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-5rem)] flex rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/50">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 border-r border-slate-800 flex flex-col bg-slate-950/60">
        <div className="p-5 border-b border-slate-800">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            Pesan
          </h2>
          <p className="text-xs text-slate-500 mt-1">{chatRooms.length} percakapan</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chatRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <MessageSquare className="w-10 h-10 text-slate-700 mb-3" />
              <p className="text-sm font-bold text-slate-600">Belum ada percakapan</p>
              <p className="text-xs text-slate-700 mt-1">Klik "Chat Seller" di halaman produk</p>
            </div>
          ) : (
            chatRooms.map((room) => {
              const other = getOtherUser(room);
              const isActive = room.id === activeRoomId;
              return (
                <button
                  key={room.id}
                  onClick={() => { setActiveRoomId(room.id); navigate(`/chat/${room.id}`); }}
                  className={`w-full p-4 text-left flex items-center gap-3 transition-all hover:bg-slate-800/50 border-b border-slate-800/50 ${isActive ? 'bg-indigo-500/10 border-l-2 border-l-indigo-500' : ''}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600/30 to-purple-600/30 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${other?.username}`} alt="" className="w-full h-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${isActive ? 'text-indigo-300' : 'text-white'}`}>
                      {other?.full_name || other?.username || 'User'}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Gamepad2 className="w-3 h-3 text-slate-600 flex-shrink-0" />
                      <p className="text-xs text-slate-600 truncate">{room.listings?.title || 'Produk'}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-700'}`} />
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main chat */}
      <div className="flex-1 flex flex-col">
        {!activeRoomId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
            <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
              <MessageSquare className="w-10 h-10 text-indigo-500/50" />
            </div>
            <h3 className="text-xl font-black text-white mb-2">Pilih Percakapan</h3>
            <p className="text-slate-500 text-sm max-w-xs">Pilih chat dari sidebar atau mulai chat baru dari halaman produk</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="p-5 border-b border-slate-800 flex items-center gap-4 bg-slate-950/40">
              <button onClick={() => navigate('/chat')}
                className="p-2 rounded-xl hover:bg-slate-800 transition-colors lg:hidden">
                <ArrowLeft className="w-5 h-5 text-slate-400" />
              </button>
              {activeRoom && (
                <>
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-indigo-500/10 border border-indigo-500/20">
                    <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${getOtherUser(activeRoom)?.username}`} alt="" />
                  </div>
                  <div>
                    <p className="font-black text-white text-sm">
                      {getOtherUser(activeRoom)?.full_name || getOtherUser(activeRoom)?.username}
                    </p>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <p className="text-xs text-slate-500">Online · {activeRoom.listings?.game || activeRoom.listings?.title}</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-slate-600 font-bold text-sm">Belum ada pesan</p>
                  <p className="text-slate-700 text-xs mt-1">Mulai percakapan!</p>
                </div>
              ) : (
                <>
                  {messages.map((msg, i) => {
                    const isMine = msg.sender_id === user.id;
                    const showDate = i === 0 || formatDate(messages[i - 1]?.timestamp) !== formatDate(msg.timestamp);
                    return (
                      <React.Fragment key={msg.id}>
                        {showDate && (
                          <div className="flex items-center gap-3 my-2">
                            <div className="flex-1 h-[1px] bg-slate-800" />
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{formatDate(msg.timestamp)}</span>
                            <div className="flex-1 h-[1px] bg-slate-800" />
                          </div>
                        )}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                            {!isMine && (
                              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-1">
                                {msg.profiles?.full_name || msg.profiles?.username}
                              </span>
                            )}
                            <div className={`px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed ${
                              isMine
                                ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-sm shadow-lg shadow-indigo-500/20'
                                : 'bg-slate-800 text-slate-200 rounded-bl-sm border border-slate-700/50'
                            }`}>
                              {msg.text}
                            </div>
                            <span className="text-[10px] text-slate-700 px-1">{formatTime(msg.timestamp)}</span>
                          </div>
                        </motion.div>
                      </React.Fragment>
                    );
                  })}
                  <div ref={bottomRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/40">
              <div className="flex items-center gap-3 bg-slate-800/60 border border-slate-700/60 rounded-2xl px-4 py-1 focus-within:border-indigo-500/50 focus-within:bg-indigo-500/5 transition-all">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ketik pesan..."
                  rows={1}
                  className="flex-1 bg-transparent py-3 text-sm text-white placeholder-slate-600 outline-none resize-none font-medium"
                />
                <button
                  onClick={sendMessage}
                  disabled={!text.trim()}
                  className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all flex-shrink-0"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
              <p className="text-[10px] text-slate-700 mt-2 text-center">Enter untuk kirim · Shift+Enter untuk baris baru</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;
