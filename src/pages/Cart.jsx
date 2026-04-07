import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Trash2, ShieldCheck, Zap, ArrowRight, ChevronRight, CreditCard, ShoppingBag, X } from 'lucide-react';
import { MOCK_ACCOUNTS } from '../data/mockData';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const Cart = () => {
  const { cart, removeFromCart, checkout, user } = useApp();
  const navigate = useNavigate();
  const total = cart.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className="max-w-7xl mx-auto pb-20 pt-12 px-6">
       <div className="flex flex-col gap-2 mb-12">
          <h1 className="text-4xl font-black text-white italic tracking-tight uppercase">YOUR SHOPPING BAG</h1>
          <p className="text-slate-500 font-medium">Selesaikan transaksi dan dapatkan akun impianmu segera.</p>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 flex flex-col gap-6">
             <AnimatePresence mode="popLayout">
                {cart.length > 0 ? cart.map((item) => (
                   <motion.div 
                     layout
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     key={item.id} 
                     className="glass-card group overflow-hidden border-slate-800/30 flex items-center p-6 gap-8 shadow-2xl"
                   >
                       <div className="w-32 h-24 rounded-2xl bg-slate-900 overflow-hidden shrink-0 border border-slate-800">
                          <img src={item.image} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                             <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{item.gameId}</span>
                             <span className="text-slate-600 font-bold">•</span>
                             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.rank}</span>
                          </div>
                          <h3 className="text-white font-bold text-lg mb-1 truncate">{item.title}</h3>
                          <p className="text-slate-500 text-sm font-medium">Seller: <span className="text-slate-300">{item.seller}</span></p>
                       </div>
                       <div className="text-right">
                          <p className="text-xl font-black text-white mb-2">Rp {item.price.toLocaleString('id-ID')}</p>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="p-2.5 rounded-xl bg-slate-950 border border-slate-900 text-slate-600 hover:text-red-400 hover:bg-red-500/5 transition-all active:scale-90"
                          >
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                   </motion.div>
                )) : (
                   <div className="h-96 flex flex-col items-center justify-center text-center p-12 glass-card">
                      <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center mb-8 border border-slate-800">
                         <ShoppingBag className="w-10 h-10 text-slate-700" />
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
                      <p className="text-slate-500 max-w-sm mb-12">Belum ada akun yang kamu tambahkan. Mulai cari sekarang!</p>
                      <Link to="/explorer" className="btn-primary !px-12 py-4">BROWSE STORE</Link>
                   </div>
                )}
             </AnimatePresence>

             {cart.length > 0 && (
               <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 flex gap-4 items-start shadow-2xl">
                  <ShieldCheck className="w-6 h-6 text-indigo-500 shrink-0 mt-1" />
                  <p className="text-slate-400 text-sm font-medium leading-relaxed italic">
                     Data login akan dikirimkan secara otomatis via Email dan muncul di Dashboard kamu segera setelah pembayaran sukses dikonfirmasi oleh sistem.
                  </p>
               </div>
             )}
          </div>

          {/* CHECKOUT SIDEBAR */}
          {cart.length > 0 && (
            <div className="lg:col-span-4">
               <div className="glass-card p-10 sticky top-28 shadow-2xl shadow-indigo-950/20">
                  <h3 className="text-xl font-black text-white italic mb-10 tracking-tight uppercase">SUMMARY</h3>
                  
                  <div className="flex flex-col gap-6 mb-10 border-b border-slate-900 pb-10">
                     <div className="flex justify-between text-sm font-medium">
                        <span className="text-slate-500">Subtotal ({cart.length} items)</span>
                        <span className="text-white">Rp {total.toLocaleString('id-ID')}</span>
                     </div>
                     <div className="flex justify-between text-sm font-medium">
                        <span className="text-slate-500">Platform Fee</span>
                        <span className="text-emerald-400">FREE</span>
                     </div>
                     <div className="flex justify-between text-sm font-medium">
                        <span className="text-slate-500">Service Protection</span>
                        <span className="text-white">Rp 25.000</span>
                     </div>
                  </div>

                  <div className="flex justify-between items-center mb-12">
                     <span className="text-sm font-black text-slate-500 uppercase tracking-widest">Total Price</span>
                     <span className="text-3xl font-black text-white">Rp {(total + 25000).toLocaleString('id-ID')}</span>
                  </div>

                  <button 
                    onClick={() => {
                      if (!user) {
                        navigate('/auth');
                        return;
                      }
                      checkout();
                      navigate('/dashboard');
                    }}
                    className="btn-primary w-full py-5 text-lg font-black flex items-center justify-center gap-3 shadow-2xl shadow-indigo-600/30 group mb-6"
                  >
                     CHECKOUT NOW <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <div className="flex flex-col gap-4">
                     <p className="text-[10px] font-black text-slate-600 uppercase text-center tracking-[0.2em] mb-2">We Accept</p>
                     <div className="grid grid-cols-4 gap-3 opacity-30 grayscale hover:grayscale-0 hover:opacity-80 transition-all duration-700">
                        {[1,2,3,4].map(i => (
                           <div key={i} className="aspect-[4/3] bg-slate-800 rounded-xl flex items-center justify-center p-2 border border-slate-700">
                               <CreditCard className="w-5 h-5 text-slate-400" />
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          )}
       </div>
    </div>
  );
};

export default Cart;
