import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, BadgeCheck, Gamepad2, Tag, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const GAMES = [
  { id: 'all', name: 'Semua Game', icon: '🎮' },
  { id: 'mobile-legends', name: 'Mobile Legends', icon: '⚔️' },
  { id: 'pubg', name: 'PUBG Mobile', icon: '🔫' },
  { id: 'valorant', name: 'Valorant', icon: '🎯' },
  { id: 'free-fire', name: 'Free Fire', icon: '🔥' },
  { id: 'genshin', name: 'Genshin Impact', icon: '⚡' },
  { id: 'cod-mobile', name: 'COD Mobile', icon: '🪖' },
  { id: 'clash-royale', name: 'Clash Royale', icon: '👑' },
  { id: 'other', name: 'Lainnya', icon: '🎮' },
];

const ProductCard = ({ account }) => {
  const seller = account.profiles;
  return (
    <Link to={`/detail/${account.id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="glass-card overflow-hidden group cursor-pointer h-full flex flex-col"
      >
        {/* Image */}
        <div className="aspect-video bg-slate-800 relative overflow-hidden">
          {account.image_url ? (
            <img src={account.image_url} alt={account.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Gamepad2 className="w-12 h-12 text-slate-700" />
            </div>
          )}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
              {account.game || account.category}
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 rounded-lg bg-emerald-500/20 backdrop-blur text-emerald-400 text-[10px] font-black flex items-center gap-1 border border-emerald-500/20">
              <BadgeCheck className="w-3 h-3" /> Verified
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="font-black text-white text-sm mb-1 line-clamp-2 group-hover:text-indigo-300 transition-colors">
            {account.title}
          </h3>
          <div className="flex items-center gap-1.5 mb-3">
            <Tag className="w-3 h-3 text-slate-600" />
            <span className="text-xs text-slate-500 font-bold">
              {account.rank} {account.rank_value ? `(${account.rank_value} ${account.game === 'mobile-legends' ? 'Stars' : ''})` : ''}
            </span>
          </div>
          <p className="text-xs text-slate-600 line-clamp-2 flex-1 mb-4">{account.description}</p>
          <div className="flex items-center justify-between mt-auto">
            <div>
              <p className="text-xs text-slate-600 font-bold">Harga</p>
              <p className="text-lg font-black text-indigo-400">
                Rp {Number(account.price).toLocaleString('id-ID')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg overflow-hidden border border-slate-700 bg-slate-800">
                <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${seller?.username}`} alt="" />
              </div>
              <div>
                <p className="text-[10px] text-slate-600 font-bold">Seller</p>
                <p className="text-xs text-slate-400 font-bold">{seller?.full_name || seller?.username || 'Unknown'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 pb-5">
          <div className="w-full py-2.5 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-xs font-black text-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
            Lihat Detail →
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

const Explorer = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const { listings } = useApp();

  const filtered = useMemo(() => {
    return listings
      .filter(acc => {
        const q = searchQuery.toLowerCase();
        const matchSearch = !q ||
          acc.title?.toLowerCase().includes(q) ||
          (acc.game || acc.category || '').toLowerCase().includes(q) ||
          acc.rank?.toLowerCase().includes(q);
        const matchGame = selectedGame === 'all' || (acc.game || acc.category) === selectedGame;
        return matchSearch && matchGame;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return Number(a.price) - Number(b.price);
        if (sortBy === 'price-high') return Number(b.price) - Number(a.price);
        return new Date(b.created_at) - new Date(a.created_at);
      });
  }, [listings, searchQuery, selectedGame, sortBy]);

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="mb-10">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-black uppercase tracking-widest mb-4">
          <Store className="w-3 h-3" /> Marketplace
        </span>
        <h1 className="text-4xl font-black text-white mb-2">Jelajahi Akun Game</h1>
        <p className="text-slate-500">{listings.length} akun tersedia dari seller terverifikasi</p>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari game, rank, atau judul..."
            className="w-full bg-slate-800/60 border border-slate-700 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition-colors"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-slate-500 hover:text-white" />
            </button>
          )}
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-slate-800/60 border border-slate-700 rounded-2xl px-4 py-3.5 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
        >
          <option value="latest">Terbaru</option>
          <option value="price-low">Harga Terendah</option>
          <option value="price-high">Harga Tertinggi</option>
        </select>
      </div>

      {/* Game filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-8">
        {GAMES.map(g => (
          <button
            key={g.id}
            onClick={() => setSelectedGame(g.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black whitespace-nowrap transition-all flex-shrink-0 ${
              selectedGame === g.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
            }`}
          >
            <span>{g.icon}</span> {g.name}
          </button>
        ))}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 flex flex-col items-center">
          <div className="w-20 h-20 rounded-3xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-6">
            <Search className="w-10 h-10 text-slate-600" />
          </div>
          <h3 className="text-xl font-black text-white mb-2">Tidak Ada Hasil</h3>
          <p className="text-slate-500 mb-6">Coba kata kunci atau filter yang berbeda</p>
          <button onClick={() => { setSearchQuery(''); setSelectedGame('all'); }}
            className="text-indigo-400 font-bold hover:underline">
            Reset Filter
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-600 font-bold mb-5">{filtered.length} hasil ditemukan</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <AnimatePresence>
              {filtered.map((acc, i) => (
                <motion.div
                  key={acc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  <ProductCard account={acc} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
};

export default Explorer;
