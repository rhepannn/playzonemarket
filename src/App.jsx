import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Store, Home as HomeIcon, PlusCircle, MessageSquare, LogIn, LayoutDashboard } from 'lucide-react';
import { useApp } from './context/AppContext';
import SplashScreen from './components/SplashScreen';

const Home     = lazy(() => import('./pages/Home'));
const Explorer = lazy(() => import('./pages/Explorer'));
const AccountDetail = lazy(() => import('./pages/AccountDetail'));
const Sell     = lazy(() => import('./pages/Sell'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Chat     = lazy(() => import('./pages/Chat'));
const Auth     = lazy(() => import('./pages/Auth'));

const Spinner = () => (
  <div className="h-[60vh] flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

const Navbar = () => {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(true);
  const { user, chatRooms } = useApp();
  const location = useLocation();

  React.useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Update background state
      setIsScrolled(currentScrollY > 20);
      
      // Hide on scroll down, show on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/', icon: HomeIcon },
    { name: 'Marketplace', path: '/explorer', icon: Store },
    { name: 'Jual Akun', path: '/sell', icon: PlusCircle },
  ];

  const unreadCount = chatRooms.length;

  return (
    <nav className={`fixed top-0 w-full z-50 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'} ${isScrolled ? 'bg-slate-950/80 backdrop-blur-lg border-b border-slate-800' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/20">
            <Store className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">PLAY<span className="text-indigo-500">ZONE</span></span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <Link key={link.path} to={link.path}
              className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-indigo-400 ${location.pathname === link.path ? 'text-indigo-400' : 'text-slate-400'}`}>
              <link.icon className="w-4 h-4" />
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {user && (
            <Link to="/chat" className="relative p-2 rounded-xl hover:bg-slate-800 transition-colors">
              <MessageSquare className="w-5 h-5 text-slate-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-slate-950">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          )}
          <div className="h-6 w-[1px] bg-slate-800 mx-1" />
          {user ? (
            <Link to="/dashboard" className="flex items-center gap-2.5 p-1.5 pr-4 rounded-xl hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700 group">
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-indigo-500/20 flex-shrink-0 transform group-hover:rotate-6 transition-transform">
                <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.username}`} alt="" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none">Logged in</span>
                <span className="text-xs font-bold text-white leading-none">{user.full_name || user.username}</span>
              </div>
            </Link>
          ) : (
            <Link to="/auth" className="flex items-center gap-2 btn-primary !py-2 !px-5 text-sm">
              <LogIn className="w-4 h-4" /> Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.25 }}
  >
    {children}
  </motion.div>
);

const App = () => {
  const { loading } = useApp();

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 selection:bg-indigo-500 selection:text-white">
        <AnimatePresence>
          {loading && <SplashScreen key="splash" />}
        </AnimatePresence>
        <Navbar />
        <main className="pt-20 px-4 md:px-6">
          <Suspense fallback={<Spinner />}>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/"           element={<PageTransition><Home /></PageTransition>} />
                <Route path="/explorer"   element={<PageTransition><Explorer /></PageTransition>} />
                <Route path="/detail/:id" element={<PageTransition><AccountDetail /></PageTransition>} />
                <Route path="/sell"       element={<PageTransition><Sell /></PageTransition>} />
                <Route path="/dashboard"  element={<PageTransition><Dashboard /></PageTransition>} />
                <Route path="/chat"       element={<PageTransition><Chat /></PageTransition>} />
                <Route path="/chat/:id"   element={<PageTransition><Chat /></PageTransition>} />
                <Route path="/auth"       element={<PageTransition><Auth /></PageTransition>} />
              </Routes>
            </AnimatePresence>
          </Suspense>
        </main>
        <footer className="mt-20 border-t border-slate-900 bg-slate-950 py-16 px-6">
          <div className="max-w-7xl mx-auto flex flex-col items-center">
            <Link to="/" className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center">
                <Store className="text-white w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-white italic tracking-tighter uppercase">PLAYZONE</span>
            </Link>
            <div className="flex gap-10 text-slate-600 text-xs font-black uppercase tracking-[0.2em] mb-8">
              <a href="#" className="hover:text-indigo-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-indigo-400 transition-colors">Terms</a>
              <a href="#" className="hover:text-indigo-400 transition-colors">Support</a>
              <a href="#" className="hover:text-indigo-400 transition-colors">Discord</a>
            </div>
            <p className="text-slate-700 text-[10px] font-black uppercase tracking-widest">
              © 2026 PLAYZONE. ALL RIGHTS RESERVED.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
