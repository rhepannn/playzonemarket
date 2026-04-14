import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Package, MessageSquare, ShoppingBag, 
  Plus, Edit2, Trash2, CheckCircle, Clock, LogOut,
  TrendingUp, Users, Star, Eye, AlertCircle, Gamepad2, Ghost
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';

// --- Subcomponents ---

const StatCard = ({ icon: Icon, label, value, color = 'indigo' }) => (
  <div className="glass-card p-6 border-slate-700/50 hover:border-slate-600 transition-colors">
    <div className={`w-12 h-12 rounded-2xl bg-${color}-500/10 border border-${color}-500/20 flex items-center justify-center mb-4`}>
      <Icon className={`w-6 h-6 text-${color}-400`} />
    </div>
    <p className="text-3xl font-black text-white mb-1">{value}</p>
    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</p>
  </div>
);

const EmptyState = ({ icon: Icon, title, description, actionText, actionLink, onClick }) => (
  <div className="glass-card p-16 text-center border-dashed border-slate-700 bg-slate-900/30">
    <div className="w-20 h-20 rounded-3xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto mb-6 shadow-inner">
      <Icon className="w-10 h-10 text-slate-500" />
    </div>
    <p className="font-black text-white text-2xl mb-2">{title}</p>
    <p className="text-slate-500 mb-8 max-w-sm mx-auto">{description}</p>
    {(actionText || onClick) && (
      <button onClick={onClick} className="btn-primary px-8 py-3.5 flex items-center gap-2 mx-auto shadow-indigo-500/25">
        <Plus className="w-4 h-4" /> {actionText}
      </button>
    )}
    {actionLink && !onClick && (
      <Link to={actionLink} className="text-indigo-400 text-sm mt-2 hover:underline font-bold inline-flex items-center gap-1">
        {actionText} <TrendingUp className="w-4 h-4" />
      </Link>
    )}
  </div>
);

const OverviewTab = ({ isSeller, myListings, chatRooms, orders, navigate }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isSeller ? (
          <>
            <StatCard icon={Package} label="Total Produk" value={myListings.length} />
            <StatCard icon={Eye} label="Aktif" value={myListings.filter(l => l.status !== 'sold').length} color="emerald" />
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
        <div className="glass-card p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-black text-white text-xl">Produk Terbaru</h3>
              <p className="text-xs font-medium text-slate-500 mt-1">Listing terakhir yang kamu posting</p>
            </div>
            <button onClick={() => navigate('/sell')} className="btn-primary !py-2.5 !px-5 text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> Tambah 
            </button>
          </div>
          
          {myListings.length === 0 ? (
            <EmptyState 
              icon={Ghost}
              title="Belum Ada Produk"
              description="Dashboard mu masih kosong. Mulai hasilkan uang dengan menjual akun game pertamamu!"
              actionText="Jual Akun Sekarang"
              onClick={() => navigate('/sell')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myListings.slice(0, 3).map(l => (
                <div key={l.id} className="group relative p-4 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900 border border-slate-700/50 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all overflow-hidden flex flex-col justify-between">
                  <div className="flex items-start gap-4 mb-3">
                    {l.image_url ? (
                      <img src={l.image_url} className="w-14 h-14 rounded-xl object-cover border border-slate-700" alt="" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                        <Gamepad2 className="w-6 h-6 text-slate-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm truncate pr-2" title={l.title}>{l.title}</p>
                      <p className="text-[11px] font-medium text-slate-400 mt-0.5">{l.game} · {l.rank}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-end justify-between mt-auto">
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Harga</p>
                      <p className="font-black text-indigo-400 text-sm">Rp {Number(l.price).toLocaleString('id-ID')}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      l.status !== 'sold' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                    }`}>
                      {l.status || 'Active'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

const ProductsTab = ({ myListings, navigate, handleDelete, deleting }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h3 className="font-black text-white text-2xl">Semua Produk</h3>
          <p className="text-sm font-medium text-slate-500 mt-1">Mengelola {myListings.length} total listing aktifmu</p>
        </div>
        <button onClick={() => navigate('/sell')} className="btn-primary flex items-center gap-2 !py-2.5 !px-6 shadow-lg shadow-indigo-500/20">
          <Plus className="w-4 h-4" /> Listing Baru
        </button>
      </div>

      {myListings.length === 0 ? (
        <EmptyState 
          icon={Package}
          title="Gudang Kosong"
          description="Kamu belum menambahkan produk apapun. Yuk buat listing pertamamu agar dilirik pembeli!"
          actionText="Buat Listing Baru"
          onClick={() => navigate('/sell')}
        />
      ) : (
        <div className="grid gap-4">
          {myListings.map(l => (
            <div key={l.id} className="glass-card p-5 flex flex-col md:flex-row md:items-center gap-5 hover:border-slate-600 transition-colors">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {l.image_url ? (
                  <img src={l.image_url} className="w-20 h-20 rounded-2xl object-cover flex-shrink-0 border border-slate-700 shadow-sm" alt="" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
                    <Gamepad2 className="w-8 h-8 text-slate-600" />
                  </div>
                )}
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <p className="font-black text-white text-lg truncate" title={l.title}>{l.title}</p>
                    <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      l.status !== 'sold' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-700 text-slate-500'
                    }`}>{l.status || 'Active'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400 font-medium mb-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] font-bold">{l.game}</span>
                    <span>•</span>
                    <span className="truncate">{l.rank}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{l.description}</p>
                </div>
              </div>

              <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 md:w-48">
                <p className="font-black text-indigo-400 text-xl hidden md:block">Rp {Number(l.price).toLocaleString('id-ID')}</p>
                
                {/* Mobile price */}
                <p className="font-black text-white text-base md:hidden">Rp {Number(l.price).toLocaleString('id-ID')}</p>
                
                <div className="flex gap-2 md:mt-3">
                  <button onClick={() => navigate(`/sell?edit=${l.id}`)} title="Edit Listing"
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-indigo-500 hover:text-white transition-all border border-slate-700 hover:border-indigo-500 text-slate-400">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(l.id)} disabled={deleting === l.id} title="Hapus Listing"
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-red-500 hover:text-white transition-all border border-slate-700 hover:border-red-500 text-slate-400 disabled:opacity-50">
                    {deleting === l.id
                      ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      : <Trash2 className="w-4 h-4" />
                    }
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

const ChatsTab = ({ chatRooms, user, navigate }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <div className="mb-6">
        <h3 className="font-black text-white text-2xl">Kotak Masuk Chat</h3>
        <p className="text-sm font-medium text-slate-500 mt-1">Kelola {chatRooms.length} percakapan aktifmu</p>
      </div>

      {chatRooms.length === 0 ? (
        <EmptyState 
          icon={MessageSquare}
          title="Tidak Ada Pesan"
          description="Aktivitas chat kamu akan muncul di sini ketika ada pembeli yang bertanya atau kamu menghubungi seller."
          actionText="Eksplor Marketplace"
          actionLink="/explorer"
        />
      ) : (
        <div className="grid gap-3">
          {chatRooms.map(room => {
            const isBuyerMe = user.id === room.buyer_id;
            const other = isBuyerMe ? room.seller : room.buyer;
            
            return (
              <button key={room.id} onClick={() => navigate(`/chat/${room.id}`)}
                className="glass-card p-5 outline-none focus:border-indigo-500 border border-slate-800/80 w-full text-left hover:border-indigo-500/50 hover:bg-slate-800/30 transition-all flex items-center gap-4 group">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-700 flex-shrink-0 bg-slate-900 group-hover:border-indigo-500/50 transition-colors">
                    <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${other?.username}`} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-md flex items-center justify-center border-2 border-[rgb(11,15,25)] ${isBuyerMe ? 'bg-emerald-500 text-white' : 'bg-purple-500 text-white'}`}>
                    {isBuyerMe ? <ShoppingBag className="w-2.5 h-2.5" /> : <Package className="w-2.5 h-2.5" />}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-black text-white text-lg">{other?.full_name || other?.username || 'User'}</p>
                    <span className="text-xs font-bold text-slate-500">Buka Chat</span>
                  </div>
                  
                  {room.listings ? (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded border border-slate-700 bg-slate-800/80 text-[10px] font-black text-slate-300 truncate max-w-[120px]">
                        {room.listings.game}
                      </span>
                      <p className="text-xs text-slate-400 truncate">Menanyakan: {room.listings.title}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">Produk dihapus/tidak ditemukan</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

const OrdersTab = ({ orders, navigate }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <div className="mb-6">
        <h3 className="font-black text-white text-2xl">Riwayat Transaksi</h3>
        <p className="text-sm font-medium text-slate-500 mt-1">Daftar produk yang telah kamu beli</p>
      </div>

      {(!orders || orders.length === 0) ? (
        <EmptyState 
          icon={ShoppingBag}
          title="Belum Jajan Apapun"
          description="Kamu belum melakukan pembelian apapun. Jelajahi marketplace dan temukan akun idamanmu!"
          actionText="Cari Akun Idaman"
          actionLink="/explorer"
        />
      ) : (
        <div className="glass-card p-6 border-dashed border-slate-700 text-center">
          <Clock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-bold">Fitur riwayat pembelian lengkap segera hadir.</p>
        </div>
      )}
    </motion.div>
  );
};

// --- Main Container ---

const Dashboard = () => {
  const { user, listings, chatRooms, orders, logout, deleteListing } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [deleting, setDeleting] = useState(null);

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-6 shadow-inner">
          <AlertCircle className="w-10 h-10 text-indigo-400" />
        </div>
        <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Akses Ditolak</h2>
        <p className="text-slate-400 mb-8 max-w-sm mx-auto leading-relaxed">Sesi login kamu mungkin telah berakhir atau kamu belum masuk. Silakan login untuk mengakses dashboard ini.</p>
        <button onClick={() => navigate('/auth')} className="btn-primary w-full py-4 text-base shadow-indigo-500/25">
          Kembali ke Login
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
    if (!window.confirm('Yakin ingin menghapus listing produk ini? Tindakan ini tidak dapat dibatalkan.')) return;
    setDeleting(id);
    try {
      await deleteListing(id);
    } catch (err) {
      alert('Gagal menghapus: ' + err.message);
    }
    setDeleting(null);
  };

  const tabs = isSeller
    ? [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'products', label: 'Produk Saya', icon: Package },
        { id: 'chats', label: 'Kotak Masuk', icon: MessageSquare },
      ]
    : [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'chats', label: 'Chat', icon: MessageSquare },
        { id: 'orders', label: 'Pembelian', icon: ShoppingBag },
      ];

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Profiler Header Layer */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 mb-10 pb-8 mt-4 shadow-xl">
        {/* Abstract Background for Header */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-slate-900 
                        border-b border-white/5 bg-[length:10px_10px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))]">
        </div>
        
        <div className="relative pt-12 px-6 sm:px-10 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-left">
            <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-[rgb(11,15,25)] shadow-2xl bg-slate-800 z-10 relative">
              <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.username}`} alt="" className="w-full h-full object-cover" />
              {isSeller && (
                <div className="absolute top-0 right-0 w-6 h-6 bg-emerald-500 rounded-bl-xl z-20 flex items-center justify-center shadow-sm">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div className="pb-1">
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-1.5">
                <h1 className="text-3xl font-black text-white tracking-tight">{user.full_name || user.username}</h1>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm ${
                  isSeller ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' : 'bg-slate-800 text-indigo-400 border border-indigo-500/20'
                }`}>
                  {isSeller ? '💎 Seller Terverifikasi' : '🛒 Akun Buyer'}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-400 flex items-center justify-center sm:justify-start gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                {user.email}
              </p>
            </div>
          </div>
          
          <button onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-red-500/10 border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-all text-sm font-bold shadow-sm pb-1 mb-1">
            <LogOut className="w-4 h-4" />
            Keluar Akun
          </button>
        </div>
      </div>

      {/* Modern Tabs Navigation */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 p-1.5 bg-slate-900/60 rounded-2xl border border-slate-800 mb-8 max-w-fit mx-auto sm:mx-0 backdrop-blur-md">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-extrabold transition-all min-w-max relative overflow-hidden ${
              activeTab === id
                ? 'text-white'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
            }`}>
            {activeTab === id && (
              <motion.div layoutId="activeTabIndicator" className="absolute inset-0 bg-indigo-600 shadow-lg shadow-indigo-600/20 rounded-xl" />
            )}
            <Icon className="w-4 h-4 relative z-10" />
            <span className="relative z-10">{label}</span>
            {id === 'chats' && chatRooms.length > 0 && (
              <span className={`relative z-10 px-1.5 py-0.5 rounded-md text-[10px] ml-1 ${activeTab === id ? 'bg-white/20' : 'bg-indigo-500/20 text-indigo-400'}`}>
                {chatRooms.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content Area */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <OverviewTab key="tab-overview" isSeller={isSeller} myListings={myListings} chatRooms={chatRooms} orders={orders} navigate={navigate} />
          )}
          
          {activeTab === 'products' && isSeller && (
            <ProductsTab key="tab-products" myListings={myListings} navigate={navigate} handleDelete={handleDelete} deleting={deleting} />
          )}
          
          {activeTab === 'chats' && (
            <ChatsTab key="tab-chats" chatRooms={chatRooms} user={user} navigate={navigate} />
          )}

          {activeTab === 'orders' && !isSeller && (
            <OrdersTab key="tab-orders" orders={orders} navigate={navigate} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;
