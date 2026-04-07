import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Gamepad2, Zap, Trophy, Star, Eye, EyeOff, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const features = [
  { icon: ShieldCheck, title: 'Transaksi Aman', desc: 'Sistem escrow melindungi setiap transaksi' },
  { icon: Zap, title: 'Instan & Cepat', desc: 'Proses jual beli dalam hitungan menit' },
  { icon: Trophy, title: 'Verified Sellers', desc: 'Semua penjual sudah terverifikasi' },
];

const InputField = ({ icon: Icon, label, type = 'text', placeholder, value, onChange, id }) => {
  const [focused, setFocused] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">{label}</label>
      <div className={`relative flex items-center rounded-2xl border transition-all duration-300 ${
        focused ? 'border-indigo-500 bg-indigo-500/5 shadow-[0_0_20px_rgba(99,102,241,0.15)]' : 'border-slate-700/60 bg-slate-800/40'
      }`}>
        <Icon className={`absolute left-4 w-4 h-4 transition-colors duration-300 ${focused ? 'text-indigo-400' : 'text-slate-500'}`} />
        <input
          id={id}
          type={isPassword && showPass ? 'text' : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required
          className="w-full bg-transparent pl-11 pr-11 py-3.5 text-sm text-white placeholder-slate-600 outline-none font-medium"
        />
        {isPassword && (
          <button type="button" onClick={() => setShowPass(!showPass)}
            className="absolute right-4 text-slate-500 hover:text-slate-300 transition-colors">
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
};

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('buyer');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useApp();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        navigate('/dashboard');
      } else {
        await register(formData.email, formData.password, formData.name, role);
        setError('');
        alert('✅ Registrasi berhasil! Cek email kamu untuk verifikasi, lalu login.');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ name: '', email: '', password: '' });
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-stretch">
      {/* Left branding panel */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex flex-col justify-between w-[45%] bg-gradient-to-br from-indigo-900/40 via-slate-900 to-purple-900/30 border-r border-slate-800/60 p-14 relative overflow-hidden"
      >
        <div className="absolute top-20 left-10 w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-20 right-0 w-64 h-64 bg-purple-600/15 rounded-full blur-[80px] pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Store className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white">PLAY<span className="text-indigo-400">ZONE</span></span>
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
            <Star className="w-3 h-3 text-indigo-400 fill-indigo-400" />
            <span className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">Platform #1 Indonesia</span>
          </div>
          <h2 className="text-5xl font-black text-white leading-[1.1] tracking-tight mb-5">
            Jual Beli Akun<br />
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Game Terpercaya</span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-xs">
            Marketplace eksklusif untuk transaksi akun game — aman, cepat, dan terjamin.
          </p>
        </div>

        <div className="relative z-10 flex flex-col gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16 relative overflow-hidden">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-600/8 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          key={isLogin ? 'login' : 'register'}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 mb-5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                {isLogin ? 'Secure Login' : 'Create Account'}
              </span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight mb-2">
              {isLogin ? 'Welcome Back! 👋' : 'Bergabung Sekarang'}
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              {isLogin ? 'Masuk dan lanjutkan petualangan gaming kamu.' : 'Buat akun gratis dan mulai jual beli akun game.'}
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                <p className="text-red-400 text-xs font-bold">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col gap-4"
                >
                  <InputField
                    id="name" icon={User} label="Full Name"
                    placeholder="John Doe" value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  {/* Role Selector */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Daftar Sebagai</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { val: 'buyer', label: 'Pembeli', icon: '🛒', desc: 'Beli akun game' },
                        { val: 'seller', label: 'Penjual', icon: '💰', desc: 'Jual akun game' }
                      ].map(({ val, label, icon, desc }) => (
                        <button
                          key={val} type="button"
                          onClick={() => setRole(val)}
                          className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                            role === val
                              ? 'border-indigo-500 bg-indigo-500/10'
                              : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
                          }`}
                        >
                          <div className="text-2xl mb-1">{icon}</div>
                          <p className={`text-sm font-black ${role === val ? 'text-indigo-300' : 'text-white'}`}>{label}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <InputField
              id="email" icon={Mail} label="Email Address" type="email"
              placeholder="name@example.com" value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <InputField
              id="password" icon={Lock} label="Password" type="password"
              placeholder="Min. 8 karakter" value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />

            {isLogin && (
              <div className="flex justify-end -mt-1">
                <button type="button" className="text-[11px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-colors">
                  Lupa Password?
                </button>
              </div>
            )}

            <motion.button
              type="submit" disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="mt-2 w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-600/30 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 group relative overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
              ) : (
                <>{isLogin ? 'Masuk Sekarang' : 'Buat Akun'}<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
              )}
            </motion.button>
          </form>

          <div className="relative flex items-center my-8">
            <div className="flex-1 h-[1px] bg-slate-800" />
            <span className="mx-4 text-[11px] font-black text-slate-600 uppercase tracking-widest">atau</span>
            <div className="flex-1 h-[1px] bg-slate-800" />
          </div>

          <p className="text-center text-sm text-slate-500">
            {isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
            <button type="button" onClick={switchMode}
              className="font-black text-indigo-400 hover:text-indigo-300 transition-colors underline-offset-4 hover:underline">
              {isLogin ? 'Daftar Gratis' : 'Masuk'}
            </button>
          </p>

          <div className="flex items-center justify-center gap-6 mt-8">
            {['SSL Secured', '100K+ Users', 'Trusted'].map((badge) => (
              <div key={badge} className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{badge}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
