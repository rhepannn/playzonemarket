import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Package, MessageSquare, ShoppingBag, 
  Plus, Edit2, Trash2, CheckCircle, Clock, LogOut,
  TrendingUp, Users, Star, Eye, AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';

const StatCard = ({ icon: Icon, label, value, color = 'indigo' }) => (
  <div className="glass-card p-6">
    <div className={`w-12 h-12 rounded-2xl bg-${color}-500/10 border border-${color}-500/20 flex items-center justify-center mb-4`}>
      <Icon className={`w-6 h-6 text-${color}-400`} />
    </div>
    <p className="text-3xl font-black text-white mb-1">{value}</p>
    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</p>
  </div>
);

const Dashboard = () => {
  const { user, listings, chatRooms, orders, logout, openOrCreateChatRoom, deleteListing } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [deleting, setDeleting] = useState(null);

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-indigo-400" />
        </div>
        <h2 className="text-2xl font-black text-white mb-3">Login Diperlukan</h2>
        <p className="text-slate-500 mb-6">Kamu perlu login untuk mengakses dashboard.</p>
        <button onClick={() => navigate('/auth')} className="btn-primary px-8 py-3">
          Login Sekarang
        </button>
      </div>
    );
  }

  const isSeller = user.role === 'seller';
  const myListings = listings.filter(l => l.seller_id === user.id);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Error during logout:', err);
    } finally {
      navigate('/');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus produk ini?')) return;
    setDeleting(id);
    try {
      await deleteListing(id);
    } catch (err) {
      alert('Gagal menghapus: ' + err.message);
    }
    setDeleting(null);
  };

  const handleOpenChat = async (room) => {
    navigate(`/chat/${room.id}`);
  };

  const tabs = isSeller
    ? [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'products', label: 'Produk Saya', icon: Package },
        { id: 'chats', label: 'Chat', icon: MessageSquare },
      ]
    : [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'chats', label: 'Chat', icon: MessageSquare },
        { id: 'orders', label: 'Pembelian', icon: ShoppingBag },
      ];

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-indigo-500/30 shadow-lg shadow-indigo-500/10">
            <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.username}`} alt="" className="w-full h-full" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-black text-white">{user.full_name || user.username}</h1>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                isSeller ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20' : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
              }`}>
                {isSeller ? '💰 Seller' : '🛒 Buyer'}
              </span>
            </div>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-all text-sm font-bold">
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-900 rounded-2xl border border-slate-800 mb-8 w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${
              activeTab === id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-500 hover:text-white'
            }`}>
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {isSeller ? (
              <>
                <StatCard icon={Package} label="Total Produk" value={myListings.length} />
                <StatCard icon={Eye} label="Aktif" value={myListings.filter(l => l.status === 'active').length} color="emerald" />
                <StatCard icon={MessageSquare} label="Chat Aktif" value={chatRooms.length} color="purple" />
                <StatCard icon={TrendingUp} label="Terjual" value={myListings.filter(l => l.status === 'sold').length} color="amber" />
              </>
            ) : (
              <>
                <StatCard icon={MessageSquare} label="Chat Aktif" value={chatRooms.length} color="purple" />
                <StatCard icon={ShoppingBag} label="Pembelian" value={orders?.length || 0} color="emerald" />
                <StatCard icon={Star} label="Wishlist" value={0} color="amber" />
                <StatCard icon={Users} label="Seller Dihubungi" value={chatRooms.length} />
              </>
            )}
          </div>

          {isSeller && (
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-white">Produk Terbaru</h3>
                <button onClick={() => navigate('/sell')} className="btn-primary !py-2 !px-4 text-sm flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Tambah Produk
                </button>
              </div>
              {myListings.length === 0 ? (
                <div className="text-center py-10">
                  <Package className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500 font-bold">Belum ada produk</p>
                  <button onClick={() => navigate('/sell')} className="text-indigo-400 text-sm mt-2 hover:underline">Tambah sekarang →</button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {myListings.slice(0, 3).map(l => (
                    <div key={l.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40">
                      {l.image_url && <img src={l.image_url} className="w-12 h-12 rounded-xl object-cover" alt="" />}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm truncate">{l.title}</p>
                        <p className="text-xs text-slate-500">{l.game} · {l.rank}</p>
                      </div>
                      <p className="font-black text-indigo-400 text-sm">Rp {Number(l.price).toLocaleString()}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        l.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-700 text-slate-500'
                      }`}>{l.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Products Tab (Seller only) */}
      {activeTab === 'products' && isSeller && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-white text-xl">Semua Produk ({myListings.length})</h3>
            <button onClick={() => navigate('/sell')} className="btn-primary flex items-center gap-2 !py-2.5 !px-5">
              <Plus className="w-4 h-4" /> Tambah Produk
            </button>
          </div>
          {myListings.length === 0 ? (
            <div className="glass-card p-16 text-center">
              <Package className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <p className="font-black text-white text-xl mb-2">Belum ada produk</p>
              <p className="text-slate-500 mb-6">Mulai jual akun game kamu sekarang!</p>
              <button onClick={() => navigate('/sell')} className="btn-primary px-8 py-3">Tambah Produk</button>
            </div>
          ) : (
            <div className="grid gap-4">
              {myListings.map(l => (
                <div key={l.id} className="glass-card p-5 flex items-center gap-4">
                  {l.image_url && (
                    <img src={l.image_url} className="w-16 h-16 rounded-2xl object-cover flex-shrink-0" alt="" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-black text-white">{l.title}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        l.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-700 text-slate-500'
                      }`}>{l.status}</span>
                    </div>
                    <p className="text-sm text-slate-500">{l.game} · {l.rank}</p>
                    <p className="text-xs text-slate-600 mt-1 truncate">{l.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-indigo-400 text-lg">Rp {Number(l.price).toLocaleString()}</p>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => navigate(`/sell?edit=${l.id}`)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700">
                        <Edit2 className="w-4 h-4 text-slate-400" />
                      </button>
                      <button onClick={() => handleDelete(l.id)} disabled={deleting === l.id}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-colors border border-red-500/20 disabled:opacity-50">
                        {deleting === l.id
                          ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          : <Trash2 className="w-4 h-4 text-red-400" />
                        }
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Chat Tab */}
      {activeTab === 'chats' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h3 className="font-black text-white text-xl mb-6">Chat ({chatRooms.length})</h3>
          {chatRooms.length === 0 ? (
            <div className="glass-card p-16 text-center">
              <MessageSquare className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <p className="font-black text-white text-xl mb-2">Belum ada chat</p>
              <p className="text-slate-500">Chat akan muncul di sini saat pembeli menghubungi</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {chatRooms.map(room => {
                const other = user.id === room.buyer_id ? room.seller : room.buyer;
                return (
                  <button key={room.id} onClick={() => navigate(`/chat/${room.id}`)}
                    className="glass-card p-5 flex items-center gap-4 w-full text-left hover:border-indigo-500/30 transition-all">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden border border-indigo-500/20 flex-shrink-0">
                      <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${other?.username}`} alt="" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-white">{other?.full_name || other?.username}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{room.listings?.game} · {room.listings?.title}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs text-indigo-400 font-black">Buka Chat →</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* Orders Tab (Buyer only) */}
      {activeTab === 'orders' && !isSeller && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h3 className="font-black text-white text-xl mb-6">Riwayat Pembelian</h3>
          <div className="glass-card p-10 text-center">
            <ShoppingBag className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="font-bold text-slate-500">Belum ada riwayat pembelian</p>
            <button onClick={() => navigate('/explorer')} className="text-indigo-400 text-sm mt-2 hover:underline">
              Mulai cari akun →
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
