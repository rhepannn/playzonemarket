import React from 'react';
import { useApp } from '../../context/AppContext';
import { MOCK_ACCOUNTS } from '../../data/mockData';
import { MessageSquare, User } from 'lucide-react';

const ChatList = ({ activeChatId, onSelectChat }) => {
  const { chatRooms, user, customListings } = useApp();

  const allProducts = [...MOCK_ACCOUNTS, ...customListings];

  const getPartnerName = (room) => {
    return room.buyerId === user?.email ? room.sellerId : room.buyerId;
  };

  const getProduct = (productId) => {
    return allProducts.find(p => p.id === productId);
  };

  if (chatRooms.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <MessageSquare className="w-12 h-12 text-slate-800 mb-4" />
        <p className="text-slate-500 font-medium text-sm">Belum ada percakapan.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
      {chatRooms.map((room) => {
        const partnerName = getPartnerName(room);
        const product = getProduct(room.productId);
        const isActive = activeChatId === room.id;

        return (
          <button
            key={room.id}
            onClick={() => onSelectChat(room.id)}
            className={`p-5 flex items-center gap-4 transition-all border-b border-white/5 ${isActive ? 'bg-indigo-600/10 border-r-4 border-r-indigo-500' : 'hover:bg-slate-900/50'}`}
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center relative shrink-0">
               <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${partnerName}`} alt="avatar" className="w-8 h-8" />
               {product && (
                 <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-indigo-500 border-2 border-slate-950 flex items-center justify-center text-[8px]">
                    {product.icon || '📦'}
                 </div>
               )}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white font-bold text-sm truncate">{partnerName.split('@')[0]}</span>
                <span className="text-[10px] text-slate-600 font-medium whitespace-nowrap">
                  {new Date(room.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate font-medium">
                {room.lastMessage || 'Menanyakan tentang ' + (product?.title || 'Produk')}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ChatList;
