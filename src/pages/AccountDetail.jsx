import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Zap, MessageSquare, ChevronLeft, BadgeCheck, Gamepad2, Tag, Star, User2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

const AccountDetail = () => {
  const { id } = useParams();
  const { listings, user, openOrCreateChatRoom } = useApp();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [loadingChat, setLoadingChat] = useState(false);

  useEffect(() => {
    const item = listings.find(a => a.id === id);
    setAccount(item || null);
  }, [id, listings]);

  const handleChatSeller = async () => {
    if (!user) { navigate('/auth'); return; }
    if (!account) return;
    setLoadingChat(true);
    try {
      const roomId = await openOrCreateChatRoom(account.seller_id, account.id);
      navigate(`/chat/${roomId}`);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoadingChat(false);
    }
  };

  if (!account) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-center px-6">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-black text-white mb-2">Produk Tidak Ditemukan</h2>
        <Link to="/explorer" className="text-indigo-400 hover:underline font-bold mt-2">← Kembali ke Marketplace</Link>
      </div>
    );
  }

  const seller = account.profiles;
  const isOwner = user?.id === account.seller_id;
  
  const isVerified = seller?.is_verified;
  const rating = seller?.rating;
  const reviewsCount = seller?.reviews_count || 0;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <Link to="/explorer" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-400 transition-colors font-bold text-sm mb-8 group">
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Kembali ke Marketplace
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: Image & info */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Image */}
          <div className="aspect-video rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 relative">
            {account.image_url ? (
              <img src={account.image_url} alt={account.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Gamepad2 className="w-20 h-20 text-slate-700" />
              </div>
            )}
            
            {/* Trust Badge Top Right */}
            {isVerified && (
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1.5 rounded-lg bg-emerald-500/90 backdrop-blur text-white shadow-lg text-xs font-black flex items-center gap-1.5 border border-emerald-400/50">
                  <BadgeCheck className="w-4 h-4" /> Verified
                </span>
              </div>
            )}
          </div>

          {/* Title & badges */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest shadow-sm">
                {account.game || account.category}
              </span>
            </div>
            <h1 className="text-3xl font-black text-white mb-2">{account.title}</h1>
            <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
              <Tag className="w-4 h-4" />
              <span>
                {account.rank} {account.rank_value ? `(${account.rank_value} ${account.game === 'mobile-legends' ? 'Stars' : ''})` : ''}
              </span>
            </div>
          </div>

          {/* Description / Plus */}
          {account.description && (
            <div className="glass-card p-6">
              <h3 className="text-sm font-black text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span>✅</span> Kelebihan Akun
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{account.description}</p>
            </div>
          )}

          {/* Description Minus */}
          {account.description_minus && (
            <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20">
              <h3 className="text-sm font-black text-red-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span>⚠️</span> Kekurangan / Minus Akun
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{account.description_minus}</p>
            </div>
          )}
        </div>

        {/* Right: Price + actions */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Price card */}
          <div className="glass-card p-6 border-indigo-500/20">
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-1">Harga</p>
            <p className="text-4xl font-black text-white mb-1">
              Rp <span className="text-indigo-400">{Number(account.price).toLocaleString('id-ID')}</span>
            </p>
            <p className="text-xs text-slate-600 font-bold">Harga dapat dinegosiasi melalui chat</p>
          </div>

          {/* Seller card */}
          <div className="glass-card p-5 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border border-indigo-500/20 bg-slate-800 flex-shrink-0">
                <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${seller?.username}`} alt="" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Seller</p>
                <Link to={`/seller/${seller?.id}`} className="font-black text-white text-lg hover:text-indigo-400 transition-colors">
                  {seller?.full_name || seller?.username || 'Unknown'}
                </Link>
                <div className="flex items-center gap-1 mt-0.5">
                  {isVerified ? (
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <BadgeCheck className="w-3 h-3" /> Verified Seller
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                      Seller Baru
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Rating Display */}
            {rating !== undefined && rating !== null && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span className="text-lg font-black text-white">{rating.toFixed(1)} <span className="text-sm text-slate-500 font-medium">/ 5.0</span></span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-bold">{reviewsCount} Ulasan</p>
                  <Link to={`/seller/${seller?.id}`} className="text-[10px] text-indigo-400 font-bold hover:underline">Lihat Review</Link>
                </div>
              </div>
            )}
          </div>

          {/* Security info */}
          <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/15 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black text-indigo-300 mb-0.5">Transaksi 100% Aman</p>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">Dana Anda dilindungi oleh sistem escrow kami dan hanya akan diteruskan ke penjual setelah Anda mengkonfirmasi akun diterima dan sesuai.</p>
            </div>
          </div>

          {/* Action buttons */}
          {isOwner ? (
            <Link to={`/sell?edit=${account.id}`}
              className="w-full py-4 rounded-2xl bg-slate-800 border border-slate-700 text-white font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-700 transition-all">
              ✏️ Edit Produk Ini
            </Link>
          ) : (
            <motion.button
              onClick={handleChatSeller}
              disabled={loadingChat}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-2xl shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {loadingChat
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sedang Menghubungkan...</>
                : <><MessageSquare className="w-4 h-4" /> Chat Seller & Nego</>
              }
            </motion.button>
          )}

          <div className="flex items-center gap-2 mt-2 justify-center">
            <Zap className="w-4 h-4 text-amber-400" />
            <p className="text-xs text-slate-500 font-bold">Rata-rata merespon dalam 15 menit</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDetail;
