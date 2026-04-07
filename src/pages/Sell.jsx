import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, CheckCircle2, DollarSign, Target, Image as ImageIcon, X, ArrowRight, ArrowLeft, AlertCircle, Gamepad2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';

const GAMES = [
  { id: 'mobile-legends', name: 'Mobile Legends', icon: '⚔️' },
  { id: 'pubg', name: 'PUBG Mobile', icon: '🔫' },
  { id: 'valorant', name: 'Valorant', icon: '🎯' },
  { id: 'free-fire', name: 'Free Fire', icon: '🔥' },
  { id: 'genshin', name: 'Genshin Impact', icon: '⚡' },
  { id: 'cod-mobile', name: 'COD Mobile', icon: '🪖' },
  { id: 'clash-royale', name: 'Clash Royale', icon: '👑' },
  { id: 'other', name: 'Lainnya', icon: '🎮' },
];

const RANKS_BY_GAME = {
  'mobile-legends': ['Warrior', 'Elite', 'Master', 'Grandmaster', 'Epic', 'Legend', 'Mythic Romawi', 'Mythic Honor', 'Mythic Glory', 'Mythic Immortal'],
  'pubg': ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ace', 'Conqueror'],
  'valorant': ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal', 'Radiant'],
  'free-fire': ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Heroic', 'Grandmaster'],
  'genshin': ['AR 45', 'AR 50', 'AR 55', 'AR 60', 'C6 Multi'],
  'cod-mobile': ['Rookie', 'Veteran', 'Elite', 'Pro', 'Master', 'Legendary'],
  'clash-royale': ['1000-3000', '3000-5000', '5000-7000', '7000+'],
  'other': ['Rendah', 'Sedang', 'Tinggi', 'Maksimal'],
};

const Sell = () => {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    game: '', title: '', price: '', rank: '', rank_value: '', description: '', description_minus: '', image_url: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef(null);
  const { addListing, updateListing, user, listings } = useApp();
  const navigate = useNavigate();

  // Load edit data
  useEffect(() => {
    if (editId) {
      const listing = listings.find(l => l.id === editId);
      if (listing) {
        setFormData({
          game: listing.game || listing.category || '',
          title: listing.title || '',
          price: String(listing.price || ''),
          rank: listing.rank || '',
          rank_value: String(listing.rank_value || ''),
          description: listing.description || '',
          description_minus: listing.description_minus || '',
          image_url: listing.image_url || ''
        });
        setImagePreview(listing.image_url || '');
      }
    }
  }, [editId, listings]);

  // Guard: must be logged in and seller
  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <AlertCircle className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-white mb-3">Login Diperlukan</h2>
        <p className="text-slate-500 mb-6">Kamu perlu login sebagai Seller untuk menjual.</p>
        <button onClick={() => navigate('/auth')} className="btn-primary px-8 py-3">Login / Daftar</button>
      </div>
    );
  }

  if (user.role !== 'seller') {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <Gamepad2 className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-white mb-3">Akun Seller Diperlukan</h2>
        <p className="text-slate-500 mb-6">Kamu terdaftar sebagai Buyer. Daftar ulang dengan role Seller untuk bisa menjual.</p>
        <button onClick={() => navigate('/explorer')} className="btn-primary px-8 py-3">Lihat Marketplace</button>
      </div>
    );
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Max 5MB'); return; }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let image_url = formData.image_url;

      if (imageFile) {
        const ext = imageFile.name.split('.').pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from('product-images')
          .upload(path, imageFile, { upsert: true });
        if (upErr) throw upErr;
        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path);
        image_url = publicUrl;
      }

      const payload = {
        game: formData.game,
        title: formData.title,
        price: Number(formData.price),
        rank: formData.rank,
        rank_value: formData.rank_value ? Number(formData.rank_value) : null,
        description: formData.description,
        description_minus: formData.description_minus,
        image_url,
        category: formData.game,
      };

      if (editId) {
        await updateListing(editId, payload);
      } else {
        await addListing(payload);
      }

      setSubmitted(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedGame = GAMES.find(g => g.id === formData.game);
  const availableRanks = RANKS_BY_GAME[formData.game] || [];

  if (submitted) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          <div className="w-24 h-24 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          </div>
        </motion.div>
        <h2 className="text-3xl font-black text-white mb-3">
          {editId ? 'Produk Diperbarui!' : 'Produk Dipasang!'}
        </h2>
        <p className="text-slate-500">Mengarahkan ke dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-20">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-black text-white mb-2">
          {editId ? '✏️ Edit Produk' : '💰 Jual Akun Game'}
        </h1>
        <p className="text-slate-500">Isi detail akun yang ingin kamu jual</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3 mb-10">
        {[1, 2, 3].map(s => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-2 ${s <= step ? 'text-indigo-400' : 'text-slate-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black border-2 transition-all ${
                s < step ? 'bg-indigo-600 border-indigo-600 text-white' :
                s === step ? 'border-indigo-500 text-indigo-400' : 'border-slate-700 text-slate-600'
              }`}>
                {s < step ? '✓' : s}
              </div>
              <span className="text-sm font-bold hidden sm:block">
                {s === 1 ? 'Game & Info' : s === 2 ? 'Harga & Detail' : 'Foto & Review'}
              </span>
            </div>
            {s < 3 && <div className={`flex-1 h-[2px] rounded ${s < step ? 'bg-indigo-600' : 'bg-slate-800'} transition-all`} />}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Game selection */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="glass-card p-8 mb-6">
              <h2 className="text-xl font-black text-white mb-6">Pilih Game</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                {GAMES.map(g => (
                  <button key={g.id} type="button" onClick={() => setFormData({ ...formData, game: g.id, rank: '' })}
                    className={`p-4 rounded-2xl border-2 text-center transition-all ${
                      formData.game === g.id
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
                    }`}>
                    <div className="text-3xl mb-2">{g.icon}</div>
                    <p className={`text-xs font-black ${formData.game === g.id ? 'text-indigo-300' : 'text-slate-300'}`}>{g.name}</p>
                  </button>
                ))}
              </div>

              {formData.game && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Judul Listing</label>
                      <input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder={`Contoh: ${selectedGame?.name} ${availableRanks[5] || 'Legend'} Full Skin`}
                        className="w-full bg-slate-800/40 border border-slate-700 rounded-2xl px-4 py-3.5 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Rank / Level</label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {availableRanks.map(r => (
                          <button key={r} type="button" onClick={() => setFormData({ ...formData, rank: r })}
                            className={`py-2 px-3 rounded-xl text-xs font-black transition-all border ${
                              formData.rank === r
                                ? 'bg-indigo-500 border-indigo-500 text-white'
                                : 'border-slate-700 text-slate-400 hover:border-slate-500'
                            }`}>
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Rank Value Input for ML High Ranks */}
                    {formData.game === 'mobile-legends' && ['Mythic Romawi', 'Mythic Honor', 'Mythic Glory', 'Mythic Immortal'].includes(formData.rank) && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                          High Rank
                        </label>
                        <input
                          type="number"
                          value={formData.rank_value}
                          onChange={(e) => setFormData({ ...formData, rank_value: e.target.value })}
                          placeholder="Contoh: 900"
                          className="w-full bg-slate-800/40 border border-slate-700 rounded-2xl px-4 py-3.5 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition-colors"
                        />
                        <p className="text-[10px] text-slate-500 mt-1 italic">*Masukkan angka bintang/points (Integer)</p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
            <button
              onClick={() => { if (formData.game && formData.title && formData.rank) setStep(2); else alert('Lengkapi semua field!'); }}
              className="btn-primary w-full py-4 flex items-center justify-center gap-2">
              Lanjut <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Step 2: Price & description */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="glass-card p-8 mb-6">
              <h2 className="text-xl font-black text-white mb-6">Harga & Deskripsi</h2>
              <div className="flex flex-col gap-5">
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Harga (Rp)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="500000"
                      className="w-full bg-slate-800/40 border border-slate-700 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  {formData.price && (
                    <p className="text-xs text-indigo-400 mt-1.5 font-bold">
                      = Rp {Number(formData.price).toLocaleString('id-ID')}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Deskripsi Akun</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ceritakan kelebihan akun: hero/skin yang dimiliki, equipment, prestasi, dll..."
                    rows={4}
                    className="w-full bg-slate-800/40 border border-slate-700 rounded-2xl px-4 py-3.5 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block">⚠️ Kekurangan / Minus Akun</label>
                  <textarea
                    value={formData.description_minus}
                    onChange={(e) => setFormData({ ...formData, description_minus: e.target.value })}
                    placeholder="Jujur ceritakan kekurangan akun: hero yang kurang, rank yang pernah turun, dll..."
                    rows={3}
                    className="w-full bg-slate-800/40 border border-red-500/20 rounded-2xl px-4 py-3.5 text-sm text-white placeholder-slate-600 outline-none focus:border-red-500/50 transition-colors resize-none"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-4 rounded-2xl border border-slate-700 text-slate-400 hover:text-white transition-all flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Kembali
              </button>
              <button
                onClick={() => { if (formData.price && formData.description) setStep(3); else alert('Lengkapi semua field!'); }}
                className="flex-1 btn-primary py-4 flex items-center justify-center gap-2">
                Lanjut <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Image & review */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="glass-card p-8 mb-6">
              <h2 className="text-xl font-black text-white mb-6">Foto & Konfirmasi</h2>

              {/* Image upload */}
              <div className="mb-6">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Foto Screenshot Akun</label>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="preview" className="w-full h-48 object-cover rounded-2xl" />
                    <button onClick={() => { setImageFile(null); setImagePreview(''); setFormData({ ...formData, image_url: '' }); }}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-950/80 flex items-center justify-center">
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => fileInputRef.current?.click()}
                    className="w-full h-40 rounded-2xl border-2 border-dashed border-slate-700 hover:border-indigo-500 flex flex-col items-center justify-center gap-3 transition-colors text-slate-500 hover:text-indigo-400">
                    <Upload className="w-8 h-8" />
                    <span className="text-sm font-bold">Upload Screenshot (opsional, max 5MB)</span>
                  </button>
                )}
              </div>

              {/* Summary */}
              <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/40">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Ringkasan</h3>
                <div className="flex flex-col gap-2">
                  {[
                    { label: 'Game', value: selectedGame?.name },
                    { label: 'Judul', value: formData.title },
                    { label: 'Rank', value: formData.rank },
                    { label: 'Harga', value: `Rp ${Number(formData.price).toLocaleString()}` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-slate-500 font-bold">{label}</span>
                      <span className="text-white font-black">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-4 rounded-2xl border border-slate-700 text-slate-400 hover:text-white transition-all flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Kembali
              </button>
              <button onClick={handleSubmit} disabled={loading}
                className="flex-1 btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50">
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading...</>
                  : <>{editId ? 'Update Produk' : 'Pasang Iklan'} <CheckCircle2 className="w-4 h-4 ml-1" /></>
                }
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Sell;
