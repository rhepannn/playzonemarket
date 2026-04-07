import React from 'react';
import { motion } from 'framer-motion';
import { Store } from 'lucide-react';

const SplashScreen = () => {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Logo & Text */}
      <div className="relative flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            duration: 0.3,
            type: "spring",
            stiffness: 260,
            damping: 20 
          }}
          className="w-24 h-24 rounded-[32px] bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center border-4 border-white/10 shadow-[0_0_50px_rgba(79,70,229,0.4)] mb-8"
        >
          <Store className="text-white w-12 h-12" />
        </motion.div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <h1 className="text-5xl font-black tracking-tighter text-white italic mb-2">
            PLAY<span className="text-indigo-500">ZONE</span>
          </h1>
          <p className="text-slate-500 font-bold tracking-[0.3em] uppercase text-[10px]">
             The Ultimate Market for Gamers
          </p>
        </motion.div>
      </div>

      {/* Loading Progress Bar */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-48">
        <div className="h-[2px] w-full bg-slate-900 rounded-full overflow-hidden">
          <motion.div 
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="h-full w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_15px_rgba(99,102,241,0.5)]"
          />
        </div>
      </div>

      {/* Footer Text */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 text-[10px] font-bold text-slate-600 tracking-[0.2em] uppercase"
      >
        Connecting Players Worldwide
      </motion.p>
    </motion.div>
  );
};

export default SplashScreen;
