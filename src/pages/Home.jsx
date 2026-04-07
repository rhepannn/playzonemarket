import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowRight, Star, ShieldCheck, Zap, Users, Gamepad2, Tag, BadgeCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

const GAMES = [
  { id: 'mobile-legends', name: 'Mobile Legends', icon: '⚔️' },
  { id: 'pubg', name: 'PUBG Mobile', icon: '🔫' },
  { id: 'valorant', name: 'Valorant', icon: '🎯' },
  { id: 'free-fire', name: 'Free Fire', icon: '🔥' },
  { id: 'genshin', name: 'Genshin Impact', icon: '⚡' },
];

const Hero = () => (
  <section className="relative overflow-hidden pt-12 pb-24">
    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full" />
    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 bg-purple-600/10 blur-[100px] rounded-full" />
    <div className="max-w-7xl mx-auto flex flex-col items-center text-center px-6 relative z-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-6 flex items-center gap-2"
      >
        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
        Platform Terpercaya #1 Untuk Game Account
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight"
      >
        Dapatkan Akun <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Sultan</span>{' '}
        <br />
        Dengan Harga{' '}
        <span className="underline decoration-indigo-600 decoration-8 underline-offset-8 hover:decoration-indigo-400 cursor-default">
          Menawan
        </span>.
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-slate-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed font-medium"
      >
        Marketplace khusus jual beli akun game paling aman, cepat, dan terpercaya.
        Mulai dari Mobile Legends, PUBG, hingga Valorant - Semua ada disini.
      </motion.p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link to="/explorer" className="btn-primary flex items-center gap-2 text-lg px-8 py-4">
          Mulai Cari Akun <ArrowRight className="w-5 h-5" />
        </Link>
        <Link to="/sell" className="btn-outline flex items-center gap-2 text-lg px-8 py-4">
          Jual Akun Kamu
        </Link>
      </div>
    </div>
  </section>
);

const FeatureSection = () => (
  <section className="py-20 max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
    {[
      { icon: ShieldCheck, title: 'Transaksi Aman', desc: 'Chat langsung dengan seller dan negosiasi harga sebelum deal.' },
      { icon: Zap, title: 'Proses Cepat', desc: 'Chat real-time, seller langsung merespon dalam hitungan menit.' },
      { icon: Users, title: 'Seller Verified', desc: 'Semua seller sudah melalui proses verifikasi akun kami.' },
    ].map((f, i) => (
      <motion.div
        key={i}
        whileHover={{ y: -5 }}
        className="glass-card p-8 flex flex-col gap-4 text-center md:text-left shadow-2xl shadow-indigo-950/20"
      >
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 mx-auto md:mx-0">
          <f.icon className="w-7 h-7 text-indigo-400" />
        </div>
        <h3 className="text-xl font-bold text-white">{f.title}</h3>
        <p className="text-slate-500 font-medium leading-relaxed">{f.desc}</p>
      </motion.div>
    ))}
  </section>
);

const CategorySection = () => (
  <section className="py-12 max-w-7xl mx-auto px-6">
    <div className="flex items-center justify-between mb-8">
      <h2 className="text-2xl font-bold text-white">Cari Berdasarkan Game</h2>
      <Link to="/explorer" className="text-indigo-400 text-sm font-bold flex items-center gap-1 hover:underline">
        Lihat Semua <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {GAMES.map((game) => (
        <Link key={game.id} to={`/explorer?game=${game.id}`}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="glass-card p-6 flex flex-col items-center gap-3 cursor-pointer group"
          >
            <div className="text-4xl group-hover:drop-shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all transform group-hover:scale-110">
              {game.icon}
            </div>
            <span className="text-white text-sm font-bold group-hover:text-indigo-400 transition-colors text-center">
              {game.name}
            </span>
          </motion.div>
        </Link>
      ))}
    </div>
  </section>
);

const ListingCard = ({ acc }) => {
  const seller = acc.profiles;
  return (
    <Link to={`/detail/${acc.id}`}>
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ duration: 0.2 }}
        className="glass-card overflow-hidden group border border-slate-800/50 hover:border-indigo-500/40 h-full flex flex-col"
      >
        <div className="aspect-video bg-slate-800 relative overflow-hidden flex-shrink-0">
          {acc.image_url ? (
            <img src={acc.image_url} alt={acc.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Gamepad2 className="w-10 h-10 text-slate-700" />
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
              {acc.game || acc.category}
            </span>
          </div>
        </div>
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="text-white font-bold text-sm mb-2 line-clamp-2 group-hover:text-indigo-300 transition-colors">
            {acc.title}
          </h3>
          <div className="flex items-center gap-1 mb-3">
            <Tag className="w-3 h-3 text-slate-600" />
            <span className="text-xs text-slate-500 font-bold">{acc.rank}</span>
          </div>
          <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-800/50">
            <span className="text-lg font-extrabold text-indigo-400">
              Rp {Number(acc.price).toLocaleString('id-ID')}
            </span>
            <div className="flex items-center gap-1">
              <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-slate-500 font-bold">{seller?.full_name || seller?.username || 'Seller'}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

const Home = () => {
  const { listings } = useApp();
  const latest = listings.slice(0, 8);

  return (
    <div className="pb-20">
      <Hero />
      <FeatureSection />
      <CategorySection />

      {/* Latest listings from Supabase */}
      {latest.length > 0 && (
        <section className="py-16 max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Zap className="text-indigo-400 w-6 h-6 fill-indigo-400" />
              Akun Terbaru
            </h2>
            <Link to="/explorer" className="text-indigo-400 text-sm font-bold flex items-center gap-1 hover:underline">
              Lihat Semua <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {latest.map(acc => <ListingCard key={acc.id} acc={acc} />)}
          </div>
        </section>
      )}

      {/* Empty state jika belum ada listing */}
      {listings.length === 0 && (
        <section className="py-16 max-w-7xl mx-auto px-6 text-center">
          <div className="glass-card p-16 max-w-xl mx-auto">
            <div className="text-5xl mb-6">🎮</div>
            <h3 className="text-2xl font-black text-white mb-3">Marketplace Masih Kosong</h3>
            <p className="text-slate-500 mb-8">Jadilah seller pertama dan mulai jual akun game kamu!</p>
            <Link to="/auth" className="btn-primary px-8 py-3 inline-flex items-center gap-2">
              Daftar & Jual Sekarang <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <div className="rounded-[32px] bg-gradient-to-tr from-indigo-900 to-indigo-600 p-10 md:p-16 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-xl text-center md:text-left">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-4 italic tracking-tight">
                PUNYA AKUN JARANG DIPAKE?
              </h2>
              <p className="text-indigo-100 text-lg font-medium opacity-90 leading-relaxed">
                Jual disini dan dapatkan uang tambahan. Transaksi cepat, aman, dan chat langsung dengan pembeli.
              </p>
            </div>
            <Link to="/sell" className="bg-white text-indigo-700 px-10 py-5 rounded-2xl font-black text-xl hover:bg-slate-100 transition-all shadow-2xl hover:-translate-y-1 whitespace-nowrap flex-shrink-0">
              JUAL SEKARANG
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
