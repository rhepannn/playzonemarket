import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, MessageSquare, Gamepad2, ChevronRight, Info } from 'lucide-react';
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

// -- Subcomponents --

const ChatList = ({ chatRooms, activeRoomId, setActiveRoomId, getOtherUser, navigate }) => {
  return (
    <div className={`w-full lg:w-80 flex-shrink-0 border-r border-slate-800 flex flex-col bg-slate-950/60 h-full ${activeRoomId ? 'hidden lg:flex' : 'flex'}`}>
      <div className="p-5 border-b border-slate-800">
        <h2 className="text-lg font-black text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-400" />
          Kotak Masuk
        </h2>
        <p className="text-xs text-slate-500 mt-1 font-medium">{chatRooms.length} percakapan aktif</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {chatRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <MessageSquare className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-500">Belum ada chat</p>
            <p className="text-xs text-slate-600 mt-1">Mulai cari akun di marketplace</p>
          </div>
        ) : (
          chatRooms.map((room) => {
            const other = getOtherUser(room);
            const isActive = room.id === activeRoomId;
            return (
              <button
                key={room.id}
                onClick={() => { setActiveRoomId(room.id); navigate(`/chat/${room.id}`); }}
                className={`w-full p-4 text-left flex items-center gap-4 transition-all hover:bg-slate-800/40 border-b border-slate-800/40 outline-none ${isActive ? 'bg-indigo-500/5 border-l-2 border-l-indigo-500' : 'border-l-2 border-l-transparent'}`}
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                  <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${other?.username}`} alt="" className="w-full h-full object-cover" />
                  {isActive && <div className="absolute inset-0 bg-indigo-500/10"></div>}
                </div>
                <div className="flex-1 min-w-0 py-0.5">
                  <div className="flex items-center justify-between mb-1">
                    <p className={`text-sm font-bold truncate ${isActive ? 'text-indigo-300' : 'text-slate-200'}`}>
                      {other?.full_name || other?.username || 'User'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Gamepad2 className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <p className="text-[11px] text-slate-500 truncate font-medium">{room.listings?.title || 'Produk'}</p>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-700'} hidden lg:block`} />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

const ChatRoom = ({ activeRoomId, activeRoom, getOtherUser, messages, loadingMessages, user, text, setText, sendMessage, bottomRef, handleKeyDown, navigate, setActiveRoomId }) => {
  if (!activeRoomId) {
    return (
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center text-center p-10 bg-slate-900/50">
        <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 shadow-inner">
          <MessageSquare className="w-10 h-10 text-indigo-500/50" />
        </div>
        <h3 className="text-xl font-black text-white mb-2">Pilih Percakapan</h3>
        <p className="text-slate-500 text-sm max-w-xs leading-relaxed">Pilih chat dari sidebar atau mulai chat baru dari halaman produk</p>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col h-full bg-slate-900/50 ${activeRoomId ? 'flex' : 'hidden lg:flex'}`}>
      {/* Chat header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
        <div className="flex items-center gap-3 sm:gap-4">
          <button onClick={() => { setActiveRoomId(null); navigate('/chat'); }} className="p-2 -ml-2 rounded-xl hover:bg-slate-800 transition-colors lg:hidden text-slate-400">
            <ArrowLeft className="w-5 h-5 border-l border-b transform rotate-45 ml-1" style={{borderLeftWidth: '0px', borderBottomWidth: '0px'}} />
             <ArrowLeft className="w-5 h-5" />
          </button>
          {activeRoom && (
            <>
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 flex-shrink-0 shadow-sm relative">
                <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${getOtherUser(activeRoom)?.username}`} alt="" className="w-full h-full object-cover relative z-10" />
              </div>
              <div className="min-w-0">
                <p className="font-black text-white text-sm sm:text-base truncate">
                  {getOtherUser(activeRoom)?.full_name || getOtherUser(activeRoom)?.username}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                  <p className="text-[10px] sm:text-xs text-emerald-400 font-bold uppercase tracking-widest">Online</p>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="flex gap-2">
          {activeRoom?.listings && (
            <Link to={`/account/${activeRoom.listings.id}`} className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition-colors text-xs font-bold shadow-sm">
              Lihat Produk
            </Link>
          )}
        </div>
      </div>
      
      {/* Product Banner Info */}
      {activeRoom?.listings && (
        <div className="px-4 py-2 bg-indigo-500/5 border-b border-indigo-500/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="w-2 h-2 rounded-sm bg-indigo-500 flex-shrink-0 mt-0.5"></span>
            <span className="font-bold text-slate-400 flex-shrink-0">Transaksi:</span>
            <span className="text-white font-medium truncate">{activeRoom.listings.title}</span>
          </div>
          <span className="font-black text-indigo-400 flex-shrink-0 ml-4 hidden sm:block">
            Rp {Number(activeRoom.listings.price).toLocaleString('id-ID')}
          </span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4 custom-scrollbar">
        {loadingMessages ? (
          <div className="flex items-center justify-center h-full pb-10">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center pb-10">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
               <MessageSquare className="w-8 h-8 text-slate-500" />
            </div>
            <p className="text-slate-300 font-bold text-sm mb-1">Mulai Percakapan Baru</p>
            <p className="text-slate-500 text-xs max-w-xs leading-relaxed">Hindari bertransaksi di luar platform untuk meminimalisasi risiko penipuan.</p>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => {
              const isMine = msg.sender_id === user.id;
              const showDate = i === 0 || formatDate(messages[i - 1]?.timestamp) !== formatDate(msg.timestamp);
              return (
                <React.Fragment key={msg.id}>
                  {showDate && (
                    <div className="flex items-center gap-4 my-4">
                      <div className="flex-1 h-[1px] bg-slate-800/60" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-900/50 px-3 py-1 rounded-full border border-slate-800/80">{formatDate(msg.timestamp)}</span>
                      <div className="flex-1 h-[1px] bg-slate-800/60" />
                    </div>
                  )}
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] sm:max-w-[70%] ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      <div className={`px-4 py-2.5 text-[13px] sm:text-sm font-medium leading-relaxed shadow-sm ${
                        isMine
                          ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl rounded-tr-sm shadow-indigo-600/20'
                          : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-2xl rounded-tl-sm shadow-black/10'
                      }`}>
                        {msg.text}
                      </div>
                      <div className={`flex items-center gap-1.5 px-1 mt-0.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-[9px] font-bold text-slate-600">{formatTime(msg.timestamp)}</span>
                      </div>
                    </div>
                  </motion.div>
                </React.Fragment>
              );
            })}
            <div ref={bottomRef} className="h-2" />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/60 backdrop-blur-md">
        <div className="flex items-end gap-2 bg-slate-900 border border-slate-700/60 rounded-2xl p-1.5 sm:p-2 focus-within:border-indigo-500/50 shadow-inner overflow-hidden">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tulis pesan..."
            rows={1}
            style={{ minHeight: '44px', maxHeight: '120px' }}
            className="flex-1 bg-transparent py-3 px-3 text-sm text-white placeholder-slate-500 outline-none resize-none font-medium custom-scrollbar"
          />
          <button
            onClick={sendMessage}
            disabled={!text.trim()}
            className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all flex-shrink-0 mb-0.5 mr-0.5 shadow-md"
          >
            <Send className="w-4 h-4 text-white ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// -- Main Component --

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
    <div className="max-w-6xl mx-auto h-[calc(100vh-6rem)] sm:h-[calc(100vh-8rem)] flex rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/50 shadow-2xl relative">
      <ChatList 
        chatRooms={chatRooms} 
        activeRoomId={activeRoomId} 
        setActiveRoomId={setActiveRoomId} 
        getOtherUser={getOtherUser} 
        navigate={navigate} 
      />
      <ChatRoom 
        activeRoomId={activeRoomId} 
        activeRoom={activeRoom}
        getOtherUser={getOtherUser}
        messages={messages}
        loadingMessages={loadingMessages}
        user={user}
        text={text}
        setText={setText}
        sendMessage={sendMessage}
        bottomRef={bottomRef}
        handleKeyDown={handleKeyDown}
        navigate={navigate}
        setActiveRoomId={setActiveRoomId}
      />
    </div>
  );
};

export default Chat;
