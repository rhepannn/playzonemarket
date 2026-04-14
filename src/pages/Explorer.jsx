import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Store, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';

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

const Explorer = () => {
  const { searchListings, listings, fetchListings } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  
  const [localListings, setLocalListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Debounce ref
  const debounceRef = useRef(null);

  // Fetch initial data or when search triggers
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const data = await searchListings({
        query: searchQuery,
        game: selectedGame,
        sortBy,
        minPrice,
        maxPrice
      });
      setLocalListings(data || []);
      setLoading(false);
    };

    // Debounce the fetch if searching by text
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetch();
    }, 500); // 500ms debounce

    return () => clearTimeout(debounceRef.current);
  }, [searchQuery, selectedGame, sortBy, minPrice, maxPrice, searchListings]);

  // Initial load fallback just in case context isn't ready
  useEffect(() => {
    if (listings.length > 0 && localListings.length === 0 && !searchQuery && selectedGame === 'all') {
      setLocalListings(listings);
      setLoading(false);
    }
  }, [listings]);

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="mb-10">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-black uppercase tracking-widest mb-4">
          <Store className="w-3 h-3" /> Marketplace
        </span>
        <h1 className="text-4xl font-black text-white mb-2">Jelajahi Akun Game</h1>
        <p className="text-slate-500">Temukan ribuan akun game dari penjual terpercaya</p>
      </div>

      {/* Search & Top Filters */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari hero, title, atau rank..."
              className="w-full bg-slate-800/60 border border-slate-700 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition-colors"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-700 rounded-full">
                <X className="w-4 h-4 text-slate-400 hover:text-white" />
              </button>
            )}
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex-shrink-0 flex items-center gap-2 px-5 py-3.5 rounded-2xl border text-sm font-bold transition-colors ${
                showFilters || minPrice || maxPrice ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20' : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:border-slate-600'
              }`}
            >
              <Filter className="w-4 h-4" /> Filter
            </button>
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
        </div>

        {/* Collapsible Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-5 glass-card mb-2 flex flex-wrap gap-6 items-end">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Harga Minimum</label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Rp 0"
                    className="w-full sm:w-48 bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Harga Maksimum</label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Rp Tak Terhingga"
                    className="w-full sm:w-48 bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 outline-none"
                  />
                </div>
                <button
                  onClick={() => { setMinPrice(''); setMaxPrice(''); }}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm font-bold"
                >
                  Reset
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Game Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-8 custom-scrollbar">
        {GAMES.map(g => (
          <button
            key={g.id}
            onClick={() => setSelectedGame(g.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black whitespace-nowrap transition-all flex-shrink-0 ${
              selectedGame === g.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-slate-800/80 text-slate-400 border border-slate-700 hover:border-slate-600 hover:text-slate-200'
            }`}
          >
            <span>{g.icon}</span> {g.name}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass-card h-80 animate-pulse bg-slate-800/50 flex flex-col">
              <div className="h-40 bg-slate-700/50 rounded-t-2xl" />
              <div className="p-5 flex-1 flex flex-col gap-3">
                <div className="h-4 w-3/4 bg-slate-700/50 rounded" />
                <div className="h-3 w-1/2 bg-slate-700/50 rounded" />
                <div className="mt-auto h-8 w-1/3 bg-slate-700/50 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : localListings.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 flex flex-col items-center">
          <div className="w-20 h-20 rounded-3xl bg-slate-800/50 border border-slate-700 flex items-center justify-center mb-6">
            <Search className="w-10 h-10 text-slate-600" />
          </div>
          <h3 className="text-xl font-black text-white mb-2">Tidak Ada Produk</h3>
          <p className="text-slate-500 mb-6">Coba kata kunci kombo, game, atau range harga yang lebih luas.</p>
          <button onClick={() => { setSearchQuery(''); setSelectedGame('all'); setMinPrice(''); setMaxPrice(''); }}
            className="px-6 py-2.5 rounded-xl bg-indigo-600/10 text-indigo-400 font-bold hover:bg-indigo-600 hover:text-white transition-all">
            Reset Semua Filter
          </button>
        </motion.div>
      ) : (
        <>
          <p className="text-sm text-slate-500 font-bold mb-5">{localListings.length} akun ditemukan</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <AnimatePresence>
              {localListings.map((acc, i) => (
                <motion.div
                  key={acc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: Math.min(i * 0.05, 0.5) }}
                  className="h-full"
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
