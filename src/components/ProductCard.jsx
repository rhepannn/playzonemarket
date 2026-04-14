import React from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck, Gamepad2, Tag, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductCard = ({ account }) => {
  const seller = account.profiles;
  const isVerified = seller?.is_verified;
  const rating = seller?.rating || null;
  const reviewsCount = seller?.reviews_count || 0;

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
            <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20 shadow-lg">
              {account.game || account.category}
            </span>
          </div>
          
          {/* Trust Badge Top Right */}
          {isVerified && (
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 rounded-lg bg-emerald-500/90 backdrop-blur text-white shadow-lg text-[10px] font-black flex items-center gap-1 border border-emerald-400/50">
                <BadgeCheck className="w-3 h-3" /> Verified
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="font-black text-white text-sm mb-1 line-clamp-2 group-hover:text-indigo-300 transition-colors">
            {account.title}
          </h3>
          <div className="flex items-center gap-1.5 mb-3">
            <Tag className="w-3 h-3 text-slate-600" />
            <span className="text-xs text-slate-400 font-bold">
              {account.rank} {account.rank_value ? `(${account.rank_value} ${account.game === 'mobile-legends' ? 'Stars' : ''})` : ''}
            </span>
          </div>
          
          <p className="text-xs text-slate-500/80 line-clamp-2 flex-1 mb-4 leading-relaxed">{account.description}</p>
          
          {/* Footer Card */}
          <div className="flex justify-between items-end mt-auto pt-4 border-t border-slate-800/50">
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Harga</p>
              <p className="text-lg font-black text-indigo-400">
                Rp {Number(account.price).toLocaleString('id-ID')}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Seller</p>
                  <p className="text-[11px] text-slate-300 font-bold max-w-[80px] truncate leading-tight mt-1">{seller?.full_name || seller?.username || 'Unknown'}</p>
                </div>
                <div className="w-8 h-8 rounded-xl overflow-hidden border border-slate-700 bg-slate-800 flex-shrink-0">
                  <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${seller?.username}`} alt="" className="w-full h-full object-cover" />
                </div>
              </div>
              
              {rating !== null && (
                <div className="flex items-center gap-0.5 mt-1">
                  <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                  <span className="text-[10px] text-slate-400 font-black">{rating.toFixed(1)}</span>
                  <span className="text-[9px] text-slate-600">({reviewsCount})</span>
                </div>
              )}
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

export default ProductCard;
